<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'user_id', 'label', 'name', 'phone', 'line1', 'line2', 'city', 'area', 'postal_code', 'is_default'];

    protected function casts(): array
    {
        return ['is_default' => 'boolean'];
    }
}
