<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SellerProfile extends Model
{
    /** @use HasFactory<\Database\Factories\SellerProfileFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'shop_name',
        'slug',
        'logo',
        'cover_image',
        'category_ids',
        'rating',
        'review_count',
        'followers',
        'status',
        'verification_docs',
        'bank_account',
        'address',
        'bio',
        'response_rate',
        'avg_response_time',
        'commission_rate',
        'payout_balance',
        'pending_payout',
    ];

    protected function casts(): array
    {
        return [
            'category_ids' => 'array',
            'verification_docs' => 'array',
            'bank_account' => 'array',
            'rating' => 'float',
            'commission_rate' => 'float',
            'payout_balance' => 'float',
            'pending_payout' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'seller_id');
    }
}
