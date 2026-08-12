<?php

$base = 'http://127.0.0.1:8000/api/v1';
$pass = 0; $fail = 0;

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

function check(string $desc, int $code, int $expect, array $json = []): void
{
    global $pass, $fail;
    $ok = $code === $expect;
    if ($ok) {
        $pass++;
        echo "PASS [$code] $desc\n";
    } else {
        $fail++;
        echo "FAIL [$code] $desc -> ".substr(json_encode($json), 0, 160)."\n";
    }
}

/** Detail endpoints return the resource directly — unwrap if a data key exists. */
function detail(array $json): array
{
    return isset($json['data']) && is_array($json['data']) ? $json['data'] : $json;
}

$login = api('POST', "$base/auth/login", ['email' => 'rahim.uddin@gmail.com', 'password' => 'demo1234']);
$CT = $login[1]['token'] ?? '';
$login = api('POST', "$base/auth/login", ['email' => 'tanvir@techpointbd.com', 'password' => 'demo1234']);
$ST = $login[1]['token'] ?? '';
$login = api('POST', "$base/auth/login", ['email' => 'sharmin@apnardokan.com', 'password' => 'demo1234']);
$SUT = $login[1]['token'] ?? '';
$login = api('POST', "$base/auth/login", ['email' => 'habib.mia@apnardokan.delivery', 'password' => 'demo1234']);
$DT = $login[1]['token'] ?? '';

echo '--- ORDER PLACEMENT ---'."\n";
[$c, $j] = api('POST', "$base/orders", [
    'sellerId' => 'sel-techpoint',
    'items' => [
        ['productId' => 'prd-001', 'name' => 'iPhone 15 Pro 256GB', 'image' => 'https://picsum.photos/seed/t/640/640', 'quantity' => 1, 'price' => 134999, 'sellerId' => 'sel-techpoint'],
        ['productId' => 'prd-005', 'name' => 'Samsung Galaxy S25 Ultra', 'image' => 'https://picsum.photos/seed/t2/640/640', 'quantity' => 2, 'price' => 145999, 'sellerId' => 'sel-techpoint'],
    ],
    'address' => ['name' => 'Rahim Uddin', 'phone' => '+8801711111111', 'line1' => 'House 42, Road 11', 'area' => 'Banani', 'city' => 'Dhaka', 'postalCode' => '1213', 'label' => 'Home', 'isDefault' => true],
    'payment' => ['method' => 'bkash'],
    'totals' => ['subtotal' => 426997, 'shippingFee' => 0, 'total' => 426997],
], $CT);
check('customer places order', $c, 201, $j);
$newOrderId = $j['data']['id'] ?? '';
$newOrderCode = $j['data']['orderCode'] ?? '';
echo "  -> new order $newOrderCode ($newOrderId)\n";

[$c, $j] = api('GET', "$base/orders/$newOrderId", [], $CT);
check('order visible to customer', $c, 200, $j);
[$c, $j] = api('GET', "$base/orders/$newOrderCode", [], $CT);
check('order lookup by code works', $c, 200, $j);

[$c] = api('POST', "$base/orders", [
    'items' => [['productId' => 'prd-001', 'name' => 'iPhone', 'quantity' => 1, 'price' => 10]],
    'address' => ['name' => 'X', 'line1' => 'Y', 'city' => 'Dhaka'],
    'payment' => ['method' => 'cod'],
    'totals' => ['subtotal' => 10, 'total' => 70],
], $DT);
check('delivery partner cannot place order (403)', $c, 403);

echo '--- TICKET REPLY ---'."\n";
[$c, $j] = api('GET', "$base/tickets?customerId=cus-01", [], $CT);
$tid = $j['items'][0]['id'] ?? '';
echo "  -> ticket $tid\n";
[$c, $j] = api('POST', "$base/tickets/$tid/messages", ['body' => 'Any update on my order?'], $CT);
check('customer replies to own ticket', $c, 201, $j);
[$c, $j] = api('POST', "$base/tickets/$tid/messages", ['body' => 'Checking with logistics — will update you shortly.'], $SUT);
check('support replies to ticket', $c, 201, $j);
[$c, $j] = api('POST', "$base/tickets/$tid/messages", ['body' => 'Customer is unhappy, prioritize.', 'isInternalNote' => true], $SUT);
check('support saves internal note', $c, 201, $j);
[$c, $j] = api('POST', "$base/tickets/$tid/messages", ['body' => 'internal hack', 'isInternalNote' => true], $CT);
check('customer cannot write internal note (403)', $c, 403);
[$c, $j] = api('GET', "$base/tickets/$tid", [], $CT);
$ticketDetail = detail($j);
$count = count($ticketDetail['messages'] ?? []);
echo "  -> ticket now has $count messages\n";
check('messages persisted', $c === 200 && $count >= 3 ? 200 : 400, 200, $j);

echo '--- PRODUCT CREATE/UPDATE ---'."\n";
[$c, $j] = api('POST', "$base/products", [
    'name' => 'Test LED Ring Light 12"',
    'description' => 'For sellers making content.',
    'price' => 2490,
    'mrp' => 3990,
    'stock' => 25,
    'highlights' => ['48W brightness', 'Tripod included'],
    'images' => [['url' => 'https://picsum.photos/seed/ring/640/640', 'alt' => 'Ring light']],
    'isPublished' => true,
], $ST);
check('seller creates product', $c, 201, $j);
$newProductId = $j['data']['id'] ?? '';
echo "  -> new product $newProductId\n";
[$c, $j] = api('PUT', "$base/products/$newProductId", ['price' => 2190, 'stock' => 30], $ST);
check('seller updates product', $c, 200, $j);
[$c, $j] = api('GET', "$base/products/$newProductId", [], $ST);
check('updated price persisted (no stale cache)', $c === 200 && (float) (detail($j)['price'] ?? 0) == 2190 ? 200 : 400, 200, $j);
[$c] = api('POST', "$base/products", ['name' => 'Nope', 'price' => 5], $CT);
check('customer cannot create product (403)', $c, 403);
[$c, $j] = api('POST', "$base/products", ['name' => 'X', 'price' => 100], $DT);
check('delivery cannot create product (403)', $c, 403);

echo '--- PAYOUT REQUEST ---'."\n";
[$c, $j] = api('GET', "$base/sellers/sel-techpoint", [], $ST);
$balance = (float) (detail($j)['payoutBalance'] ?? 0);
echo "  -> seller balance ৳$balance\n";
[$c, $j] = api('POST', "$base/payouts/requests", ['method' => 'bkash', 'accountSummary' => 'bKash •••• 1234'], $ST);
check('seller requests payout', $c, 201, $j);
[$c, $j] = api('GET', "$base/sellers/sel-techpoint", [], $ST);
$newBalance = (float) (detail($j)['payoutBalance'] ?? 0);
echo "  -> balance after request ৳$newBalance\n";
check('balance frozen by request', $balance > 0 && $newBalance < $balance ? 200 : 400, 200, $j);
[$c, $j] = api('POST', "$base/payouts/requests", ['method' => 'bkash'], $CT);
check('customer cannot request payout (403)', $c, 403);

echo "-----------------------------------\n";
echo "TOTAL: $pass passed, $fail failed\n";
exit($fail > 0 ? 1 : 0);
