#!/usr/bin/env bash
# E2E per-role verification against the live Laravel API.
B='http://127.0.0.1:8000/api/v1'
PASS=0; FAIL=0

check() { # check <desc> <curl-args...>
  local desc="$1"; shift
  local body; body=$(curl -s "$@")
  local http; http=$(curl -s -o /dev/null -w '%{http_code}' "$@")
  if [ "$http" = "200" ] && [ -n "$body" ] && [ "$body" != "null" ]; then
    PASS=$((PASS+1)); echo "PASS [$http] $desc"
  else
    FAIL=$((FAIL+1)); echo "FAIL [$http] $desc -> $(echo "$body" | head -c 140)"
  fi
}

login() { # login <email> -> token
  curl -s -X POST "$B/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"demo1234\"}" \
    | php -r 'echo json_decode(stream_get_contents(STDIN), true)["token"] ?? "";'
}

CT=$(login rahim.uddin@gmail.com)
ST=$(login tanvir@techpointbd.com)
DT=$(login habib.mia@apnardokan.delivery)
SUT=$(login sharmin@apnardokan.com)
AT=$(login admin@apnardokan.com)

echo '--- PUBLIC (no token) ---'
check 'knowledge articles (public)' "$B/knowledge"
check 'categories' "$B/categories"
check 'products' "$B/products"
check 'promotions (public for cart coupons)' "$B/promotions"

echo '--- CUSTOMER (cus-01) ---'
check 'customer dashboard' -H "Authorization: Bearer $CT" "$B/dashboard/customer?customerId=cus-01"
check 'customer orders' -H "Authorization: Bearer $CT" "$B/orders/customer?customerId=cus-01"
check 'customer tickets' -H "Authorization: Bearer $CT" "$B/tickets?customerId=cus-01"
check 'customer profile' -H "Authorization: Bearer $CT" "$B/customers/cus-01"

echo '--- SELLER (sel-techpoint) ---'
check 'seller dashboard' -H "Authorization: Bearer $ST" "$B/dashboard/seller?sellerId=sel-techpoint"
check 'seller orders' -H "Authorization: Bearer $ST" "$B/orders/seller?sellerId=sel-techpoint"
check 'seller reviews' -H "Authorization: Bearer $ST" "$B/reviews?sellerId=sel-techpoint"
check 'seller payouts' -H "Authorization: Bearer $ST" "$B/payouts?sellerId=sel-techpoint"
check 'promotions' -H "Authorization: Bearer $ST" "$B/promotions"

echo '--- DELIVERY (dlv-01) ---'
check 'delivery dashboard' -H "Authorization: Bearer $DT" "$B/dashboard/delivery?partnerId=dlv-01"
check 'partner orders' -H "Authorization: Bearer $DT" "$B/orders/partner?partnerId=dlv-01"
check 'partner profile' -H "Authorization: Bearer $DT" "$B/delivery-partners/dlv-01"

echo '--- SUPPORT (spt-01) ---'
check 'support dashboard' -H "Authorization: Bearer $SUT" "$B/dashboard/support"
check 'tickets queue' -H "Authorization: Bearer $SUT" "$B/tickets"
TID=$(curl -s -H "Authorization: Bearer $SUT" "$B/tickets" | php -r 'echo json_decode(stream_get_contents(STDIN), true)["items"][0]["id"] ?? "";')
check "ticket detail ($TID)" -H "Authorization: Bearer $SUT" "$B/tickets/$TID"
check 'knowledge (support)' -H "Authorization: Bearer $SUT" "$B/knowledge"

echo '--- ADMIN ---'
check 'admin dashboard' -H "Authorization: Bearer $AT" "$B/dashboard/admin"
check 'orders list' -H "Authorization: Bearer $AT" "$B/orders"
check 'customers list' -H "Authorization: Bearer $AT" "$B/customers"
check 'sellers list' -H "Authorization: Bearer $AT" "$B/sellers"
check 'delivery partners list' -H "Authorization: Bearer $AT" "$B/delivery-partners"
check 'support agents list' -H "Authorization: Bearer $AT" "$B/support-agents"
check 'audit logs' -H "Authorization: Bearer $AT" "$B/audit-logs"
check 'promotions (admin)' -H "Authorization: Bearer $AT" "$B/promotions"
check 'payouts (admin)' -H "Authorization: Bearer $AT" "$B/payouts"
check 'tickets (admin)' -H "Authorization: Bearer $AT" "$B/tickets"

echo '--- SCOPING (cross-role access must 403) ---'
S1=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $ST" "$B/customers/cus-01")
S2=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $CT" "$B/payouts")
S3=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $DT" "$B/orders/seller?sellerId=sel-techpoint")
echo "seller->customer profile: $S1 (expect 403)"; [ "$S1" = "403" ] && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
echo "customer->payouts: $S2 (expect 403)"; [ "$S2" = "403" ] && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
echo "delivery->seller orders: $S3 (expect 403)"; [ "$S3" = "403" ] && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

echo "-----------------------------------"
echo "TOTAL: $PASS passed, $FAIL failed"
