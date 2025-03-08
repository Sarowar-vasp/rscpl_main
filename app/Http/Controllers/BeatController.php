<?php

namespace App\Http\Controllers;

use App\Models\Beat;
use App\Models\ActivityLog;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BeatController extends Controller
{
    public function get_items(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $paginate = $request->input('paginate');
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'beat_no');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');

        $query = Beat::with('location')->where('branch_id', $branchId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('beat_no', 'LIKE', "%{$search}%")
                    ->orWhere('rate', 'LIKE', "%{$search}%");
            });
        }

        $query->orderBy($orderBy, $order);

        return response()->json($paginate === 'no' ? $query->get() : $query->paginate($perPage));
    }

    public function get_locations($beat_no)
    {
        $branchId = optional($this->branch)->id;
        if (!$branchId) {
            return response()->json(['error' => 'Branch ID not found'], 400);
        }

        $beatLocations = Beat::where('beat_no', $beat_no)
            ->where('branch_id', $branchId)
            ->get();

        if ($beatLocations->isEmpty()) {
            return response()->json(['error' => 'No beats found for given beat number'], 404);
        }

        $locationIds = $beatLocations->pluck('location_id');
        $locations = Location::whereIn('id', $locationIds)->get();

        return response()->json($locations);
    }


    public function get_item(Beat $beat)
    {
        $branchId = optional($this->branch)->id;
        if ($beat->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to access this beat'], 403);
        }

        return response()->json($beat->load('location'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'beat_no' => 'required|string',
            'location_id' => 'nullable|integer|exists:locations,id',
            'rate' => 'nullable|numeric',
        ]);

        try {
            $branchId = optional($this->branch)->id;

            if ($request->location_id && Beat::where('beat_no', $request->beat_no)->where('location_id', $request->location_id)->exists()) {
                return response()->json(['message' => 'Location already assigned to this beat number'], 400);
            }

            $beat = Beat::create(array_merge($request->all(), ['branch_id' => $branchId]));

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Beat Added',
                'activity' => "Beat ({$beat->beat_no}) has been added!",
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now(),
            ]);

            return response()->json(['message' => 'Beat created successfully.', 'data' => $beat], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create beat', 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, Beat $beat)
    {
        $request->validate([
            'beat_no' => 'nullable|string',
            'location_id' => 'nullable|integer|exists:locations,id',
            'rate' => 'nullable|numeric',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            if ($beat->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to update this beat'], 403);
            }

            if ($request->location_id && Beat::where('beat_no', $beat->beat_no)->where('location_id', $request->location_id)->where('id', '!=', $beat->id)->exists()) {
                return response()->json(['message' => 'Location already assigned to this beat number'], 400);
            }

            $beat->update($request->all());

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Beat Updated',
                'activity' => "Beat ({$beat->beat_no}) has been updated!",
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now(),
            ]);

            return response()->json(['message' => 'Beat updated successfully.', 'data' => $beat], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update beat', 'error' => $e->getMessage()], 400);
        }
    }

    public function destroy(Beat $beat)
    {
        try {
            $branchId = optional($this->branch)->id;
            if ($beat->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to delete this beat'], 403);
            }

            $beat_no = $beat->beat_no;
            $beat->delete();

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Beat Deleted',
                'activity' => "Beat ({$beat_no}) has been deleted!",
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now(),
            ]);

            return response()->json(['message' => 'Beat deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete beat', 'error' => $e->getMessage()], 400);
        }
    }
}
