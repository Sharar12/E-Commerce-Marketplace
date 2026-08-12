<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'parent_id', 'name', 'slug', 'icon', 'image', 'product_count'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
