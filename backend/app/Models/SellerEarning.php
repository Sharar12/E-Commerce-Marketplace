<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerEarning extends Model
{
    use HasFactory;

    protected $fillable = ['seller_id', 'order_id', 'gross', 'commission', 'net'];

    protected function casts(): array
    {
        return ['gross' => 'float', 'commission' => 'float', 'net' => 'float'];
    }
}
