<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Responses\ApiResponse;
use App\Models\Product;
use App\Models\ProductImage;
use App\Policies\ProductPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * ProductManageController — seller product create/update.
 *
 *   POST /products        create a new listing under the seller's profile
 *   PUT  /products/{id}   update an existing listing (seller or admin only)
 */
class ProductManageController extends Controller
{
    /**
     * POST /products
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! app(ProductPolicy::class)->create($user)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'price' => 'required|numeric|min:0',
            'mrp' => 'sometimes|nullable|numeric|min:0',
            'stock' => 'sometimes|nullable|integer|min:0',
            'categoryId' => 'sometimes|nullable|string',
            'brand' => 'sometimes|nullable|string|max:100',
            'highlights' => 'sometimes|nullable|array',
            'highlights.*' => 'string',
            'images' => 'sometimes|nullable|array|max:6',
            'images.*.url' => 'required|string',
            'images.*.alt' => 'sometimes|string',
            'isPublished' => 'sometimes|boolean',
        ]);

        $sellerId = $user->role === 'seller' ? $user->sellerProfile?->id : ($request->input('sellerId') ?? 'sel-techpoint');

        $id = 'prd-'.Str::lower(Str::random(10));
        $product = Product::create([
            'id' => $id,
            'seller_id' => $sellerId,
            'category_id' => $validated['categoryId'] ?? 'cat-electronics',
            'brand' => $validated['brand'] ?? 'Generic',
            'sku' => 'SKU-'.strtoupper(Str::random(8)),
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(4)),
            'description' => $validated['description'] ?? '',
            'highlights' => $validated['highlights'] ?? [],
            'price' => $validated['price'],
            'mrp' => $validated['mrp'] ?? $validated['price'],
            'stock' => $validated['stock'] ?? 0,
            'is_published' => (bool) ($validated['isPublished'] ?? true),
        ]);

        $this->syncImages($product, $validated['images'] ?? []);
        $this->invalidateCatalogCache($product->id);

        return response()->json([
            'data' => (new ProductResource($product->load(['images', 'variants', 'category']))),
            'message' => 'Product created',
        ], 201);
    }

    /**
     * PUT /products/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return ApiResponse::error('Product not found', 404);
        }

        $user = $request->user();

        if (! app(ProductPolicy::class)->update($user, $product)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'mrp' => 'sometimes|nullable|numeric|min:0',
            'stock' => 'sometimes|nullable|integer|min:0',
            'categoryId' => 'sometimes|nullable|string',
            'brand' => 'sometimes|nullable|string|max:100',
            'highlights' => 'sometimes|nullable|array',
            'highlights.*' => 'string',
            'images' => 'sometimes|nullable|array|max:6',
            'images.*.url' => 'required|string',
            'images.*.alt' => 'sometimes|string',
            'isPublished' => 'sometimes|boolean',
        ]);

        $product->update([
            'name' => $validated['name'] ?? $product->name,
            'description' => $validated['description'] ?? $product->description,
            'price' => $validated['price'] ?? $product->price,
            'mrp' => $validated['mrp'] ?? $product->mrp,
            'stock' => $validated['stock'] ?? $product->stock,
            'brand' => $validated['brand'] ?? $product->brand,
            'highlights' => $validated['highlights'] ?? $product->highlights,
            'is_published' => array_key_exists('isPublished', $validated)
                ? (bool) $validated['isPublished']
                : $product->is_published,
        ]);

        if (array_key_exists('images', $validated)) {
            $this->syncImages($product, $validated['images']);
        }

        $this->invalidateCatalogCache($product->id);

        return ApiResponse::detail(new ProductResource($product->load(['images', 'variants', 'category'])));
    }

    /**
     * Drop cached product detail + listing pages so edits appear immediately.
     */
    private function invalidateCatalogCache(string $productId): void
    {
        Cache::forget('catalog:product:'.$productId);
        Cache::forget('catalog:flash-sale');
        Cache::forget('catalog:recommended');
        Cache::forget('catalog:top-sellers');

        // Scrub every per-filter /products listing key (raw Redis keys).
        try {
            $client = app('redis')->connection()->client();
            foreach ($client->keys('*catalog:products:*') as $key) {
                $client->del([$key]);
            }
        } catch (\Throwable) {
            // Redis unavailable — cache invalidation is best-effort in dev.
        }
    }

    /**
     * Replace the product's image set (delete-then-insert keeps order simple).
     */
    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach ($images as $i => $img) {
            ProductImage::create([
                'id' => 'pimg-'.Str::lower(Str::random(12)),
                'product_id' => $product->id,
                'url' => $img['url'],
                'alt' => $img['alt'] ?? $product->name,
                'sort_order' => $i,
            ]);
        }
    }
}
