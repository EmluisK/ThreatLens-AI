#!/usr/bin/env bash
TOKEN="${1:?usage: ./admin-upload-logs.sh <token> <log_file_path> <source_label>}"
FILE="${2:?usage: ./admin-upload-logs.sh <token> <log_file_path> <source_label>}"
SOURCE="${3:?usage: ./admin-upload-logs.sh <token> <log_file_path> <source_label>}"
curl -s -X POST http://localhost:8000/admin/upload_logs \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$FILE" \
  -F "source=$SOURCE" | jq .
