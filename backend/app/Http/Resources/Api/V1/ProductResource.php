<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $deliveryDays = $this->delivery_estimate_days;

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'highlights' => $this->highlights ?? [],
            'categoryId' => $this->category_id,
            'categoryName' => $this->category?->name ?? '',
            'brand' => $this->brand,
            'sellerId' => $this->seller_id,
            'price' => (float) $this->price,
            'mrp' => $this->mrp !== null ? (float) $this->mrp : (float) $this->price,
            'currency' => 'BDT',
            'stock' => $this->stock,
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'soldCount' => $this->sold_count,
            'images' => $this->images->map(fn ($img) => [
                'id' => $img->id,
                'url' => $img->url,
                'alt' => $img->alt,
            ]),
            'variants' => $this->variants->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'value' => $v->value,
                'priceDelta' => (float) $v->price_delta,
                'stock' => $v->stock,
            ]),
            'tags' => $this->tags ?? [],
            'isFlashSale' => (bool) $this->is_flash_sale,
            'flashSaleEndsAt' => $this->flash_sale_ends_at?->toIso8601String(),
            'isFeatured' => (bool) $this->is_featured,
            'isPublished' => (bool) $this->is_published,
            'isFlagged' => (bool) $this->is_flagged,
            'flagReason' => $this->flag_reason,
            'createdAt' => $this->created_at?->toIso8601String(),
            'deliveryEstimateDays' => is_array($deliveryDays) && count($deliveryDays) === 2
                ? [(int) $deliveryDays[0], (int) $deliveryDays[1]]
                : [2, 5],
            'freeDelivery' => (bool) $this->free_delivery,
        ];
    }
}
