<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'code', 'customer_id', 'customer_name', 'subject', 'category', 'status', 'priority', 'order_code', 'assigned_agent_id', 'created_by', 'sla_deadline', 'escalated', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return ['escalated' => 'array', 'sla_deadline' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class, 'ticket_id')->orderBy('created_at');
    }
}
