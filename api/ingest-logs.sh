#!/usr/bin/env bash
TOKEN="${1:?usage: ./ingest-logs.sh <token> <log_file_path> <source_label>}"
FILE="${2:?usage: ./ingest-logs.sh <token> <log_file_path> <source_label>}"
SOURCE="${3:?usage: ./ingest-logs.sh <token> <log_file_path> <source_label>}"
FILENAME=$(basename "$FILE")
CONTENT=$(cat "$FILE")
curl -s -X POST http://localhost:8000/ingest/logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"source\": \"$SOURCE\", \"filename\": \"$FILENAME\", \"content\": $(jq -Rs . <<<"$CONTENT")}" | jq .
