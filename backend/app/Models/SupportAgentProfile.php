<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportAgentProfile extends Model
{
    /** @use HasFactory<\Database\Factories\SupportAgentProfileFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'agent_role',
        'tickets_resolved',
        'avg_response_time',
        'satisfaction_score',
        'skills',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'satisfaction_score' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
