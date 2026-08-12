<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'order_id', 'product_id', 'name', 'image', 'quantity', 'price', 'variant_label', 'seller_id'];

    protected function casts(): array
    {
        return ['price' => 'float'];
    }
}
