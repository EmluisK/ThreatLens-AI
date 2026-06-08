#!/usr/bin/env bash
TOKEN="${1:?usage: ./analyst-triage-history.sh <token>}"
curl -s http://localhost:8000/analyst/triage_history \
  -H "Authorization: Bearer $TOKEN" | jq .
