<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CmsBanner;
use App\Models\Coupon;
use App\Models\FlashSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PromotionController extends Controller
{
    /**
     * GET /promotions — { coupons, flashSales, banners } in one payload,
     * matching what the admin/seller promotions pages render.
     */
    public function index(): JsonResponse
    {
        $data = Cache::remember('catalog:promotions', 600, function () {
            $coupons = Coupon::query()->orderBy('created_at', 'desc')->get()->map(fn (Coupon $c) => [
                'id' => $c->id,
                'code' => $c->code,
                'title' => $c->title,
                'discountType' => $c->discount_type,
                'discountValue' => (float) $c->discount_value,
                'minOrder' => (float) $c->min_order,
                'maxDiscount' => $c->max_discount !== null ? (float) $c->max_discount : null,
                'startsAt' => $c->starts_at?->toIso8601String(),
                'endsAt' => $c->ends_at?->toIso8601String(),
                'usageLimit' => $c->usage_limit,
                'usedCount' => $c->used_count,
                'active' => (bool) $c->active,
            ])->values();

            $flashSales = FlashSale::query()->orderBy('created_at', 'desc')->get()->map(fn (FlashSale $f) => [
                'id' => $f->id,
                'title' => $f->title,
                'startsAt' => $f->starts_at?->toIso8601String(),
                'endsAt' => $f->ends_at?->toIso8601String(),
                'discountPercent' => (int) $f->discount_percent,
                'active' => (bool) $f->active,
                'productIds' => [],
            ])->values();

            $banners = CmsBanner::where('active', true)->get()->map(fn (CmsBanner $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'subtitle' => $b->subtitle,
                'image' => $b->image,
                'ctaLabel' => $b->cta_label,
                'ctaHref' => $b->cta_href,
                'bgClass' => $b->bg_class,
                'active' => (bool) $b->active,
                'startsAt' => $b->starts_at?->toIso8601String(),
                'endsAt' => $b->ends_at?->toIso8601String(),
            ])->values();

            return ['coupons' => $coupons, 'flashSales' => $flashSales, 'banners' => $banners];
        });

        return response()->json($data);
    }
}
