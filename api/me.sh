#!/usr/bin/env bash
TOKEN="${1:?usage: ./me.sh <token>}"
curl -s http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
