<?php

namespace App\Policies;

use App\Models\Payout;
use App\Models\User;

class PayoutPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['seller', 'admin'], true);
    }

    public function view(User $user, Payout $payout): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'seller' && $payout->seller_id === $user->sellerProfile?->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'seller';
    }

    public function approve(User $user): bool
    {
        return $user->role === 'admin';
    }
}
