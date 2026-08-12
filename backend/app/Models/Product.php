<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'seller_id', 'category_id', 'brand', 'sku', 'name', 'slug', 'description',
        'highlights', 'price', 'mrp', 'currency', 'stock', 'rating', 'review_count',
        'sold_count', 'tags', 'is_flash_sale', 'flash_sale_ends_at', 'is_featured',
        'is_published', 'is_flagged', 'flag_reason', 'delivery_estimate_days',
        'free_delivery', 'created_at', 'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'highlights' => 'array',
            'tags' => 'array',
            'delivery_estimate_days' => 'array',
            'price' => 'float',
            'mrp' => 'float',
            'rating' => 'float',
            'is_flash_sale' => 'boolean',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'is_flagged' => 'boolean',
            'free_delivery' => 'boolean',
            'flash_sale_ends_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('sort_order');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }
}
