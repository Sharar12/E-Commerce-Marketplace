<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'order_code', 'customer_id', 'customer_name', 'customer_phone', 'customer_email',
        'seller_id', 'subtotal', 'discount', 'shipping_fee', 'tax', 'total', 'coupon_code',
        'payment_method', 'payment_status', 'status', 'delivery_address', 'assigned_partner_id',
        'eta', 'delivery_note', 'cod_amount', 'placed_at', 'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'delivery_address' => 'array',
            'subtotal' => 'float',
            'discount' => 'float',
            'shipping_fee' => 'float',
            'tax' => 'float',
            'total' => 'float',
            'cod_amount' => 'float',
            'eta' => 'datetime',
            'placed_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class, 'order_id')->orderBy('timestamp');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id');
    }

    public function returnRequest(): HasOne
    {
        return $this->hasOne(ReturnRequest::class, 'order_id');
    }
}
