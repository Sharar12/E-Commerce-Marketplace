<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->user;

        return [
            'id' => $user->id ?? $this->id,
            'name' => $user->name ?? '',
            'email' => $user->email ?? '',
            'phone' => $user->phone ?? '',
            'avatar' => $user->avatar ?? '',
            'joinDate' => $user?->created_at?->toIso8601String(),
            'status' => $user?->status ?? 'active',
            'loyaltyPoints' => (int) $this->loyalty_points,
            'tier' => $this->tier,
            'addresses' => $this->whenLoaded('addresses') ?? [],
            'savedCards' => [],
            'notificationPrefs' => $this->notification_prefs ?? ['email' => true, 'sms' => true, 'push' => true],
            'referredBy' => $this->referred_by,
            'referralCode' => $this->referral_code ?? '',
            'totalOrders' => (int) ($this->orders_count ?? Order::where('customer_id', $this->id)->count()),
            'totalSpent' => (float) ($this->orders_revenue ?? Order::where('customer_id', $this->id)->whereNotIn('status', ['cancelled', 'refunded'])->sum('total')),
        ];
    }
}
