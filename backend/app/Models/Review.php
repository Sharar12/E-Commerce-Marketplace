<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Review extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'product_id', 'customer_id', 'rating', 'title', 'body', 'images', 'verified_purchase', 'is_flagged', 'flag_reason', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'verified_purchase' => 'boolean',
            'is_flagged' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function reply(): HasOne
    {
        return $this->hasOne(ReviewReply::class, 'review_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
