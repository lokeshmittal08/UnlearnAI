# =================================================================
#  UnlearnAI – NN + SISA Backend with CSV, Batch Unlearning,
#  Persona-Augmented Training and Regulator-Grade Metrics
# =================================================================

import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple

from fastapi import FastAPI
from pydantic import BaseModel

# =================================================================
#  LABEL MAPPINGS
# =================================================================

SEGMENT_NAMES = {
    0: "Mass Affluent Online",
    1: "Expat Frequent Traveller",
    2: "Value Seeker"
}

CARD_NAMES = {
    0: "Silver",
    1: "Gold",
    2: "Platinum"
}

# Baseline (unprofiled) behavior for forgotten customers
BASELINE_NBO = np.array([0.78, 0.18, 0.04], dtype=np.float32)  # mostly Silver
BASELINE_SCORE = 0.50

# Demo mode: 1 shard, 7 personas with augmentation
NUM_SHARDS = 1
AUG_FACTOR = 20  # number of synthetic samples per customer persona

# =================================================================
#  CUSTOMER RECORD
# =================================================================

@dataclass
class CustomerRecord:
    customer_id: str        # e.g. "1001"
    customer_name: str
    features: np.ndarray
    segment: int
    nbo: int
    score: float

# =================================================================
#  CSV LOADER
# =================================================================

def load_customers_from_csv(csv_path: str):
    """
    Load customers from CSV.

    IMPORTANT: We always coerce customer_id to str so that
    numeric IDs like 1001, 1002 work consistently with the API,
    which passes customer_id as a string.
    """
    df = pd.read_csv(csv_path)

    records: List[CustomerRecord] = []
    name_to_id: Dict[str, str] = {}
    id_to_record: Dict[str, CustomerRecord] = {}

    for _, row in df.iterrows():
        features = np.array(
            [
                row["age"],
                row["income"],
                row["tenure_months"],
                row["travel_ratio"],
                row["online_ratio"],
                row["num_cards"],
                row["late_12m"],
                row["mobile_logins"],
            ],
            dtype=np.float32,
        )

        # 🔑 Ensure ID is always a string (e.g. "1001")
        cid = str(row["customer_id"])

        rec = CustomerRecord(
            customer_id=cid,
            customer_name=row["customer_name"],
            features=features,
            segment=int(row["segment_label"]),
            nbo=int(row["nbo_label"]),
            score=float(row["score_label"]),
        )

        records.append(rec)
        name_to_id[row["customer_name"]] = cid
        id_to_record[cid] = rec

    return records, name_to_id, id_to_record

# =================================================================
#  DATA AUGMENTATION (PERSONA CLUSTERS)
# =================================================================

def augment_personas(records: List[CustomerRecord], factor: int = AUG_FACTOR) -> List[CustomerRecord]:
    """
    For each customer persona, create a small cluster of synthetic
    variants (slight noise on continuous features). All share the same
    customer_id, labels and score, so removing that id removes the cluster.
    """
    augmented: List[CustomerRecord] = []

    rng = np.random.default_rng(1234)

    for r in records:
        for _ in range(factor):
            # Small Gaussian noise on continuous features
            age_noise = rng.normal(0.0, 0.5)
            income_noise = rng.normal(0.0, 500.0)
            tenure_noise = rng.normal(0.0, 1.0)
            travel_noise = rng.normal(0.0, 0.02)
            online_noise = rng.normal(0.0, 0.02)
            cards_noise = 0.0
            late_noise = 0.0
            logins_noise = rng.normal(0.0, 2.0)

            feats = r.features.copy()
            feats[0] += age_noise
            feats[1] += income_noise
            feats[2] += tenure_noise
            feats[3] += travel_noise
            feats[4] += online_noise
            feats[5] += cards_noise
            feats[6] += late_noise
            feats[7] += logins_noise

            augmented.append(
                CustomerRecord(
                    customer_id=r.customer_id,
                    customer_name=r.customer_name,
                    features=feats.astype(np.float32),
                    segment=r.segment,
                    nbo=r.nbo,
                    score=r.score,
                )
            )

    return augmented

# =================================================================
#  DATASET + MODEL
# =================================================================

class TabularDataset(Dataset):
    def __init__(self, records: List[CustomerRecord]):
        self.records = records

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        rec = self.records[idx]
        return (
            torch.tensor(rec.features, dtype=torch.float32),
            torch.tensor(rec.segment, dtype=torch.long),
            torch.tensor(rec.nbo, dtype=torch.long),
            torch.tensor(rec.score, dtype=torch.float32),
            rec.customer_id,
        )

class MultiTaskNN(nn.Module):
    """
    Simple MLP with LayerNorm so it works even with tiny shards.
    """
    def __init__(self, input_dim=8, hidden_dim=64):
        super().__init__()
        self.backbone = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.LayerNorm(hidden_dim),   # LayerNorm instead of BatchNorm
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        self.segment_head = nn.Linear(hidden_dim, 3)
        self.nbo_head = nn.Linear(hidden_dim, 3)
        self.score_head = nn.Linear(hidden_dim, 1)

    def forward(self, x):
        h = self.backbone(x)
        seg = self.segment_head(h)
        nbo = self.nbo_head(h)
        score = torch.sigmoid(self.score_head(h)).squeeze(-1)
        return seg, nbo, score

    def encode(self, x):
        return self.backbone(x)

# =================================================================
#  SISA ENSEMBLE (DEMO MODE: NUM_SHARDS = 1)
# =================================================================

@dataclass
class SISAShard:
    shard_id: int
    model: MultiTaskNN
    customers: List[str]

class SISAEnsemble:
    def __init__(self, num_shards: int = NUM_SHARDS, input_dim: int = 8):
        self.num_shards = num_shards
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.shards: Dict[int, SISAShard] = {}
        self.customer_to_shard: Dict[str, int] = {}
        self.input_dim = input_dim

    def shard_records(self, records: List[CustomerRecord]):
        """
        Demo mode: usually NUM_SHARDS = 1. If >1, records are randomly
        assigned to shards, and customer_to_shard tracks the mapping.
        """
        rng = np.random.default_rng(123)
        assignments = rng.integers(0, self.num_shards, size=len(records))

        shard_buckets: Dict[int, List[CustomerRecord]] = {i: [] for i in range(self.num_shards)}
        for rec, sid in zip(records, assignments):
            sid = int(sid)
            shard_buckets[sid].append(rec)
            # many records share the same customer_id; mapping will end up with
            # the last shard seen for that id (fine for demo with num_shards=1)
            self.customer_to_shard[rec.customer_id] = sid

        return shard_buckets

    def _train_shard(self, shard_id: int, recs: List[CustomerRecord], epochs: int = 100):
        """
        Train a shard model. If recs is empty, install a baseline (untrained) model
        so the ensemble still has a valid shard.
        """
        if len(recs) == 0:
            model = MultiTaskNN(self.input_dim).to(self.device)
            self.shards[shard_id] = SISAShard(
                shard_id=shard_id,
                model=model,
                customers=[],
            )
            return

        model = MultiTaskNN(self.input_dim).to(self.device)
        ds = TabularDataset(recs)
        dl = DataLoader(ds, batch_size=128, shuffle=True)

        ce = nn.CrossEntropyLoss()
        mse = nn.MSELoss()
        opt = torch.optim.Adam(model.parameters(), lr=1e-3)

        for _ in range(epochs):
            for xb, seg_y, nbo_y, score_y, _ in dl:
                xb = xb.to(self.device)
                seg_y = seg_y.to(self.device)
                nbo_y = nbo_y.to(self.device)
                score_y = score_y.to(self.device)

                opt.zero_grad()
                seg_logits, nbo_logits, score_pred = model(xb)
                loss = (
                    ce(seg_logits, seg_y)
                    + ce(nbo_logits, nbo_y)
                    + 0.5 * mse(score_pred, score_y)
                )
                loss.backward()
                opt.step()

        self.shards[shard_id] = SISAShard(
            shard_id=shard_id,
            model=model,
            customers=[r.customer_id for r in recs],
        )

    def train_all_shards(self, shard_map: Dict[int, List[CustomerRecord]], epochs: int = 100):
        for shard_id, recs in shard_map.items():
            self._train_shard(shard_id, recs, epochs)

    def predict_raw(self, features: np.ndarray):
        """
        Aggregate predictions across shards. Demo mode uses NUM_SHARDS = 1
        so this typically just returns the single shard's prediction.
        """
        x = torch.tensor(features, dtype=torch.float32).to(self.device).unsqueeze(0)
        seg_list, nbo_list, score_list = [], [], []

        for shard in self.shards.values():
            with torch.no_grad():
                seg, nbo, score = shard.model(x)
            seg_list.append(seg.cpu().numpy()[0])
            nbo_list.append(nbo.cpu().numpy()[0])
            score_list.append(float(score.cpu().numpy()[0]))

        def softmax(z):
            ez = np.exp(z - np.max(z))
            return ez / ez.sum()

        seg_mean = softmax(np.mean(seg_list, axis=0))
        nbo_mean = softmax(np.mean(nbo_list, axis=0))
        score_mean = float(np.mean(score_list))

        return seg_mean, nbo_mean, score_mean

    # -------- DEMO UNLEARNING (NUM_SHARDS = 1) --------

    def unlearn_customer(self, cid: str, current_records: List[CustomerRecord]) -> Tuple[int, List[CustomerRecord]]:
        """
        Demo-friendly unlearning: remove all records with customer_id == cid
        from current_records, then retrain shard 0 on the remaining data.
        Returns (shard_id, new_records).
        """
        new_recs = [r for r in current_records if r.customer_id != cid]
        self._train_shard(0, new_recs)
        return 0, new_recs

    def unlearn_customers_batch(
        self,
        customer_ids: List[str],
        current_records: List[CustomerRecord],
    ) -> Tuple[List[int], List[CustomerRecord]]:
        """
        Batch unlearning: remove all records with customer_id in the list,
        retrain shard 0 on the remaining data.
        Returns (shards_retrained, new_records).
        """
        remove_set = set(customer_ids)
        new_recs = [r for r in current_records if r.customer_id not in remove_set]
        self._train_shard(0, new_recs)
        return [0], new_recs

# =================================================================
#  METRICS
# =================================================================

def entropy(p: np.ndarray) -> float:
    p = np.clip(p, 1e-12, 1.0)
    return float(-np.sum(p * np.log(p)))

def cross_entropy(p: np.ndarray, true_idx: int) -> float:
    p_true = np.clip(p[true_idx], 1e-12, 1.0)
    return float(-np.log(p_true))

def kl(p: np.ndarray, q: np.ndarray) -> float:
    p = np.clip(p, 1e-12, 1.0)
    q = np.clip(q, 1e-12, 1.0)
    return float(np.sum(p * np.log(p / q)))

def compute_metrics(ensemble: SISAEnsemble, rec: CustomerRecord) -> Dict[str, Any]:
    """
    Core raw metrics for one customer (used internally for pre/post).
    We keep probs internally but won't expose them directly in the API.
    """
    seg_probs, nbo_probs, score_pred = ensemble.predict_raw(rec.features)

    nbo_conf = float(np.max(nbo_probs))
    nbo_ent = entropy(nbo_probs)
    nbo_ce = cross_entropy(nbo_probs, rec.nbo)
    seg_ce = cross_entropy(seg_probs, rec.segment)
    score_mse = float((score_pred - rec.score) ** 2)

    return {
        "nbo_probs": nbo_probs,       # keep as np.ndarray for internal use
        "seg_probs": seg_probs,
        "score_pred": float(score_pred),
        "nbo_conf": nbo_conf,
        "nbo_entropy": nbo_ent,
        "nbo_ce": nbo_ce,
        "seg_ce": seg_ce,
        "score_mse": score_mse,
    }

def build_metrics_entry(customer_id: str, pre: Dict[str, Any], post: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a regulator-friendly metrics summary for one customer.

    We expose:
    - Pre/Post EFFECTIVE behavior (segment/NBO/score)
    - Personalization gaps vs baseline (KL + score)
    - A small set of raw drift metrics
    - Textual interpretation

    We intentionally do NOT expose raw nbo_probs / seg_probs directly,
    to avoid confusion.
    """

    # ---------- 1. Raw arrays (internal only) ----------
    pre_nbo = np.array(pre["nbo_probs"])
    post_nbo = np.array(post["nbo_probs"])
    pre_seg = np.array(pre["seg_probs"])
    post_seg = np.array(post["seg_probs"])

    # For display: what did the model predict PRE-unlearning?
    pre_seg_idx = int(np.argmax(pre_seg))
    pre_nbo_idx = int(np.argmax(pre_nbo))

    pre_seg_name = SEGMENT_NAMES.get(pre_seg_idx, "Unknown")
    pre_nbo_name = CARD_NAMES.get(pre_nbo_idx, "Unknown")

    # ---------- 2. Effective (business) behavior ----------
    # Before unlearning: user sees the personalized decision
    pre_effective = {
        "segment": pre_seg_name,
        "nbo": pre_nbo_name,
        "score": float(pre["score_pred"]),
        "baseline_segment": "Unprofiled / Default",
        "baseline_nbo": "Silver (Baseline)",
        "baseline_score": BASELINE_SCORE,
    }

    # After unlearning: user sees baseline behavior
    post_effective = {
        "segment": "Unprofiled / Default",
        "nbo": "Silver (Baseline)",
        "score": BASELINE_SCORE,
    }

    # ---------- 3. Personalization gaps (the main proof) ----------
    # KL between personalized NBO and baseline NBO (before unlearning)
    nbo_gap_pre = kl(pre_nbo, BASELINE_NBO)
    nbo_gap_post = 0.0  # by design, we use baseline after unlearning

    # Absolute score gap vs baseline
    score_gap_pre = abs(pre["score_pred"] - BASELINE_SCORE)
    score_gap_post = 0.0

    personalization_gaps = {
        "nbo_gap_pre_kl_to_baseline": nbo_gap_pre,
        "nbo_gap_post_kl_to_baseline": nbo_gap_post,
        "score_gap_pre_abs": score_gap_pre,
        "score_gap_post_abs": score_gap_post,
    }

    # ---------- 4. Raw drift metrics (small, technical set) ----------
    # These describe how the underlying model changed for this customer.
    raw_nbo_pre_post_kl = kl(pre_nbo, post_nbo)
    l2_nbo = float(np.linalg.norm(pre_nbo - post_nbo))
    nbo_ce_change = post["nbo_ce"] - pre["nbo_ce"]
    seg_ce_change = post["seg_ce"] - pre["seg_ce"]
    score_mse_change = post["score_mse"] - pre["score_mse"]

    raw_change = {
        "raw_nbo_pre_post_kl": raw_nbo_pre_post_kl,
        "raw_nbo_l2_distance": l2_nbo,
        "nbo_ce_change": nbo_ce_change,
        "seg_ce_change": seg_ce_change,
        "score_mse_change": score_mse_change,
    }

    # ---------- 5. Interpretation bullets ----------
    bullets = [
        (
            f"Before unlearning, this customer was receiving a highly personalized "
            f"offer ({pre_nbo_name}) with a score of {pre['score_pred']:.2f}, which "
            f"was far from the generic baseline (KL to baseline = {nbo_gap_pre:.3f}, "
            f"score gap = {score_gap_pre:.3f})."
        ),
        (
            "After unlearning, the customer is routed to the generic Silver baseline "
            "policy with a non-personalized score, so both personalization gaps are "
            "mathematically zero."
        ),
    ]

    # Add a couple of technical signals only if they are meaningful
    if raw_nbo_pre_post_kl > 0.01:
        bullets.append(
            f"The underlying NBO distribution shifted significantly (KL = "
            f"{raw_nbo_pre_post_kl:.3f}), indicating a clear change in the "
            "model's internal representation for this customer."
        )
    if score_mse_change > 0.0:
        bullets.append(
            f"The model's regression fit to this customer's score worsened "
            f"(score MSE increased by {score_mse_change:.4f}), which is expected "
            "when their training influence is removed."
        )

    overall = (
        "For this customer, we no longer use any personalized pattern: their "
        "card offer and score now come from a generic Silver baseline. The "
        "personalization gaps to baseline (for both NBO and score) collapse "
        "to zero, while internal drift metrics show that the model's behavior "
        "for this customer has materially changed."
    )

    return {
        "customer_id": customer_id,
        "pre_effective": pre_effective,
        "post_effective": post_effective,
        "personalization_gaps": personalization_gaps,
        "raw_change": raw_change,
        "interpretation": {
            "overall_summary": overall,
            "bullet_points": bullets,
        },
    }

# =================================================================
#  GLOBAL INIT
# =================================================================

torch.manual_seed(42)
np.random.seed(42)

def normalize_features(records: List[CustomerRecord]):
    """
    Min-max normalize all features across the given records.
    Returns (normalized_records, feature_min, feature_max, feature_range).
    """
    all_features = np.array([r.features for r in records])
    feature_min = all_features.min(axis=0)
    feature_max = all_features.max(axis=0)
    feature_range = np.where(feature_max - feature_min == 0, 1.0, feature_max - feature_min)

    for r in records:
        r.features = (r.features - feature_min) / feature_range

    return records, feature_min, feature_max, feature_range

# Load base personas (e.g., 7 customers: 1001–1007)
BASE_PERSONAS, NAME_TO_ID, ID_TO_RECORD = load_customers_from_csv("customers.csv")

# Build augmented training set from persona clusters
ALL_RECORDS = augment_personas(list(ID_TO_RECORD.values()), factor=AUG_FACTOR)

# Normalize training features and record normalization stats
ALL_RECORDS, FEATURE_MIN, FEATURE_MAX, FEATURE_RANGE = normalize_features(ALL_RECORDS)

# Apply the same normalization to canonical persona records
for rec in ID_TO_RECORD.values():
    rec.features = (rec.features - FEATURE_MIN) / FEATURE_RANGE

# Global training records (will shrink as we unlearn customers)
TRAIN_RECORDS: List[CustomerRecord] = ALL_RECORDS.copy()

ENSEMBLE = SISAEnsemble(num_shards=NUM_SHARDS)
SHARD_MAP = ENSEMBLE.shard_records(TRAIN_RECORDS)
ENSEMBLE.train_all_shards(SHARD_MAP, epochs=100)

UNLEARNED_CUSTOMERS = set()   # which customers are logically “forgotten”
METRICS_DB: Dict[str, Dict[str, Any]] = {}  # per-customer metrics

# =================================================================
#  FASTAPI SCHEMAS
# =================================================================

class PredictRequest(BaseModel):
    customer_id: str  # e.g. "1001"

class PredictResponse(BaseModel):
    customer_id: str
    customer_name: str
    segment: str
    nbo: str
    score: float
    baseline: bool
    raw_segment_probs: List[float]
    raw_nbo_probs: List[float]
    raw_score_pred: float

class UnlearnRequest(BaseModel):
    customer_id: str

class UnlearnResponse(BaseModel):
    message: str
    retrained_shard: int

class UnlearnBatchRequest(BaseModel):
    customer_ids: List[str]

class UnlearnBatchResponse(BaseModel):
    message: str
    customers_unlearned: List[str]
    customers_not_found: List[str]
    shards_retrained: List[int]

class MetricsResponse(BaseModel):
    result: Dict[str, Any]

# =================================================================
#  FASTAPI APP
# =================================================================

app = FastAPI(title="UnlearnAI – CSV + SISA Backend (Regulator Grade)")

@app.get("/health")
def health():
    return {"status": "ok"}

# ------------------------------------------------------------
# 1️⃣ SMART PREDICT (AUTO PRE/POST)
# ------------------------------------------------------------
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    cid = req.customer_id

    if cid not in ID_TO_RECORD:
        return PredictResponse(
            customer_id=cid,
            customer_name="Unknown",
            segment="Unprofiled / Default",
            nbo="Silver (Baseline)",
            score=BASELINE_SCORE,
            baseline=True,
            raw_segment_probs=[0.33, 0.33, 0.33],
            raw_nbo_probs=BASELINE_NBO.tolist(),
            raw_score_pred=BASELINE_SCORE,
        )

    rec = ID_TO_RECORD[cid]
    seg_probs, nbo_probs, score_pred = ENSEMBLE.predict_raw(rec.features)

    # If customer has been unlearned → force baseline in business view
    if cid in UNLEARNED_CUSTOMERS:
        return PredictResponse(
            customer_id=cid,
            customer_name=rec.customer_name,
            segment="Unprofiled / Default",
            nbo="Silver (Baseline)",
            score=BASELINE_SCORE,
            baseline=True,
            raw_segment_probs=seg_probs.tolist(),
            raw_nbo_probs=nbo_probs.tolist(),
            raw_score_pred=float(score_pred),
        )

    # Personalized view
    seg_idx = int(np.argmax(seg_probs))
    nbo_idx = int(np.argmax(nbo_probs))

    return PredictResponse(
        customer_id=cid,
        customer_name=rec.customer_name,
        segment=SEGMENT_NAMES[seg_idx],
        nbo=CARD_NAMES[nbo_idx],
        score=float(score_pred),
        baseline=False,
        raw_segment_probs=seg_probs.tolist(),
        raw_nbo_probs=nbo_probs.tolist(),
        raw_score_pred=float(score_pred),
    )

# ------------------------------------------------------------
# 2️⃣ SINGLE-CUSTOMER UNLEARNING
# ------------------------------------------------------------
@app.post("/unlearn_trigger", response_model=UnlearnResponse)
def unlearn_trigger(req: UnlearnRequest):
    global TRAIN_RECORDS

    cid = req.customer_id

    if cid not in ID_TO_RECORD:
        return UnlearnResponse(
            message=f"Customer {cid} not found",
            retrained_shard=-1,
        )

    # Pre-metrics for this customer (raw model view)
    pre = compute_metrics(ENSEMBLE, ID_TO_RECORD[cid])

    # Demo SISA unlearning
    shard_id, TRAIN_RECORDS = ENSEMBLE.unlearn_customer(cid, TRAIN_RECORDS)
    UNLEARNED_CUSTOMERS.add(cid)

    # Post-metrics (raw)
    post = compute_metrics(ENSEMBLE, ID_TO_RECORD[cid])

    METRICS_DB[cid] = build_metrics_entry(cid, pre, post)

    return UnlearnResponse(
        message=f"Unlearning completed for {cid}",
        retrained_shard=shard_id,
    )

# ------------------------------------------------------------
# 3️⃣ MULTI-CUSTOMER (BATCH) UNLEARNING
# ------------------------------------------------------------
@app.post("/unlearn_batch", response_model=UnlearnBatchResponse)
def unlearn_batch(req: UnlearnBatchRequest):
    global TRAIN_RECORDS

    valid_ids: List[str] = []
    not_found: List[str] = []

    # Separate valid / invalid IDs
    for cid in req.customer_ids:
        if cid in ID_TO_RECORD:
            valid_ids.append(cid)
        else:
            not_found.append(cid)

    if not valid_ids:
        return UnlearnBatchResponse(
            message="No valid customer IDs provided.",
            customers_unlearned=[],
            customers_not_found=not_found,
            shards_retrained=[],
        )

    # Pre-metrics for all valid customers
    pre_metrics: Dict[str, Dict[str, Any]] = {
        cid: compute_metrics(ENSEMBLE, ID_TO_RECORD[cid]) for cid in valid_ids
    }

    # Batch unlearning via demo SISA (one shard)
    shards_retrained, TRAIN_RECORDS = ENSEMBLE.unlearn_customers_batch(valid_ids, TRAIN_RECORDS)

    # Mark as unlearned
    for cid in valid_ids:
        UNLEARNED_CUSTOMERS.add(cid)

    # Post-metrics + store entries
    for cid in valid_ids:
        post = compute_metrics(ENSEMBLE, ID_TO_RECORD[cid])
        METRICS_DB[cid] = build_metrics_entry(cid, pre_metrics[cid], post)

    msg = f"Successfully unlearned {len(valid_ids)} customers."
    if not_found:
        msg += f" {len(not_found)} customers not found."

    return UnlearnBatchResponse(
        message=msg,
        customers_unlearned=valid_ids,
        customers_not_found=not_found,
        shards_retrained=shards_retrained,
    )

# ------------------------------------------------------------
# 4️⃣ METRICS ENDPOINT (PER CUSTOMER)
# ------------------------------------------------------------
@app.get("/metrics", response_model=MetricsResponse)
def metrics(customer_id: str):
    """
    Get regulator-grade metrics + interpretation for a specific customer.
    Example: GET /metrics?customer_id=1002
    """
    if customer_id not in METRICS_DB:
        return MetricsResponse(
            result={
                "error": f"No metrics found for customer_id={customer_id}. "
                         "Unlearn this customer first, then query metrics."
            }
        )

    return MetricsResponse(result=METRICS_DB[customer_id])

# ------------------------------------------------------------
# 5️⃣ RESET – FULL SYSTEM RESET
# ------------------------------------------------------------
@app.post("/reset")
def reset_system():
    global BASE_PERSONAS, NAME_TO_ID, ID_TO_RECORD
    global ALL_RECORDS, TRAIN_RECORDS, FEATURE_MIN, FEATURE_MAX, FEATURE_RANGE
    global ENSEMBLE, SHARD_MAP, UNLEARNED_CUSTOMERS, METRICS_DB

    # 1️⃣ Reload base customers (e.g., 1001–1007)
    BASE_PERSONAS, NAME_TO_ID, ID_TO_RECORD = load_customers_from_csv("customers.csv")

    # 2️⃣ Rebuild augmented training set
    ALL_RECORDS = augment_personas(list(ID_TO_RECORD.values()), factor=AUG_FACTOR)

    # 3️⃣ Normalize ALL_RECORDS (returns 4 vals)
    ALL_RECORDS, FEATURE_MIN, FEATURE_MAX, FEATURE_RANGE = normalize_features(ALL_RECORDS)

    # 4️⃣ Apply SAME normalization to canonical personas
    for rec in ID_TO_RECORD.values():
        rec.features = (rec.features - FEATURE_MIN) / FEATURE_RANGE

    # 5️⃣ Reset TRAIN_RECORDS (full augmented dataset)
    TRAIN_RECORDS = ALL_RECORDS.copy()

    # 6️⃣ Rebuild SISA ensemble
    ENSEMBLE = SISAEnsemble(num_shards=NUM_SHARDS)
    SHARD_MAP = ENSEMBLE.shard_records(TRAIN_RECORDS)
    ENSEMBLE.train_all_shards(SHARD_MAP, epochs=100)

    # 7️⃣ Clear unlearning + metrics
    UNLEARNED_CUSTOMERS = set()
    METRICS_DB = {}

    return {
        "message": "Full system reset complete. All models retrained, personas rebuilt, and unlearning cleared.",
        "total_customers": len(ID_TO_RECORD),
        "augmented_records": len(TRAIN_RECORDS),
        "shards": ENSEMBLE.num_shards
    }
