#!/usr/bin/env bash
TOKEN="${1:?usage: ./admin-delete-user.sh <token> <user_id>}"
USER_ID="${2:?usage: ./admin-delete-user.sh <token> <user_id>}"
curl -s -X DELETE "http://localhost:8000/admin/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
