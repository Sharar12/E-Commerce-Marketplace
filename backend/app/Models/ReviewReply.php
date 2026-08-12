<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewReply extends Model
{
    use HasFactory;

    protected $fillable = ['review_id', 'seller_id', 'body'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }
}
