<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'title', 'starts_at', 'ends_at', 'discount_percent', 'active'];

    protected function casts(): array
    {
        return ['discount_percent' => 'integer', 'active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }
}
