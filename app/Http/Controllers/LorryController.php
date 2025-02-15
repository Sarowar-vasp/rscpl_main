<?php

namespace App\Http\Controllers;

use App\Models\Lorry;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LorryController extends Controller
{
    public function get_lorries(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $perPage = $request->input('per_page', 100);
        $orderBy = $request->input('order_by', 'lorry_number');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');
        
        $query = Lorry::query();
        
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('lorry_number', 'LIKE', "%{$search}%")
                    ->orWhere('driver_number', 'LIKE', "%{$search}%");
            });
        }

        $ls = $query->orderBy($orderBy, $order)->paginate($perPage);
        return response()->json($ls);
    }

    public function get_lorry(Lorry $lorry)
    {
        $branchId = optional($this->branch)->id;
        if ($lorry->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to view this lorry'], 403);
        }
        return response()->json($lorry);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'lorry_number' => 'required|string',
            'driver_number' => 'nullable|string',
        ]);

        try {
            $branchId = optional($this->branch)->id;
            $data = $request->all();
            $data['branch_id'] = $branchId;
            $lorry = Lorry::create($data);
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Lorry added',
                'activity' => 'Lorry (' . $lorry->lorry_number . ') has been added !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            $list = Lorry::get();
            return response()->json([
                'message' => 'Lorry has been created successfully.',
                'data' => $lorry,
                'lorries' => $list
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create lorry', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Lorry $lorry)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lorry $lorry)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lorry $lorry)
    {
        $request->validate([
            'lorry_number' => 'required|string',
            'driver_number' => 'nullable|string',
        ]);

        $branchId = optional($this->branch)->id;
        if ($lorry->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to update this lorry'], 403);
        }

        try {
            $lorry->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Lorry updated',
                'activity' => 'Lorry (' . $lorry->lorry_number . ') has been updated !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Lorry has been updated successfully.', 'data' => $lorry], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update lorry', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lorry $lorry)
    {
        if (!$lorry) {
            return response()->json(['message' => 'Lorry not found'], 404);
        }

        $branchId = optional($this->branch)->id;
        if ($lorry->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized to delete this lorry'], 403);
        }

        try {
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Lorry removed',
                'activity' => 'Lorry (' . $lorry->lorry_number . ') has been removed !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            $lorry->delete();
            return response()->json(['message' => 'Lorry has been deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete lorry', 'error' => $e->getMessage()], 400);
        }
    }
}
