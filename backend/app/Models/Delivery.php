<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'order_id', 'partner_id', 'status', 'cod_amount', 'cod_collected', 'cod_remitted', 'assigned_at', 'delivered_at'];

    protected function casts(): array
    {
        return ['cod_amount' => 'float', 'cod_collected' => 'float', 'cod_remitted' => 'float', 'assigned_at' => 'datetime', 'delivered_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
