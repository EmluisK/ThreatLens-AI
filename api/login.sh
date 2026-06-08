#!/usr/bin/env bash
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@threatlens.io&password=admin1234" | jq .
