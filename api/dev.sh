#!/bin/bash

python3 -m uvicorn nn_sisa_api:app --host 0.0.0.0 --port 8000 --reload