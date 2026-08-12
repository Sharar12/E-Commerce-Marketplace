<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ReviewResource;
use App\Http\Responses\ApiResponse;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * GET /reviews?productId=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()
            ->with(['customer:id,name,avatar', 'reply'])
            ->where('is_flagged', false);

        if ($request->filled('productId')) {
            $query->where('product_id', $request->input('productId'));
        }

        if ($request->filled('sellerId')) {
            $query->whereHas('product', fn ($q) => $q->where('seller_id', $request->input('sellerId')));
        }

        $reviews = $query->orderBy('created_at', 'desc')->limit(50)->get();

        return ApiResponse::collection(
            ReviewResource::collection($reviews)->resolve(),
            $reviews->count()
        );
    }
}
