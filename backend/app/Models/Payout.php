<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'seller_id', 'amount', 'method', 'account_summary', 'status', 'transaction_ref', 'period_start', 'period_end', 'paid_at'];

    protected function casts(): array
    {
        return ['amount' => 'float', 'period_start' => 'datetime', 'period_end' => 'datetime', 'paid_at' => 'datetime'];
    }
}
