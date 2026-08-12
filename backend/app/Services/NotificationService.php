<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * NotificationService — delivers event notifications to customers,
 * sellers, partners and agents. In development these are log-based;
 * swap the drivers for real email/SMS/push gateways in production.
 */
class NotificationService
{
    public function orderStatusChanged(Order $order, string $status): void
    {
        $this->logVia('order', $order->customer_email, "Order {$order->order_code} is now {$status}.");

        if ($order->seller_id) {
            $seller = User::whereHas('sellerProfile', fn ($q) => $q->where('id', $order->seller_id))->first();
            if ($seller) {
                $this->logVia('order', $seller->email, "Order {$order->order_code} ({$status}) needs your attention.");
            }
        }
    }

    public function payoutApproved(string $sellerEmail, string $amount): void
    {
        $this->logVia('payout', $sellerEmail, "Your payout of BDT {$amount} has been approved and is on its way.");
    }

    public function ticketEscalated(SupportTicket $ticket): void
    {
        $this->logVia('ticket', null, "Ticket {$ticket->code} escalated to admin: {$ticket->subject}");
    }

    public function lowStockAlert(string $sellerEmail, string $productName): void
    {
        $this->logVia('inventory', $sellerEmail, "Low stock alert: {$productName} is almost sold out.");
    }

    /**
     * Generic log channel — also used by listeners.
     */
    public function logVia(string $channel, ?string $to, string $message): void
    {
        Log::channel('daily')->info("[notification:{$channel}]" . ($to ? " to {$to}" : '')." — {$message}");
    }
}
