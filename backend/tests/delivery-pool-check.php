<?php

$base = 'http://127.0.0.1:8000/api/v1';

function api(string $method, string $url, array $body = [], ?string $token = null): array
{
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer '.$token;
    }
    if ($method === 'POST') {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $raw = curl_exec($ch);
    curl_close($ch);

    return json_decode((string) $raw, true) ?? [];
}

$login = api('POST', "$base/auth/login", ['email' => 'habib.mia@apnardokan.delivery', 'password' => 'demo1234']);
$token = $login['token'] ?? '';
if (! $token) {
    echo "FAIL no delivery token\n";
    exit(1);
}

$data = api('GET', "$base/orders?pageSize=50", [], $token);
$items = $data['items'] ?? [];
$pool = array_values(array_filter($items, fn ($o) => $o['status'] === 'shipped' && empty($o['assignedPartnerId'])));
echo 'delivery sees '.count($items)." orders total, ".count($pool)." available-to-accept\n";
echo count($pool) > 0 ? "PASS delivery pool works\n" : "FAIL delivery pool empty\n";
