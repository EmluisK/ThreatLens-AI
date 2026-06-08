#!/usr/bin/env bash
TOKEN="${1:?usage: ./iot-status.sh <token>}"
curl -s http://localhost:8000/ingest/iot/status \
  -H "Authorization: Bearer $TOKEN" | jq .
