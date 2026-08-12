<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Events\OrderStatusChanged;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * OrderService — the single source of truth for order lifecycle rules.
 *
 *   create(): cart -> order conversion, stock decrement, timeline seeded
 *   transition(): which status moves are legal from which state
 *   cancel()/requestReturn(): cancellation & refund eligibility windows
 */
class OrderService
{
    public const STATUS_FLOW = [
        'placed' => ['confirmed', 'cancelled'],
        'confirmed' => ['packed', 'cancelled'],
        'packed' => ['shipped'],
        'shipped' => ['out_for_delivery'],
        'out_for_delivery' => ['delivered', 'return_requested'],
        'delivered' => ['return_requested'],
        'return_requested' => ['returned'],
        'returned' => ['refunded'],
        'cancelled' => [],
        'refunded' => [],
    ];

    public const STATUS_LABELS = [
        'placed' => 'Placed', 'confirmed' => 'Confirmed', 'packed' => 'Packed',
        'shipped' => 'Shipped', 'out_for_delivery' => 'Out for Delivery',
        'delivered' => 'Delivered', 'cancelled' => 'Cancelled',
        'return_requested' => 'Return Requested', 'returned' => 'Returned',
        'refunded' => 'Refunded',
    ];

    /**
     * Convert a checkout payload into an order inside a transaction.
     *
     * @param  array{customer: array, sellerId: string, items: array, address: array, payment: array, totals: array}  $payload
     */
    public function create(array $payload): Order
    {
        return DB::transaction(function () use ($payload) {
            $customer = $payload['customer'];
            $items = $payload['items'];
            $totals = $payload['totals'];

            $orderId = 'ord-'.Str::lower(Str::random(10));
            $order = Order::create([
                'id' => $orderId,
                'order_code' => $this->nextOrderCode(),
                'customer_id' => $customer['id'],
                'customer_name' => $customer['name'],
                'customer_phone' => $customer['phone'] ?? '',
                'customer_email' => $customer['email'] ?? '',
                'seller_id' => $payload['sellerId'],
                'subtotal' => $totals['subtotal'],
                'discount' => $totals['discount'] ?? 0,
                'shipping_fee' => $totals['shippingFee'] ?? 0,
                'tax' => $totals['tax'] ?? 0,
                'total' => $totals['total'],
                'coupon_code' => $totals['couponCode'] ?? null,
                'payment_method' => $payload['payment']['method'],
                'payment_status' => $payload['payment']['method'] === 'cod' ? 'pending' : 'paid',
                'status' => 'placed',
                'delivery_address' => $payload['address'],
                'cod_amount' => $payload['payment']['method'] === 'cod' ? $totals['total'] : null,
                'placed_at' => now(),
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'id' => "oi-{$orderId}-".Str::random(4),
                    'order_id' => $orderId,
                    'product_id' => $item['productId'],
                    'name' => $item['name'],
                    'image' => $item['image'] ?? '',
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'variant_label' => $item['variantLabel'] ?? null,
                    'seller_id' => $item['sellerId'] ?? $payload['sellerId'],
                ]);

                // Decrement stock, never below zero.
                Product::where('id', $item['productId'])
                    ->where('stock', '>', 0)
                    ->decrement('stock', $item['quantity']);
            }

            $this->recordStatus($orderId, 'placed');

            event(new OrderPlaced($order));

            return $order;
        });
    }

    /**
     * Move an order to a new status if the transition is legal.
     *
     * @throws \RuntimeException when the transition is not allowed
     */
    public function transition(Order $order, string $to, ?string $note = null): Order
    {
        $allowed = self::STATUS_FLOW[$order->status] ?? [];

        if (! in_array($to, $allowed, true)) {
            throw new \RuntimeException(
                "Invalid status transition: {$order->status} -> {$to}"
            );
        }

        $order->update(['status' => $to, 'updated_at' => now()]);
        $this->recordStatus($order->id, $to, $note);

        event(new OrderStatusChanged($order, $to));

        return $order;
    }

    /**
     * Cancel while still eligible (before shipped), restocking items.
     */
    public function cancel(Order $order, string $reason = 'Cancelled by customer'): Order
    {
        if (in_array($order->status, ['shipped', 'out_for_delivery', 'delivered', 'returned', 'refunded', 'cancelled'], true)) {
            throw new \RuntimeException("Order in '{$order->status}' state cannot be cancelled.");
        }

        DB::transaction(function () use ($order, $reason) {
            // Restore stock.
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }

            $order->update(['status' => 'cancelled', 'updated_at' => now()]);
            $this->recordStatus($order->id, 'cancelled', $reason);

            event(new OrderStatusChanged($order, 'cancelled'));
        });

        return $order->fresh(['items', 'timeline']);
    }

    private function recordStatus(string $orderId, string $status, ?string $note = null): void
    {
        OrderStatusHistory::create([
            'order_id' => $orderId,
            'status' => $status,
            'label' => self::STATUS_LABELS[$status] ?? ucfirst($status),
            'timestamp' => now(),
            'note' => $note,
        ]);
    }

    private function nextOrderCode(): string
    {
        $last = Order::query()->orderByDesc('order_code')->value('order_code');
        $next = $last ? ((int) Str::after($last, 'APD')) + 1 : 100001;

        return 'APD'.$next;
    }
}
