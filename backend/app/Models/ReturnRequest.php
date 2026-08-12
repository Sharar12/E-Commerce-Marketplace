<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'order_id', 'reason', 'detail', 'images', 'requested_at', 'status', 'refund_amount', 'decision_note'];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'refund_amount' => 'float',
            'requested_at' => 'datetime',
        ];
    }
}
