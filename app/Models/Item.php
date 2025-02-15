<?php

namespace App\Models;

use App\Models\Branch;
use App\Models\ItemUnit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Item extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function unit()
    {
        return $this->belongsTo(ItemUnit::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
