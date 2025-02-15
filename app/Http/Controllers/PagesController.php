<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Inertia\Inertia;
use App\Models\Lorry;
use App\Models\Party;
use App\Models\Branch;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Manifest;
use Illuminate\Http\Request;

class PagesController extends Controller
{

    function test()
    {
        return Inertia::render('Test');
    }

    function welcome()
    {
        return Inertia::render('Welcome');
    }


    function dashboard()
    {
        return Inertia::render('Dashboard/index');
    }

    function item_unit()
    {
        return Inertia::render('Dashboard/Master/ItemUnit/index');
    }

    function location_master()
    {
        return Inertia::render('Dashboard/Master/Location/index');
    }

    function rate_master()
    {
        return Inertia::render('Dashboard/Master/Rate/index');
    }

    function branch_master()
    {

        return Inertia::render('Dashboard/Master/Branch/index');
    }

    function party_master()
    {
        return Inertia::render('Dashboard/Master/Party/index');
    }
    function item_master()
    {
        return Inertia::render('Dashboard/Master/Item/index');
    }

    function lorry_master()
    {
        return Inertia::render('Dashboard/Master/Lorry/index');
    }

    // 
    function manifest_list()
    {
        $branchId = optional($this->branch)->id;
        $lr = Lorry::where('branch_id', $branchId)->get();
        $ls = Location::where('branch_id', $branchId)->get();
        return Inertia::render('Dashboard/Transaction/Manifest/index', [
            'lorries' => $lr,
            'locations' => $ls
        ]);
    }

    function booking_list()
    {
        $branchId = optional($this->branch)->id;
        // $mani = Manifest::with('lorry')->where('branch_id', $branchId)->get();
        $brnchs = Branch::all();
        $items = Item::where('branch_id', $branchId)->get();
        $lr = Lorry::where('branch_id', $branchId)->get();
        $ls = Location::where('branch_id', $branchId)->get();
        return Inertia::render('Dashboard/Transaction/Booking/index', [
            'branches' => $brnchs,
            'items' => $items,
            'lorries' => $lr,
            'locations' => $ls
        ]);
    }

    public function booking_report(Request $request)
    {
        return Inertia::render('Dashboard/Report/ConsignmentReport');
    }

    public function party_booking_report(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $parties = Party::where('is_consignor', 0)->where('branch_id', $branchId)->get();
        return Inertia::render('Dashboard/Report/PartyReport', ['parties' => $parties]);
    }


    function track_status(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $bookingsQry = Booking::whereHas('manifest', function ($query) use ($branchId) {
            $query->where('branch_id', $branchId);
        })->with([
            'manifest.branch',
            'manifest.lorry',
            'consignor.location',
            'consignee.location',
            'items.item_quantities'
        ]);

        $bookings = $bookingsQry->get();
        if ($request->filled('cn_no')) {
            $booking = $bookingsQry->where('cn_no', $request->input('cn_no'))->first();
        } else {
            $booking = null;
        }
        
        return Inertia::render('Dashboard/Tracking/index', [
            'bookings' => $bookings,
            'booking' => $booking,
        ]);
    }
}
