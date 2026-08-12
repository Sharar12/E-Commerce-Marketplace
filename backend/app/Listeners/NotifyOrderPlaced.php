<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Services\NotificationService;

class NotifyOrderPlaced
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        app(NotificationService::class)->logVia(
            'order',
            $order->customer_email,
            "Order {$order->order_code} confirmed — total BDT {$order->total}."
        );
    }
}
