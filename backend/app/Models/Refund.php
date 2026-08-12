<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'payment_id', 'return_request_id', 'amount', 'status', 'processed_at'];

    protected function casts(): array
    {
        return ['amount' => 'float', 'processed_at' => 'datetime'];
    }
}
