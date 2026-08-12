<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KnowledgeArticle extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['id', 'title', 'category', 'body', 'views', 'updated_at'];

    protected function casts(): array
    {
        return ['updated_at' => 'datetime', 'views' => 'integer'];
    }
}
