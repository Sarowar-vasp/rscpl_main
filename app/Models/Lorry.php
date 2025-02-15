<?php

namespace App\Models;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lorry extends Model
{
    use HasFactory;
    protected $guarded=[];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
