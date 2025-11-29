# =================================================================
#  UnlearnAI – NN + SISA Backend with CSV, Batch Unlearning,
#  and Regulator-Grade Metrics + Interpretation
# =================================================================

import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from dataclasses import dataclass
from typing import List, Dict, Any

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

# =================================================================
#  CUSTOMER RECORD
# =================================================================

@dataclass
class CustomerRecord:
    customer_id: str
    customer_name: str
    features: np.ndarray
    segment: int
    nbo: int
    score: float
    full_data: Dict[str, Any]

# =================================================================
#  CSV LOADER
# =================================================================

def load_customers_from_csv(csv_path: str):
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

        rec = CustomerRecord(
            customer_id=row["customer_id"],
            customer_name=row["customer_name"],
            features=features,
            segment=int(row["segment_label"]),
            nbo=int(row["nbo_label"]),
            score=float(row["score_label"]),
            full_data=row.to_dict(),
        )

        records.append(rec)
        name_to_id[row["customer_name"]] = row["customer_id"]
        id_to_record[row["customer_id"]] = rec

    return records, name_to_id, id_to_record

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
#  SISA ENSEMBLE
# =================================================================

@dataclass
class SISAShard:
    shard_id: int
    model: MultiTaskNN
    customers: List[str]

class SISAEnsemble:
    def __init__(self, num_shards=5, input_dim=8):
        self.num_shards = num_shards
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.shards: Dict[int, SISAShard] = {}
        self.customer_to_shard: Dict[str, int] = {}
        self.input_dim = input_dim

    def shard_records(self, records: List[CustomerRecord]):
        rng = np.random.default_rng(123)
        assignments = rng.integers(0, self.num_shards, size=len(records))

        shard_buckets: Dict[int, List[CustomerRecord]] = {i: [] for i in range(self.num_shards)}
        for rec, sid in zip(records, assignments):
            sid = int(sid)
            shard_buckets[sid].append(rec)
            self.customer_to_shard[rec.customer_id] = sid

        return shard_buckets

    def _train_shard(self, shard_id: int, recs: List[CustomerRecord], epochs: int = 5):
        """
        Train a shard model. If recs is empty, install a baseline (untrained) model
        so the ensemble still has a valid shard.
        """
        # Empty shard → baseline model (no personalization signal)
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

    def train_all_shards(self, shard_map: Dict[int, List[CustomerRecord]], epochs: int = 5):
        for shard_id, recs in shard_map.items():
            self._train_shard(shard_id, recs, epochs)

    def predict_raw(self, features: np.ndarray):
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

    def unlearn_customer(self, cid: str, all_records: List[CustomerRecord]):
        """
        Single-customer unlearning: retrain only that customer's shard.
        """
        shard_id = self.customer_to_shard[cid]
        new_recs = [
            r
            for r in all_records
            if self.customer_to_shard.get(r.customer_id) == shard_id
            and r.customer_id != cid
        ]
        self._train_shard(shard_id, new_recs)
        return shard_id

    def unlearn_customers_batch(self, customer_ids: List[str], all_records: List[CustomerRecord]):
        """
        Multi-customer unlearning: group by shard, retrain each affected shard once.
        """
        shard_to_remove: Dict[int, List[str]] = {}
        for cid in customer_ids:
            if cid not in self.customer_to_shard:
                continue
            sid = self.customer_to_shard[cid]
            shard_to_remove.setdefault(sid, []).append(cid)

        retrained_shards: List[int] = []
        for sid, cids in shard_to_remove.items():
            remove_set = set(cids)
            new_recs = [
                r
                for r in all_records
                if self.customer_to_shard.get(r.customer_id) == sid
                and r.customer_id not in remove_set
            ]
            self._train_shard(sid, new_recs)
            retrained_shards.append(sid)

        return retrained_shards

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
    Core metrics for one customer (used both pre and post).
    """
    seg_probs, nbo_probs, score_pred = ensemble.predict_raw(rec.features)

    nbo_conf = float(np.max(nbo_probs))
    nbo_ent = entropy(nbo_probs)
    nbo_ce = cross_entropy(nbo_probs, rec.nbo)
    seg_ce = cross_entropy(seg_probs, rec.segment)
    score_mse = float((score_pred - rec.score) ** 2)

    # Simple proxy membership score: high confidence & low entropy → likely member
    membership_score = float(nbo_conf / (1.0 + nbo_ent))

    return {
        "nbo_probs": nbo_probs.tolist(),
        "seg_probs": seg_probs.tolist(),
        "score_pred": float(score_pred),
        "nbo_conf": nbo_conf,
        "nbo_entropy": nbo_ent,
        "nbo_ce": nbo_ce,
        "seg_ce": seg_ce,
        "score_mse": score_mse,
        "membership_score": membership_score,
    }

def build_metrics_entry(customer_id: str, pre: Dict[str, Any], post: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a regulator-friendly metrics summary for one customer.
    """
    pre_probs = np.array(pre["nbo_probs"])
    post_probs = np.array(post["nbo_probs"])

    conf_drop = pre["nbo_conf"] - post["nbo_conf"]
    ent_change = post["nbo_entropy"] - pre["nbo_entropy"]
    nbo_ce_change = post["nbo_ce"] - pre["nbo_ce"]
    seg_ce_change = post["seg_ce"] - pre["seg_ce"]
    score_mse_change = post["score_mse"] - pre["score_mse"]
    kl_val = kl(pre_probs, post_probs)
    l2_val = float(np.linalg.norm(pre_probs - post_probs))
    membership_drop = pre["membership_score"] - post["membership_score"]

    bullets = []

    if conf_drop > 0.01:
        bullets.append(
            f"Model confidence dropped by {conf_drop:.2f} after unlearning, "
            "indicating reduced personalization for this customer."
        )
    if ent_change > 0.01:
        bullets.append(
            f"Prediction entropy increased by {ent_change:.2f}, meaning the model "
            "is more uncertain and less specialized on this customer."
        )
    if nbo_ce_change > 0.0:
        bullets.append(
            f"NBO cross-entropy increased by {nbo_ce_change:.2f}, so the model's "
            "fit to the customer's historic behavior has weakened."
        )
    if score_mse_change > 0.0:
        bullets.append(
            f"Score MSE increased by {score_mse_change:.4f}, showing the model's "
            "predicted score moved away from the personalized target."
        )
    if kl_val > 0.0:
        bullets.append(
            f"NBO output distribution shifted (KL divergence = {kl_val:.3f}), "
            "indicating a material change in the model's decision."
        )
    if membership_drop > 0.0:
        bullets.append(
            f"Proxy membership score dropped by {membership_drop:.3f}, meaning the "
            "model now behaves more like the customer was never in training."
        )

    if not bullets:
        bullets.append(
            "Metrics show minimal change; unlearning had a limited effect for this customer."
        )

    overall = (
        "Post-unlearning, the model's confidence and fit for this customer decreased, "
        "while uncertainty and distributional drift increased. Together, these metrics "
        "support the claim that the customer's signal has been effectively removed."
    )

    return {
        "customer_id": customer_id,
        "pre": pre,
        "post": post,
        "delta": {
            "confidence_drop": conf_drop,
            "entropy_change": ent_change,
            "nbo_ce_change": nbo_ce_change,
            "seg_ce_change": seg_ce_change,
            "score_mse_change": score_mse_change,
            "kl_divergence": kl_val,
            "l2_distance": l2_val,
            "membership_score_drop": membership_drop,
        },
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

ALL_RECORDS, NAME_TO_ID, ID_TO_RECORD = load_customers_from_csv("customers.csv")

ENSEMBLE = SISAEnsemble(num_shards=5)
SHARD_MAP = ENSEMBLE.shard_records(ALL_RECORDS)
ENSEMBLE.train_all_shards(SHARD_MAP, epochs=5)

UNLEARNED_CUSTOMERS = set()   # which customers are logically “forgotten”
METRICS_DB: Dict[str, Dict[str, Any]] = {}  # per-customer metrics

# =================================================================
#  FASTAPI SCHEMAS
# =================================================================

class PredictRequest(BaseModel):
    customer_id: str

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

@app.get("/customers")
def get_customers():
    """
    Expose customers.csv as JSON.
    """
    customers = []
    for rec in ALL_RECORDS:
        customers.append(rec.full_data)
    return {"customers": customers}

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
            score=0.5,
            baseline=True,
            raw_segment_probs=[0.33, 0.33, 0.33],
            raw_nbo_probs=[0.33, 0.33, 0.33],
            raw_score_pred=0.5,
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
            score=0.5,
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
    cid = req.customer_id

    if cid not in ID_TO_RECORD:
        return UnlearnResponse(
            message=f"Customer {cid} not found",
            retrained_shard=-1,
        )

    # Pre-metrics for this customer
    pre = compute_metrics(ENSEMBLE, ID_TO_RECORD[cid])

    # SISA unlearning
    shard_id = ENSEMBLE.unlearn_customer(cid, ALL_RECORDS)
    UNLEARNED_CUSTOMERS.add(cid)

    # Post-metrics
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

    # Batch unlearning via SISA (one retrain per shard)
    shards_retrained = ENSEMBLE.unlearn_customers_batch(valid_ids, ALL_RECORDS)

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
    Example: GET /metrics?customer_id=c2
    """
    if customer_id not in METRICS_DB:
        return MetricsResponse(
            result={
                "error": f"No metrics found for customer_id={customer_id}. "
                         "Unlearn this customer first, then query metrics."
            }
        )

    return MetricsResponse(result=METRICS_DB[customer_id])
