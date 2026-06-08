#!/usr/bin/env bash
TOKEN="${1:?usage: ./analyst-list-alerts.sh <token>}"
curl -s http://localhost:8000/analyst/alerts \
  -H "Authorization: Bearer $TOKEN" | jq .
