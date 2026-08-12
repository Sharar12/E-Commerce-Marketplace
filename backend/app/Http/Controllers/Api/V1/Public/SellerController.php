<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SellerResource;
use App\Http\Responses\ApiResponse;
use App\Models\SellerProfile;
use Illuminate\Http\JsonResponse;

class SellerController extends Controller
{
    /**
     * GET /sellers
     */
    public function index(): JsonResponse
    {
        $sellers = SellerProfile::query()
            ->with('user:id,name,email,phone,avatar,created_at')
            ->withCount('products')
            ->where('status', 'active')
            ->orderBy('rating', 'desc')
            ->get();

        return ApiResponse::collection(
            SellerResource::collection($sellers)->resolve(),
            $sellers->count()
        );
    }

    /**
     * GET /sellers/{id}
     */
    public function show(string $id): JsonResponse
    {
        $seller = SellerProfile::query()
            ->with('user:id,name,email,phone,avatar,created_at')
            ->withCount('products')
            ->where('status', 'active')
            ->find($id);

        if (! $seller) {
            return ApiResponse::error('Seller not found', 404);
        }

        return ApiResponse::detail(new SellerResource($seller));
    }
}
