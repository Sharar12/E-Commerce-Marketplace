<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['customer', 'support', 'admin'], true);
    }

    public function view(User $user, SupportTicket $ticket): bool
    {
        if (in_array($user->role, ['support', 'admin'], true)) {
            return true;
        }

        return $user->role === 'customer' && $ticket->customer_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['customer', 'seller'], true);
    }

    public function update(User $user, SupportTicket $ticket): bool
    {
        if (in_array($user->role, ['support', 'admin'], true)) {
            return true;
        }

        return $user->role === 'customer' && $ticket->customer_id === $user->id;
    }
}
