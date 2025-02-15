<?php

namespace App\Models;

use App\Models\Party;
use App\Models\Document;
use App\Models\Manifest;
use App\Models\BookingItem;
use App\Models\BookingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function manifest()
    {
        return $this->belongsTo(Manifest::class);
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function consignor()
    {
        return $this->belongsTo(Party::class, 'consignor', 'id');
    }

    public function consignee()
    {
        return $this->belongsTo(Party::class, 'consignee');
    }
    public function statuses()
    {
        return $this->hasMany(BookingStatus::class);
    }
    
    public function document()
    {
        return $this->hasOne(Document::class);
    }
}
