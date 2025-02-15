<?php

namespace App\Http\Controllers;

use App\Models\Rate;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RateController extends Controller
{
    public function get_items(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $paginate = $request->input('paginate');
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'beat_no');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');
        $query = Rate::query();

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

    public function get_item(Rate $rate)
    {
        $branchId = optional($this->branch)->id;
        if ($branchId && $rate->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to access this rate'], 403);
        }
        return response()->json($rate);
    }

    public function store(Request $request)
    {
        $request->validate([
            'beat_no' => 'nullable|string',
            'rate' => 'nullable|numeric',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            $data = $request->all();
            $data['branch_id'] = $branchId;

            $rte = Rate::create($data);
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Rate Added',
                'activity' => 'Rate (' . $rte->beat_no . ') has been added !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Rate has been created successfully.', 'data' => $rte], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create rate', 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, Rate $rate)
    {
        $request->validate([
            'beat_no' => 'nullable|string',
            'rate' => 'nullable|numeric',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            if ($branchId && $rate->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to update this rate'], 403);
            }

            $rate->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Rate Updated',
                'activity' => 'Rate (' . $rate->beat_no . ') has been updated !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Rate has been updated successfully.', 'data' => $rate], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update rate', 'error' => $e->getMessage()], 400);
        }
    }

    public function destroy(Rate $rate)
    {
        try {
            $branchId = optional($this->branch)->id;
            if ($branchId && $rate->branch_id !== $branchId) {
                return response()->json(['message' => 'Unauthorized to delete this rate'], 403);
            }
            $beat_no = $rate->beat_no;
            $rate->delete();
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Rate Deleted',
                'activity' => 'Rate (' . $beat_no . ') has been deleted !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Rate has been deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete rate', 'error' => $e->getMessage()], 400);
        }
    }
}
