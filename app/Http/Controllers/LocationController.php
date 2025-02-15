<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Location;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LocationController extends Controller
{

    public function get_locations(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $paginate = $request->input('paginate');
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'name');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');
        $query = Location::query();
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('address', 'LIKE', "%{$search}%")
                    ->orWhere('beat_no', 'LIKE', "%{$search}%");
            });
        }

        if ($paginate && $paginate == 'no') {
            $ln = Location::where('branch_id', $branchId)->get();
            return response()->json($ln);
        } else {
            $ls = $query->orderBy($orderBy, $order)->paginate($perPage);
            return response()->json($ls);
        }
    }

    public function get_location(Location $location)
    {
        $branchId = optional($this->branch)->id;
        if ($branchId && $location->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to access this location'], 403);
        }
        return response()->json($location);
    }

    public function store(Request $request)
    {

        $request->validate([
            'name' => 'required|string',
            'beat_no' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            $data = $request->all();
            $data['branch_id'] = $branchId;

            $loc = Location::create($data);
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Location Added',
                'activity' => 'Location (' . $loc->name . ') has been added !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Location has been created successfully.', 'data' => $loc], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create location', 'error' => $e->getMessage()], 400);
        }
    }


    public function update(Request $request, Location $location)

    {
        $request->validate([
            'name' => 'nullable|string',
            'beat_no' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            if ($location->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to update this location'], 403);
            }

            $location->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Location updated',
                'activity' => 'Location (' . $location->name . ') has been updated !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Location has been updated successfully.', 'data' => $location], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update location', 'error' => $e->getMessage()], 400);
        }
    }


    public function destroy(Location $location)
    {

        if (!$location) {
            return response()->json(['message' => 'Location not found'], 404);
        }

        $branchId = optional($this->branch)->id;
        if ($location->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to delete this location'], 403);
        }

        try {
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Location removed',
                'activity' => 'Location (' . $location->name . ') has been removed !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            $location->delete();
            return response()->json(['message' => 'Location has been deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete location', 'error' => $e->getMessage()], 400);
        }
    }
}
