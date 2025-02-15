<?php

namespace App\Http\Controllers;

use App\Models\Party;
use App\Models\Booking;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartyController extends Controller
{
    /**
     * Response a list of the resource.
     */
    public function get_allitems()
    {
        $branchId = optional($this->branch)->id;
        $query = Party::whereHas('location', function ($query) use ($branchId) {
            $query->where('branch_id', $branchId);
        })->with(['cr_bookings', 'ce_bookings', 'location']);

        $items = $query->orderByRaw('CASE WHEN is_consignor = 1 THEN 0 ELSE 1 END')
                       ->orderBy('name')
                       ->get();

        return response()->json($items);
    }


    public function get_items(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'created_at');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');
        $branchId = optional($this->branch)->id;
        $query = Party::query()->whereHas('location', function ($subQuery) use ($branchId) {
            $subQuery->where('branch_id', $branchId);
        });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        $query->orderByRaw('CASE WHEN is_consignor = 1 THEN 0 ELSE 1 END')
              ->orderBy('name');

        $items = $query->with('location')->orderBy($orderBy, $order)->paginate($perPage);
        return response()->json($items);
    }


    public function get_item(Party $party)
    {
        $branchId = optional($this->branch)->id;
        $bs = Booking::where('consignee', $party->id)->whereHas('manifest', function ($query) use ($branchId) {
            $query->where('branch_id', $branchId);
        })->get();
        $party->bookings = $bs;
        return response()->json($party);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        try {
            $iu = Party::create($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Party added',
                'activity' => 'Party (' . $iu->name . ') has been created.',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);

            return response()->json(['message' => 'Item has been created successfully.', 'data' => $iu], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create Item', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Party $party)
    {
        $request->validate([
            'name' => 'nullable|string',
        ]);

        try {
            $party->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Party updated',
                'activity' => 'Party (' . $party->name . ') has been updated.',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Unit has been updated successfully.', 'data' => $party], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update Unit', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Party $party)
    {
        if (!$party) {
            return response()->json(['message' => 'Unit not found'], 404);
        }

        try {

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Party removed',
                'activity' => 'Party (' . $party->name . ') has been removed.',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            $party->delete();
            return response()->json(['message' => 'Unit has been deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete Unit', 'error' => $e->getMessage()], 400);
        }
    }
}
