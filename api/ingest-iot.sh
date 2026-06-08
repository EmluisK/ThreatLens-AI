#!/usr/bin/env bash
TOKEN="${1:?usage: ./ingest-iot.sh <token>}"
curl -s -X POST http://localhost:8000/ingest/iot \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6",
    "arch": "arm",
    "source": "iot-sandbox",
    "features": {
      "duration": 120.5,
      "protocol_type": 1.0,
      "src_bytes": 4096.0,
      "dst_bytes": 512.0,
      "land": 0.0,
      "wrong_fragment": 0.0,
      "urgent": 0.0,
      "hot": 2.0,
      "num_failed_logins": 0.0,
      "logged_in": 1.0
    }
  }' | jq .
