<?php

namespace App\Models;

use App\Models\Party;
use App\Models\Manifest;
use App\Models\ReturnDocument;
use App\Models\ReturnBookingItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReturnBooking extends Model
{
    use HasFactory;
    protected $guarded=[];

    public function manifest()
    {
        return $this->belongsTo(Manifest::class);
    }
    
    public function items()
    {
        return $this->hasMany(ReturnBookingItem::class);
    }
    
    public function consignor()
    {
        return $this->belongsTo(Party::class, 'consignor');
    }

    public function consignee()
    {
        return $this->belongsTo(Party::class, 'consignee');
    }

    public function document()
    {
        return $this->hasOne(ReturnDocument::class);
    }
}
