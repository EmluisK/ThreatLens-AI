#!/usr/bin/env bash
TOKEN="${1:?usage: ./viewer-dashboard.sh <token>}"
curl -s http://localhost:8000/viewer/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq .
