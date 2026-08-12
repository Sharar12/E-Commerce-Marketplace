<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'admin_id', 'admin_name', 'action', 'target', 'detail', 'at'];

    protected function casts(): array
    {
        return ['at' => 'datetime'];
    }
}
