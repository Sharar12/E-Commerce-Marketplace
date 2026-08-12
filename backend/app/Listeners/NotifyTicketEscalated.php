<?php

namespace App\Listeners;

use App\Events\TicketEscalated;
use App\Services\NotificationService;

class NotifyTicketEscalated
{
    public function handle(TicketEscalated $event): void
    {
        app(NotificationService::class)->ticketEscalated($event->ticket);
    }
}
