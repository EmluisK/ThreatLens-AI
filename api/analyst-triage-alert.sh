#!/usr/bin/env bash
TOKEN="${1:?usage: ./analyst-triage-alert.sh <token> <alert_id>}"
ALERT_ID="${2:?usage: ./analyst-triage-alert.sh <token> <alert_id>}"
curl -s -X POST "http://localhost:8000/analyst/alerts/$ALERT_ID/triage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": ""}' | jq .
