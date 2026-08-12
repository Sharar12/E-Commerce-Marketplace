<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'code', 'title', 'discount_type', 'discount_value', 'min_order', 'max_discount', 'starts_at', 'ends_at', 'usage_limit', 'used_count', 'active'];

    protected function casts(): array
    {
        return ['discount_value' => 'float', 'min_order' => 'float', 'max_discount' => 'float', 'usage_limit' => 'integer', 'used_count' => 'integer', 'active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }
}
