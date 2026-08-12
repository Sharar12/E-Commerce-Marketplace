<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'customer') {
            return $order->customer_id === $user->id;
        }

        if ($user->role === 'seller') {
            return $order->items()->where('seller_id', $user->sellerProfile?->id)->exists();
        }

        if ($user->role === 'delivery') {
            return $order->assigned_partner_id === $user->deliveryPartnerProfile?->id;
        }

        if ($user->role === 'support') {
            return true;
        }

        return false;
    }

    public function updateStatus(User $user, Order $order): bool
    {
        // Status transitions are role-scoped; the service validates exact transitions.
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'seller') {
            return $order->items()->where('seller_id', $user->sellerProfile?->id)->exists();
        }

        if ($user->role === 'delivery') {
            return $order->assigned_partner_id === $user->deliveryPartnerProfile?->id;
        }

        return false;
    }
}
