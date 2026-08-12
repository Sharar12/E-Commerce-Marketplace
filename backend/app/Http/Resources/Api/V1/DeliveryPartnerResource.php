<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryPartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->user;

        return [
            'id' => $this->id,
            'name' => $user->name ?? '',
            'phone' => $user->phone ?? '',
            'avatar' => $user->avatar ?? '',
            'email' => $user->email ?? '',
            'vehicle' => $this->vehicle,
            'serviceAreas' => $this->service_areas ?? [],
            'status' => 'active',
            'online' => (bool) $this->online,
            'rating' => (float) $this->rating,
            'completedDeliveries' => $this->completed_deliveries,
            'completionRate' => (float) $this->completion_rate,
            'earningsToday' => (float) $this->earnings_today,
            'earningsWeek' => (float) $this->earnings_week,
            'totalEarnings' => (float) $this->total_earnings,
            'payoutBalance' => (float) $this->payout_balance,
            'joinedAt' => $user?->created_at?->toIso8601String(),
        ];
    }
}
