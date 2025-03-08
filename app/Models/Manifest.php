<?php

namespace App\Models;

use App\Models\Lorry;
use App\Models\Branch;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Manifest extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function lorry()
    {
        return $this->belongsTo(Lorry::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

}
