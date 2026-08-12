#!/usr/bin/env bash
cd "$(dirname "$0")/.."
date
echo "=== hit /orders without token ==="
curl -s http://127.0.0.1:8000/api/v1/orders -o /tmp/unauth.json -w 'HTTP:%{http_code} size:%{size_download}'
echo
echo "=== last log entry ==="
tail -1 storage/logs/laravel.log | cut -c1-200
echo
echo "=== body head ==="
head -c 500 /tmp/unauth.json
echo
