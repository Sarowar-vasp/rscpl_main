<?php

namespace App\Models;

use App\Models\Item;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemUnit extends Model
{
    use HasFactory;
    protected $guarded=[];

    public function items() {
        return $this->hasMany(Item::class);
    }
}
