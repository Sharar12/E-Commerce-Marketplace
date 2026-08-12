<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Log;

/**
 * InventoryService — stock integrity, low-stock alerts, restocking.
 */
class InventoryService
{
    public const LOW_STOCK_THRESHOLD = 5;

    /**
     * Atomically reserve stock; returns the product on success or throws
     * when insufficient stock remains.
     */
    public function reserve(string $productId, int $quantity): Product
    {
        $updated = Product::where('id', $productId)
            ->where('stock', '>=', $quantity)
            ->decrement('stock', $quantity);

        if (! $updated) {
            throw new \RuntimeException("Insufficient stock for product {$productId}.");
        }

        $product = Product::findOrFail($productId);

        if ($this->isLowStock($product)) {
            $this->alertLowStock($product);
        }

        return $product;
    }

    public function release(string $productId, int $quantity): void
    {
        Product::where('id', $productId)->increment('stock', $quantity);
    }

    public function restock(string $productId, int $quantity): void
    {
        Product::where('id', $productId)->increment('stock', $quantity);
    }

    public function isLowStock(Product $product): bool
    {
        return $product->stock <= self::LOW_STOCK_THRESHOLD;
    }

    /**
     * Every seller's low-stock catalogue (for seller dashboards + alerts).
     */
    public function lowStockForSeller(string $sellerId): \Illuminate\Database\Eloquent\Collection
    {
        return Product::where('seller_id', $sellerId)
            ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->get();
    }

    public function alertLowStock(Product $product): void
    {
        Log::channel('daily')->warning("Low stock alert: [{$product->id}] {$product->name} — {$product->stock} left.");
    }
}
