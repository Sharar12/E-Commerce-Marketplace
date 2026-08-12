<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Product;

/**
 * PromotionService — coupon validation and flash-sale price math.
 */
class PromotionService
{
    /**
     * Validate a coupon against an order subtotal.
     *
     * @return array{discount: float, code: string}
     *
     * @throws \RuntimeException when the coupon is invalid
     */
    public function applyCoupon(string $code, float $subtotal): array
    {
        $coupon = Coupon::where('code', $code)->where('active', true)->first();

        if (! $coupon) {
            throw new \RuntimeException("Coupon {$code} is not valid.");
        }

        $now = now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw new \RuntimeException('This coupon has not started yet.');
        }
        if ($coupon->ends_at && $now->gt($coupon->ends_at)) {
            throw new \RuntimeException('This coupon has expired.');
        }
        if ($subtotal < $coupon->min_order) {
            throw new \RuntimeException("Minimum order of BDT {$coupon->min_order} required.");
        }
        if ($coupon->usage_limit > 0 && $coupon->used_count >= $coupon->usage_limit) {
            throw new \RuntimeException('This coupon has reached its usage limit.');
        }

        $discount = $coupon->discount_type === 'percent'
            ? $subtotal * ($coupon->discount_value / 100)
            : $coupon->discount_value;

        if ($coupon->max_discount) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        $coupon->increment('used_count');

        return ['discount' => round($discount, 2), 'code' => $coupon->code];
    }

    /**
     * Effective price of a product during a flash sale.
     */
    public function flashPrice(Product $product, ?int $discountPercent = null): float
    {
        if (! $product->is_flash_sale && $discountPercent === null) {
            return (float) $product->price;
        }

        $percent = $discountPercent ?? 25;

        return round($product->price * (1 - $percent / 100), 2);
    }

    /**
     * Line total with coupon + flash pricing, no stacking with COD discounts.
     */
    public function lineTotal(Product $product, int $quantity, ?string $couponCode, float $subtotalBefore): float
    {
        $price = $this->flashPrice($product);
        $line = $price * $quantity;

        if ($couponCode) {
            [$discount] = array_values($this->applyCoupon($couponCode, $subtotalBefore));
            $line = max($line - $discount, 0);
        }

        return $line;
    }
}
