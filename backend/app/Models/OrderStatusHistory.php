<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'order_status_history';

    protected $fillable = ['order_id', 'status', 'label', 'timestamp', 'note'];

    protected function casts(): array
    {
        return ['timestamp' => 'datetime'];
    }
}
