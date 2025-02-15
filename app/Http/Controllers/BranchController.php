<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BranchController extends Controller
{
    /**
     * Response a list of the resource.
     */
    public function get_all()
    {
        $branches = Branch::with(['location'])->get();
        return response()->json($branches);
    }

    public function get_items(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'name');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');
        $query = Branch::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $item = $query->orderBy($orderBy, $order)->paginate($perPage);
        return response()->json($item);
    }


    public function get_item(Branch $branch)
    {
        return response()->json($branch);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'location_id' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        try {
            $branch = Branch::create($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Branch added',
                'activity' => 'New Branch ('. $branch->name .') has been Added !',
                'user_id' => $user->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Branch has been created successfully.', 'data' => $branch], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create branch', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Branch $branch)
    {
        $request->validate([
            'name' => 'required|string',
            'location_id' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        try {
            $branch->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Branch Updated',
                'activity' => 'Branch ('. $branch->name .') has been Updated !',
                'user_id' => $user->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Branch has been updated successfully.', 'data' => $branch], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update Branch', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch)
    {
        if (!$branch) {
            return response()->json(['message' => 'Branch not found'], 404);
        }

        try {
            $branch_name = $branch->name;
            $branch->delete();
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Branch Removed',
                'activity' => 'Branch ('. $branch_name .') has been Removed !',
                'user_id' => $user->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Branch has been deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete Branch', 'error' => $e->getMessage()], 400);
        }
    }
}
