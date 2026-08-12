<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->user;

        return [
            'id' => $this->id,
            'shopName' => $this->shop_name,
            'slug' => $this->slug,
            'ownerName' => $user->name ?? '',
            'email' => $user->email ?? '',
            'phone' => $user->phone ?? '',
            'logo' => $this->logo,
            'coverImage' => $this->cover_image,
            'categoryIds' => $this->category_ids ?? [],
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'productCount' => $this->products_count ?? \App\Models\Product::where('seller_id', $this->id)->count(),
            'followers' => $this->followers,
            'joinedAt' => $user?->created_at?->toIso8601String(),
            'status' => $this->status,
            'verificationDocs' => collect($this->verification_docs ?? [])->map(fn ($d) => $d),
            'bankAccount' => $this->bank_account,
            'address' => $this->address,
            'bio' => $this->bio,
            'responseRate' => $this->response_rate,
            'avgResponseTime' => $this->avg_response_time,
            'commissionRate' => (float) $this->commission_rate,
            'payoutBalance' => (float) $this->payout_balance,
            'pendingPayout' => (float) $this->pending_payout,
        ];
    }
}
