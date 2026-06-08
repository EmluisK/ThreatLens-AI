#!/usr/bin/env bash
TOKEN="${1:?usage: ./analyst-get-log.sh <token> <log_id>}"
LOG_ID="${2:?usage: ./analyst-get-log.sh <token> <log_id>}"
curl -s "http://localhost:8000/analyst/logs/$LOG_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
