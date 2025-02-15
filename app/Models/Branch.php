<?php

namespace App\Models;

use App\Models\User;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Manifest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Branch extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    
    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function manifests()
    {
        return $this->hasMany(Manifest::class);
    }
}
