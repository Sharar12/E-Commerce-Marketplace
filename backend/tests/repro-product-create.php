<?php

$base = 'http://127.0.0.1:8000/api/v1';

function api(string $method, string $url, array $body = [], ?string $token = null): array
{
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer '.$token;
    }
    if ($method !== 'GET') {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    return [$code, json_decode((string) $raw, true) ?? []];
}

$login = api('POST', "$base/auth/login", ['email' => 'tanvir@techpointbd.com', 'password' => 'demo1234']);
$token = $login[1]['token'] ?? '';

// Exact frontend payload shape (json_encode drops undefined mrp).
$payload = [
    'name' => 'Browser Test Headphones',
    'description' => '',
    'price' => 1299,
    'stock' => 10,
    'highlights' => [],
    'images' => [],
    'isPublished' => true,
];
[$c, $j] = api('POST', "$base/products", $payload, $token);
echo "code: $c\n";
echo json_encode($j, JSON_PRETTY_PRINT)."\n";
