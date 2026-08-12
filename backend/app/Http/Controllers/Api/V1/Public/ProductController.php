<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Responses\ApiResponse;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    /**
     * GET /products — filtered, paginated catalog.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with(['images', 'variants', 'category'])
            ->where('is_published', true);

        // Filters — mirrors the frontend ProductFilters contract.
        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->input('categoryId'));
        }
        if ($request->filled('brand')) {
            $query->where('brand', $request->input('brand'));
        }
        if ($request->filled('minPrice')) {
            $query->where('price', '>=', (float) $request->input('minPrice'));
        }
        if ($request->filled('maxPrice')) {
            $query->where('price', '<=', (float) $request->input('maxPrice'));
        }
        if ($request->filled('minRating')) {
            $query->where('rating', '>=', (float) $request->input('minRating'));
        }
        if ($request->boolean('inStockOnly')) {
            $query->where('stock', '>', 0);
        }
        if ($request->filled('sellerId')) {
            $query->where('seller_id', $request->input('sellerId'));
        }
        if ($request->filled('q')) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', '%'.$request->input('q').'%')
                ->orWhere('brand', 'like', '%'.$request->input('q').'%'));
        }

        // Sort contract.
        $sort = $request->input('sort', 'popular');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'newest' => $query->orderBy('created_at', 'desc'),
            'rating' => $query->orderBy('rating', 'desc'),
            default => $query->orderBy('sold_count', 'desc'),
        };

        $pageSize = min((int) $request->input('pageSize', 24), 100);

        // Cache the rendered payload by its full filter signature (short TTL).
        $key = 'catalog:products:'.md5($request->fullUrl());

        $data = Cache::remember($key, 300, fn () => ApiResponse::paginated(
            $query->paginate($pageSize)->withQueryString(),
            ProductResource::class
        )->getData(true));

        return response()->json($data);
    }

    /**
     * GET /products/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $product = Product::with(['images', 'variants', 'category'])
            ->where('is_published', true)
            ->find($id);

        if (! $product) {
            return ApiResponse::error('Product not found', 404);
        }

        return ApiResponse::detail(
            Cache::remember('catalog:product:'.$id, 600, fn () => (new ProductResource($product))->resolve())
        );
    }

    /**
     * GET /products/category?categoryId=
     */
    public function category(Request $request): JsonResponse
    {
        $query = Product::with(['images', 'variants', 'category'])
            ->where('is_published', true);

        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->input('categoryId'));
        }

        $products = $query->orderBy('sold_count', 'desc')->limit(24)->get();

        return ApiResponse::collection(
            ProductResource::collection($products)->resolve(),
            $products->count()
        );
    }

    /**
     * GET /products/flash-sale
     */
    public function flashSale(): JsonResponse
    {
        $data = Cache::remember('catalog:flash-sale', 300, function () {
            $products = Product::with(['images', 'variants', 'category'])
                ->where('is_published', true)
                ->where('is_flash_sale', true)
                ->orderBy('sold_count', 'desc')
                ->limit(12)
                ->get();

            return ApiResponse::collection(
                ProductResource::collection($products)->resolve(),
                $products->count()
            )->getData(true);
        });

        return response()->json($data);
    }

    /**
     * GET /products/recommended
     */
    public function recommended(): JsonResponse
    {
        $data = Cache::remember('catalog:recommended', 300, function () {
            $products = Product::with(['images', 'variants', 'category'])
                ->where('is_published', true)
                ->where(function ($q) {
                    $q->where('is_featured', true)->orWhere('rating', '>=', 4.3);
                })
                ->orderBy('rating', 'desc')
                ->limit(12)
                ->get();

            return ApiResponse::collection(
                ProductResource::collection($products)->resolve(),
                $products->count()
            )->getData(true);
        });

        return response()->json($data);
    }

    /**
     * GET /products/top-sellers
     */
    public function topSellers(): JsonResponse
    {
        $data = Cache::remember('catalog:top-sellers', 300, function () {
            $products = Product::with(['images', 'variants', 'category'])
                ->where('is_published', true)
                ->orderBy('sold_count', 'desc')
                ->limit(12)
                ->get();

            return ApiResponse::collection(
                ProductResource::collection($products)->resolve(),
                $products->count()
            )->getData(true);
        });

        return response()->json($data);
    }

    /**
     * GET /products/search-suggest?q=
     */
    public function searchSuggest(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));
        if (mb_strlen($q) < 2) {
            return ApiResponse::collection([], 0);
        }

        $products = Product::with('images')
            ->where('is_published', true)
            ->where(fn ($query) => $query
                ->where('name', 'like', "%{$q}%")
                ->orWhere('brand', 'like', "%{$q}%"))
            ->orderBy('sold_count', 'desc')
            ->limit(6)
            ->get();

        $items = $products->map(fn (Product $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'price' => (float) $p->price,
            'image' => $p->images->first()?->url ?? '',
            'brand' => $p->brand,
        ])->values();

        return ApiResponse::collection($items->all(), $items->count());
    }
}
