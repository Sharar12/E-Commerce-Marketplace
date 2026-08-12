<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'order_id', 'method', 'status', 'amount', 'transaction_ref', 'masked_account', 'paid_at'];

    protected function casts(): array
    {
        return ['amount' => 'float', 'paid_at' => 'datetime'];
    }
}
