<?php

namespace App\Models;

use App\Models\Booking;
use App\Models\Location;
use App\Models\Manifest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Party extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function manifests()
    {
        return $this->hasMany(Manifest::class);
    }
    
    public function cr_bookings()
    {
        return $this->hasMany(Booking::class, 'consignor');
    }

    public function ce_bookings()
    {
        return $this->hasMany(Booking::class, 'consignee');
    }
}
