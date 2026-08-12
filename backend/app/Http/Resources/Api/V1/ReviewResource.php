<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $reply = $this->whenLoaded('reply');

        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'customerId' => $this->customer_id,
            'customerName' => $this->customer?->name ?? 'Verified Customer',
            'customerAvatar' => $this->customer?->avatar ?? '',
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'images' => $this->images ?? [],
            'createdAt' => $this->created_at?->toIso8601String(),
            'verifiedPurchase' => (bool) $this->verified_purchase,
            'sellerResponse' => $reply ? [
                'body' => $reply->body,
                'createdAt' => $reply->created_at?->toIso8601String(),
            ] : null,
            'isFlagged' => (bool) $this->is_flagged,
            'flagReason' => $this->flag_reason,
        ];
    }
}
