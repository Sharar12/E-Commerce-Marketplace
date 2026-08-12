<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'variant_id', 'stock', 'low_stock_threshold', 'reserved', 'restocked_at'];

    protected function casts(): array
    {
        return ['restocked_at' => 'datetime'];
    }
}
