#!/usr/bin/env bash
cd "$(dirname "$0")/.."
curl -s http://127.0.0.1:8000/api/v1/orders -o /tmp/unauth.json -w 'HTTP:%{http_code}'
echo
php -r '
$d = json_decode(file_get_contents("/tmp/unauth.json"), true);
foreach (array_slice($d["trace"] ?? [], 0, 14) as $i => $f) {
    $file = basename($f["file"] ?? "?");
    $line = $f["line"] ?? "?";
    $fn = $f["function"] ?? "?";
    echo "$i $file:$line $fn\n";
}
'
