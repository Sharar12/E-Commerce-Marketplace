<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Http\Responses\ApiResponse;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * GET /categories
     */
    public function index(): JsonResponse
    {
        $categories = Cache::remember('catalog:categories', 3600, fn () =>
            Category::query()->orderBy('product_count', 'desc')->get()
        );

        return ApiResponse::collection(
            CategoryResource::collection($categories)->resolve(),
            $categories->count()
        );
    }
}
