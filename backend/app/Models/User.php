<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasApiTokens, Notifiable;

    /**
     * String primary keys (frontend mock IDs, not auto-increment ints).
     */
    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'role',
        'name',
        'email',
        'phone',
        'avatar',
        'password',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function customerProfile(): HasOne
    {
        return $this->hasOne(CustomerProfile::class, 'user_id');
    }

    public function sellerProfile(): HasOne
    {
        return $this->hasOne(SellerProfile::class, 'user_id');
    }

    public function deliveryPartnerProfile(): HasOne
    {
        return $this->hasOne(DeliveryPartnerProfile::class, 'user_id');
    }

    public function supportAgentProfile(): HasOne
    {
        return $this->hasOne(SupportAgentProfile::class, 'user_id');
    }

    /**
     * The frontend's SessionUser shape — returned by /auth/login and /auth/me.
     */
    public function sessionPayload(): array
    {
        $payload = [
            'id' => $this->id,
            'role' => $this->role,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone ?? '',
            'avatar' => $this->avatar ?? '',
        ];

        if ($this->role === 'seller' && $this->sellerProfile) {
            $payload['sellerId'] = $this->sellerProfile->id;
            $payload['shopName'] = $this->sellerProfile->shop_name;
        }

        if ($this->role === 'delivery' && $this->deliveryPartnerProfile) {
            $payload['partnerId'] = $this->deliveryPartnerProfile->id;
        }

        if ($this->role === 'support' && $this->supportAgentProfile) {
            $payload['agentId'] = $this->supportAgentProfile->id;
        }

        return $payload;
    }
}
