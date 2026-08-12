<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sellerId' => $this->seller_id,
            'amount' => (float) $this->amount,
            'method' => $this->method,
            'accountSummary' => $this->account_summary,
            'status' => $this->status,
            'periodStart' => $this->period_start?->toIso8601String(),
            'periodEnd' => $this->period_end?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'paidAt' => $this->paid_at?->toIso8601String(),
        ];
    }
}
