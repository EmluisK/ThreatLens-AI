#!/usr/bin/env bash
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@threatlens.io", "password": "manager1234", "role": "viewer"}' | jq .
