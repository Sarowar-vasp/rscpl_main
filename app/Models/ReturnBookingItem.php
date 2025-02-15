<?php

namespace App\Models;

use App\Models\ReturnBooking;
use App\Models\ReturnItemQuantity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReturnBookingItem extends Model
{
    use HasFactory;

    protected $guarded=[];

    public function item_quantities()
    {
        return $this->hasMany(ReturnItemQuantity::class);
    }

    public function booking()
    {
        return $this->belongsTo(ReturnBooking::class);
    }
}
