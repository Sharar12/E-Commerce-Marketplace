<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketMessage extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'ticket_id', 'author_id', 'author_name', 'author_role', 'body', 'is_internal_note', 'created_at'];

    protected function casts(): array
    {
        return ['is_internal_note' => 'boolean', 'created_at' => 'datetime'];
    }
}
