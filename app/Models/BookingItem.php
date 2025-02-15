<?php

namespace App\Models;

use App\Models\Booking;
use App\Models\BookingItemQuantity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BookingItem extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
    public function item_quantities()
    {
        return $this->hasMany(BookingItemQuantity::class);
    }
}
