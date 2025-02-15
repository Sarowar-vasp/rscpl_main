<?php

namespace App\Models;

use App\Models\ReturnBooking;
use Illuminate\Database\Eloquent\Model;

class ReturnDocument extends Model
{
    //
    protected $guarded = [];

    public function booking()
    {
       return $this->belongsTo(ReturnBooking::class);
    }
    
}
