<?php

namespace App\Listeners;

use App\Events\PayoutApproved;
use App\Services\NotificationService;

class NotifyPayoutApproved
{
    public function handle(PayoutApproved $event): void
    {
        $seller = $event->request->seller;
        if ($seller?->user) {
            app(NotificationService::class)->payoutApproved(
                $seller->user->email,
                (string) $event->request->amount
            );
        }
    }
}
