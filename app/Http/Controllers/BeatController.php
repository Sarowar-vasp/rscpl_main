<?php

namespace App\Http\Controllers;

use App\Models\Beat;
use App\Models\ActivityLog;
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
        $query = Beat::query();

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('beat_no', 'LIKE', "%{$search}%")
                    ->orWhere('rate', 'LIKE', "%{$search}%");
            });
        }

        if ($paginate && $paginate == 'no') {
            $ln = $query->orderBy($orderBy, $order)->get();
            return response()->json($ln);
        } else {
            $ls = $query->orderBy($orderBy, $order)->paginate($perPage);
            return response()->json($ls);
        }
    }

    public function get_locations($beat_no)
    {
        $branchId = optional($this->branch)->id;
        $query = Beat::query();
        $query->where('branch_id', $branchId)->where('beat_no',$beat_no);
        $beats = $query->with('location')->get();
        return response()->json($beats);
    }
    
    public function get_item(Beat $beat)
    {
        $branchId = optional($this->branch)->id;
        if ($branchId && $beat->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to access this beat'], 403);
        }

        return response()->json($beat->with('location'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'beat_no' => 'required|string',
            'location_id' => 'nullable|integer',
            'rate' => 'nullable|numeric',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            $data = $request->all();
            $data['branch_id'] = $branchId;

            $beat = Beat::create($data);
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Beat Added',
                'activity' => 'Beat (' . $beat->beat_no . ') has been added !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Beat has been created successfully.', 'data' => $beat], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create beat', 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, Beat $beat)
    {
        $request->validate([
            'location_id' => 'nullable|string',
            'rate' => 'nullable|numeric',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            if ($branchId && $beat->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to update this beat'], 403);
            }

            $beat->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Beat Updated',
                'activity' => 'Beat (' . $beat->beat_no . ') has been updated !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Beat has been updated successfully.', 'data' => $beat], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update beat', 'error' => $e->getMessage()], 400);
        }
    }

    public function destroy(Beat $beat)
    {
        try {
            $branchId = optional($this->branch)->id;
            if ($branchId && $beat->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to delete this beat'], 403);
            }
            $beat_no = $beat->beat_no;
            $beat->delete();
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Beat Deleted',
                'activity' => 'Beat (' . $beat_no . ') has been deleted !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Beat has been deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete beat', 'error' => $e->getMessage()], 400);
        }
    }
}
