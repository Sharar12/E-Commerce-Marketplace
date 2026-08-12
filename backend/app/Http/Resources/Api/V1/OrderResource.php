<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $returnRequest = $this->whenLoaded('returnRequest') ?? $this->returnRequest;

        return [
            'id' => $this->id,
            'orderCode' => $this->order_code,
            'customerId' => $this->customer_id,
            'customerName' => $this->customer_name,
            'customerPhone' => $this->customer_phone,
            'customerEmail' => $this->customer_email,
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'productId' => $item->product_id,
                'name' => $item->name,
                'image' => $item->image,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'variantLabel' => $item->variant_label,
                'sellerId' => $item->seller_id,
            ]),
            'sellerId' => $this->seller_id,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'shippingFee' => (float) $this->shipping_fee,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'couponCode' => $this->coupon_code,
            'paymentMethod' => $this->payment_method,
            'paymentStatus' => $this->payment_status,
            'status' => $this->status,
            'deliveryAddress' => $this->delivery_address,
            'assignedPartnerId' => $this->assigned_partner_id,
            'timeline' => $this->timeline->map(fn ($t) => [
                'status' => $t->status,
                'label' => $t->label,
                'timestamp' => $t->timestamp?->toIso8601String(),
                'note' => $t->note,
            ]),
            'placedAt' => $this->placed_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'eta' => $this->eta?->toIso8601String(),
            'deliveryNote' => $this->delivery_note,
            'returnRequest' => $returnRequest ? [
                'id' => $returnRequest->id,
                'reason' => $returnRequest->reason,
                'detail' => $returnRequest->detail,
                'images' => $returnRequest->images ?? [],
                'requestedAt' => $returnRequest->requested_at?->toIso8601String(),
                'status' => $returnRequest->status,
                'refundAmount' => $returnRequest->refund_amount !== null ? (float) $returnRequest->refund_amount : null,
                'decisionNote' => $returnRequest->decision_note,
            ] : null,
            'codAmount' => $this->cod_amount !== null ? (float) $this->cod_amount : null,
        ];
    }
}
