<?php

namespace App\Models;

use App\Models\Branch;
use App\Models\Location;
use Illuminate\Database\Eloquent\Model;

class Beat extends Model
{
    protected $guarded=[];

    public function branch() {
        return $this->belongsTo(Branch::class);
    }
    
    public function location() {
        return $this->belongsTo(Location::class);
    }


}
