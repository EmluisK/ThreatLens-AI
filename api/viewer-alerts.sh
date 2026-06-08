#!/usr/bin/env bash
TOKEN="${1:?usage: ./viewer-alerts.sh <token>}"
curl -s http://localhost:8000/viewer/alerts \
  -H "Authorization: Bearer $TOKEN" | jq .
