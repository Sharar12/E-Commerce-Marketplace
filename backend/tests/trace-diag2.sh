#!/usr/bin/env bash
cd "$(dirname "$0")/.."
BODY=$(curl -s http://127.0.0.1:8000/api/v1/orders)
echo "HTTP check: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/orders)"
echo "$BODY" | php -r '
$d = json_decode(stream_get_contents(STDIN), true);
foreach (array_slice($d["trace"] ?? [], 0, 16) as $i => $f) {
    $file = basename($f["file"] ?? "?");
    $line = $f["line"] ?? "?";
    $fn = $f["function"] ?? "?";
    echo "$i $file:$line $fn\n";
}
'
