<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryPartnerProfile extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveryPartnerProfileFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'vehicle',
        'service_areas',
        'online',
        'rating',
        'completed_deliveries',
        'completion_rate',
        'earnings_today',
        'earnings_week',
        'total_earnings',
        'payout_balance',
    ];

    protected function casts(): array
    {
        return [
            'vehicle' => 'array',
            'service_areas' => 'array',
            'online' => 'boolean',
            'rating' => 'float',
            'completion_rate' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
