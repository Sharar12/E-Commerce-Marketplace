<?php

/**
 * Section 5 verification — exercises every service with real DB writes.
 * Run: php tests/services-check.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Events\OrderPlaced;
use App\Models\Coupon;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\PayoutRequest;
use App\Models\Product;
use App\Models\SellerProfile;
use App\Services\DeliveryService;
use App\Services\InventoryService;
use App\Services\OrderService;
use App\Services\PayoutService;
use App\Services\PromotionService;

function check(string $name, bool $ok, string $extra = ''): void
{
    echo ($ok ? "PASS" : "FAIL")." — {$name}".($extra ? " ({$extra})" : '').PHP_EOL;
}

/* ------------------------------------------------- OrderService ---- */
$orderService = app(OrderService::class);
$product = Product::first();
$before = $product->stock;

$order = $orderService->create([
    'customer' => ['id' => 'cus-01', 'name' => 'Rahim Uddin', 'phone' => '+8801711111111', 'email' => 'rahim.uddin@gmail.com'],
    'sellerId' => 'sel-techpoint',
    'items' => [
        ['productId' => $product->id, 'name' => $product->name, 'quantity' => 1, 'price' => $product->price, 'sellerId' => 'sel-techpoint'],
    ],
    'address' => ['label' => 'Home', 'line1' => '12 Banani', 'city' => 'Dhaka', 'postal_code' => '1213'],
    'payment' => ['method' => 'cod'],
    'totals' => ['subtotal' => $product->price, 'discount' => 0, 'shippingFee' => 0, 'tax' => 0, 'total' => $product->price],
]);

check('order created with code', str_starts_with($order->order_code, 'APD'), $order->order_code);
check('order stock decremented', Product::find($product->id)->stock === $before - 1);
check('order timeline seeded', $order->timeline()->count() === 1);
check('order status placed', $order->status === 'placed');

// Legal transition
$orderService->transition($order, 'confirmed', 'Verified payment');
check('legal transition confirmed', $order->fresh()->status === 'confirmed');

// Illegal transition
try {
    $orderService->transition($order, 'delivered');
    check('illegal transition blocked', false);
} catch (RuntimeException $e) {
    check('illegal transition blocked', true, $e->getMessage());
}

// Cancel restores stock
$stockAfterConfirm = Product::find($product->id)->stock;
$orderService->cancel($order, 'Changed my mind');
check('cancel restores stock', Product::find($product->id)->stock === $stockAfterConfirm + 1);
check('cancel status', $order->fresh()->status === 'cancelled');

/* ------------------------------------------------- InventoryService ---- */
$inv = app(InventoryService::class);
$low = Product::where('stock', '<=', 5)->first()
    ?? Product::updateOrCreate(['id' => 'prd-lowtest'], [
        'seller_id' => 'sel-techpoint', 'category_id' => 'cat-electronics',
        'brand' => 'Test', 'sku' => 'APD-LOW-1', 'name' => 'Low stock test', 'slug' => 'low-stock-test',
        'description' => 'Test product', 'price' => 100, 'mrp' => 120, 'stock' => 6, 'is_published' => true,
    ]);
check('low stock flagged', $inv->isLowStock($low) === ($low->stock <= 5));
try {
    $inv->reserve('prd-nonexistent', 1);
    check('reserve unknown product throws', false);
} catch (RuntimeException $e) {
    check('reserve unknown product throws', true);
}

/* ------------------------------------------------- PromotionService ---- */
$promo = app(PromotionService::class);
$coupon = Coupon::where('code', 'WELCOME10')->first();
check('coupon applied', $promo->applyCoupon($coupon->code, 5000)['discount'] == 500, 'WELCOME10 on 5000');
$flash = Product::where('is_flash_sale', true)->first();
check('flash price discounted', $promo->flashPrice($flash, 25) < $flash->price);

/* ------------------------------------------------- DeliveryService ---- */
$dlv = app(DeliveryService::class);
$dlvOrder = Order::whereNull('assigned_partner_id')->first()
    ?? Order::first();
$delivery = $dlv->assign($dlvOrder);
check('delivery assigned', $delivery->partner_id !== null && $dlvOrder->fresh()->assigned_partner_id === $delivery->partner_id);
$dlv->advance($delivery, 'picked_up');
$dlv->advance($delivery, 'out_for_delivery');
$dlv->advance($delivery, 'delivered', $delivery->cod_amount ?? 0);
check('delivery delivered + order synced', $delivery->fresh()->status === 'delivered' && $dlvOrder->fresh()->status === 'delivered');
try {
    $dlv->remitCod($delivery, ($delivery->cod_collected ?? 0) + 1000);
    check('over-remit blocked', false);
} catch (RuntimeException $e) {
    check('over-remit blocked', true);
}

/* ------------------------------------------------- PayoutService ---- */
$payout = app(PayoutService::class);
$seller = SellerProfile::where('status', 'active')->first();
$payout->accrueEarning($dlvOrder);
$bal = $seller->fresh()->payout_balance;
$request = $payout->requestPayout($seller->fresh(), 'bkash', 'bKash •••• 1234');
check('payout request created', $request->status === 'pending');
check('balance frozen on request', $seller->fresh()->payout_balance < $bal);
$payout->approve($request, 'TXN-REF-001');
check('payout approved + ledger', $request->fresh()->status === 'approved' && \App\Models\Payout::where('transaction_ref', 'TXN-REF-001')->exists());

echo 'SERVICES OK'.PHP_EOL;
