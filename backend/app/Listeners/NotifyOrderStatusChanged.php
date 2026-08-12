<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Services\NotificationService;

class NotifyOrderStatusChanged
{
    public function handle(OrderStatusChanged $event): void
    {
        app(NotificationService::class)->orderStatusChanged($event->order, $event->status);
    }
}
