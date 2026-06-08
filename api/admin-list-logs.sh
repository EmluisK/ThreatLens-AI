#!/usr/bin/env bash
TOKEN="${1:?usage: ./admin-list-logs.sh <token>}"
curl -s http://localhost:8000/admin/logs \
  -H "Authorization: Bearer $TOKEN" | jq .
