<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingItem;
use Illuminate\Http\Request;
use App\Models\ReturnBooking;
use App\Models\ReturnBookingItem;

class BookingItemController extends Controller
{

    function duplicate_check(Request $request){
        $request->validate([
            'invoice_no'=> 'required'
        ]);

        $inv = BookingItem::where('invoice_no', $request->input('invoice_no'))->exists();
        if ($inv) {
            return response()->json(['available'=>false], 200);
        }else{
            return response()->json(['available'=>true], 200);
        }
    }

    function duplicate_return_check(Request $request){
        $request->validate([
            'invoice_no'=> 'required'
        ]);

        $inv = ReturnBookingItem::where('invoice_no', $request->input('invoice_no'))->exists();
        if ($inv) {
            return response()->json(['available'=>false], 200);
        }else{
            return response()->json(['available'=>true], 200);
        }

    }

    public function last_number()
    {
        $item = Booking::latest()->first();

        if ($item) {
            return response()->json($item->cn_no);
        } else {
            return response()->json('Cx000');
        }
    }
    public function last_return_number()
    {
        $item = ReturnBooking::latest()->first();

        if ($item) {
            return response()->json($item->cn_no);
        } else {
            return response()->json('Rx0000');
        }
    }
}
