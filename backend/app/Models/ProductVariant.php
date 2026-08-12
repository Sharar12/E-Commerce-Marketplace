<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'product_id', 'name', 'value', 'price_delta', 'stock'];

    protected function casts(): array
    {
        return ['price_delta' => 'float'];
    }
}
