# UnlearnAI - NN SISA API

A FastAPI-based implementation of Neural Network with Sharded, Isolated, Segmented, and Aggregated (SISA) training for machine unlearning.

## Features

- **SISA Ensemble**: Implements the SISA approach for efficient machine unlearning
- **FastAPI REST API**: Provides endpoints for predictions and unlearning operations
- **Regulator-Grade Metrics**: Includes comprehensive metrics and interpretations for unlearning validation
- **Batch Unlearning**: Supports both single and batch customer unlearning
- **CSV Data Support**: Loads customer data from CSV files

## Quick Start

### Prerequisites

- Python 3.7+
- pip

### Running the Server

The easiest way to start the API server is using the provided bash script:

```bash
# Run with default settings (localhost:8000)
./run_server.sh

# Run in development mode with auto-reload
./run_server.sh --dev

# Run on all interfaces with custom port
./run_server.sh -H 0.0.0.0 -p 8080

# Run with multiple workers for production
./run_server.sh -w 4
```

### Manual Installation

If you prefer to set up manually:

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn nn_sisa_api:app --reload
```

## API Endpoints

Once the server is running, you can access:

- **Interactive API Documentation**: http://localhost:8000/docs
- **Health Check**: GET `/health`
- **Predictions**: POST `/predict`
- **Single Customer Unlearning**: POST `/unlearn_trigger`
- **Batch Unlearning**: POST `/unlearn_batch`
- **Metrics**: GET `/metrics?customer_id=<id>`

## API Usage Examples

### Health Check

```bash
curl http://localhost:8000/health
```

### Get Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"customer_id": "c123"}'
```

### Unlearn a Customer

```bash
curl -X POST "http://localhost:8000/unlearn_trigger" \
     -H "Content-Type: application/json" \
     -d '{"customer_id": "c123"}'
```

### Batch Unlearning

```bash
curl -X POST "http://localhost:8000/unlearn_batch" \
     -H "Content-Type: application/json" \
     -d '{"customer_ids": ["c123", "c456", "c789"]}'
```

### Get Unlearning Metrics

```bash
curl "http://localhost:8000/metrics?customer_id=c123"
```

## Data Format

The API expects a `customers.csv` file with the following columns:

- customer_id: Unique customer identifier
- customer_name: Customer name
- age: Customer age
- income: Customer income
- tenure_months: Account tenure in months
- travel_ratio: Travel spending ratio
- online_ratio: Online activity ratio
- num_cards: Number of cards
- late_12m: Late payments in last 12 months
- mobile_logins: Mobile app login count
- segment_label: Customer segment (0-2)
- nbo_label: Next best offer (0-2)
- score_label: Credit score label

## Script Options

The `run_server.sh` script supports the following options:

- `-h, --help`: Show help message
- `-H, --host HOST`: Host to bind to (default: 127.0.0.1)
- `-p, --port PORT`: Port to bind to (default: 8000)
- `-r, --reload`: Enable auto-reload for development
- `-w, --workers N`: Number of worker processes (default: 1)
- `--dev`: Development mode (enables reload and sets host to 0.0.0.0)

## Architecture

The system implements a SISA (Sharded, Isolated, Segmented, Aggregated) approach:

1. **Sharding**: Customer data is split across multiple shards
2. **Isolation**: Each shard trains an independent model
3. **Segmentation**: Models are trained on their respective segments
4. **Aggregation**: Predictions are aggregated across all models

This architecture enables efficient unlearning by only requiring retraining of the specific shard containing the customer to be unlearned, rather than retraining the entire model.
