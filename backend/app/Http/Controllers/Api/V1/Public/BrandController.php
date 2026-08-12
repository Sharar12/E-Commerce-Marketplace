<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BrandResource;
use App\Http\Responses\ApiResponse;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    /**
     * GET /brands
     */
    public function index(): JsonResponse
    {
        $brands = Cache::remember('catalog:brands', 3600, fn () =>
            Brand::query()->orderBy('name')->get()
        );

        return ApiResponse::collection(
            BrandResource::collection($brands)->resolve(),
            $brands->count()
        );
    }
}
