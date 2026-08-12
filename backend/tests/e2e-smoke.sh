#!/usr/bin/env bash
# ApnarDokan API v1 — Section 4 smoke test
# Usage: bash backend/tests/e2e-smoke.sh
set -u
cd "$(dirname "$0")/.."

B='http://127.0.0.1:8000/api/v1'

login() {
  curl -s -X POST "$B/auth/login" \
    -H 'Content-Type: application/json' -H 'Accept: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"demo1234\"}" \
    | php -r 'echo json_decode(stream_get_contents(STDIN), true)["token"] ?? "";'
}

ADMIN=$(login admin@apnardokan.com)
SELLER=$(login arif@autocare.com)
DLVR=$(login habib.mia@apnardokan.delivery)
CUST=$(login rahim.uddin@gmail.com)
echo "tokens: admin=${#ADMIN} seller=${#SELLER} dlvr=${#DLVR} cust=${#CUST}"

code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "== public =="
code "$B/categories"                        ; echo " categories"
code "$B/brands"                            ; echo " brands"
code "$B/products?pageSize=2"               ; echo " products"
code "$B/products/prd-001"                  ; echo " product detail"
code "$B/products/flash-sale"               ; echo " flash-sale"
code "$B/products/search-suggest?q=phone"   ; echo " search-suggest"
code "$B/sellers/sel-techpoint"             ; echo " seller detail"
code "$B/reviews?productId=prd-001"         ; echo " reviews"

echo "== orders (role-scoped) =="
echo "admin /orders -> $(code -H "Authorization: Bearer $ADMIN" "$B/orders?pageSize=2")"
echo "admin by code  -> $(code -H "Authorization: Bearer $ADMIN" "$B/orders/APD100001")"
echo "cust own orders -> $(code -H "Authorization: Bearer $CUST" "$B/orders/customer?customerId=cus-01")"
echo "cust cross-check (cus-02) -> $(code -H "Authorization: Bearer $CUST" "$B/orders/customer?customerId=cus-02")"
echo "seller own -> $(code -H "Authorization: Bearer $SELLER" "$B/orders/seller?sellerId=sel-autocare")"
echo "seller cross-check (sel-techpoint) -> $(code -H "Authorization: Bearer $SELLER" "$B/orders/seller?sellerId=sel-techpoint")"
echo "delivery own -> $(code -H "Authorization: Bearer $DLVR" "$B/orders/partner?partnerId=dlv-01")"

echo "== people =="
echo "customers -> $(code -H "Authorization: Bearer $ADMIN" "$B/customers")"
echo "delivery-partners -> $(code -H "Authorization: Bearer $ADMIN" "$B/delivery-partners")"
echo "support-agents -> $(code -H "Authorization: Bearer $ADMIN" "$B/support-agents")"

echo "== dashboards =="
echo "admin -> $(code -H "Authorization: Bearer $ADMIN" "$B/dashboard/admin")"
echo "seller -> $(code -H "Authorization: Bearer $SELLER" "$B/dashboard/seller?sellerId=sel-autocare")"
echo "customer -> $(code -H "Authorization: Bearer $CUST" "$B/dashboard/customer?customerId=cus-01")"
echo "delivery -> $(code -H "Authorization: Bearer $DLVR" "$B/dashboard/delivery?partnerId=dlv-01")"
echo "support -> $(code -H "Authorization: Bearer $ADMIN" "$B/dashboard/support")"

echo "== guards =="
echo "no token /orders -> $(code "$B/orders")"
echo "bad token -> $(code -H 'Authorization: Bearer nope' "$B/orders")"

echo "== dashboards shape (admin) =="
curl -s -H "Authorization: Bearer $ADMIN" "$B/dashboard/admin" | head -c 400
echo
echo "== customer dashboard shape =="
curl -s -H "Authorization: Bearer $CUST" "$B/dashboard/customer?customerId=cus-01" | head -c 300
echo
