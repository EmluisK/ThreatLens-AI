#!/usr/bin/env bash
TOKEN="${1:?usage: ./admin-list-users.sh <token>}"
curl -s http://localhost:8000/admin/users \
  -H "Authorization: Bearer $TOKEN" | jq .
