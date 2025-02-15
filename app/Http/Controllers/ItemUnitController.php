<?php

namespace App\Http\Controllers;

use App\Models\ItemUnit;
use Illuminate\Http\Request;

class ItemUnitController extends Controller
{
    
    public function get_itemunits(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'name');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');
        $query = ItemUnit::query();
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        $itemunits = $query->orderBy($orderBy, $order)->paginate($perPage);
        return response()->json($itemunits);
    }

    
    public function get_itemunit(ItemUnit $item_unit)
    {
        return response()->json($item_unit);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        try {
            $iu = ItemUnit::create($request->all());
            return response()->json(['message' => 'Unit has been created successfully.', 'data' => $iu], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create Unit', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ItemUnit $item_unit)
    {
        $request->validate([
            'name' => 'nullable|string',
        ]);

        try {
            $item_unit->update($request->all());
            return response()->json(['message' => 'Unit has been updated successfully.', 'data' => $item_unit], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update Unit', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemUnit $item_unit)
    {
        if (!$item_unit) {
            return response()->json(['message' => 'Unit not found'], 404);
        }

        try {
            $item_unit->delete();
            return response()->json(['message' => 'Unit has been deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete Unit', 'error' => $e->getMessage()], 400);
        }
    }
}
