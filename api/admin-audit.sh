#!/usr/bin/env bash
TOKEN="${1:?usage: ./admin-audit.sh <token>}"
curl -s http://localhost:8000/admin/audit \
  -H "Authorization: Bearer $TOKEN" | jq .
