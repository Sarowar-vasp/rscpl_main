<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ItemController extends Controller
{
    public function get_items(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'name');
        $order = $request->input('order', 'asc');
        $search = $request->input('search');

        $query = Item::query();
        
        
        $branchId = optional($this->branch)->id;
        if($branchId){
            $query->where('branch_id', $branchId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        $item = $query->with('unit')->orderBy($orderBy, $order)->paginate($perPage);
        return response()->json($item);
    }

   
    public function get_item(Item $item)
    {
        $branchId = optional($this->branch)->id;
        if ($item->branch_id != $branchId) {
            return response()->json(['message' => 'Unauthorized to access this item.'], 403);
        }
        return response()->json($item);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);
        $branchId = optional($this->branch)->id;
        
        try {
            $itemData = $request->all();
            $itemData['branch_id'] = $branchId;
            
            $iu = Item::create($itemData);
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Item Added',
                'activity' => 'Item (' . $iu->name . ') has been added !',
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
    public function update(Request $request, Item $item)
    {
        $branchId = optional($this->branch)->id;
        if ($item->branch_id != $branchId) {
            return response()->json(['message' => 'Unauthorized to update this item.'], 403);
        }

        $request->validate([
            'name' => 'nullable|string',
        ]);

        try {
            $item->update($request->all());
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Item updated',
                'activity' => 'Item (' . $item->name . ') has been updated !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Item has been updated successfully.', 'data' => $item], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update Item', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        $branchId = optional($this->branch)->id;
        if ($item->branch_id != $branchId) {
            return response()->json(['message' => 'Unauthorized to delete this item.'], 403);
        }

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        try {
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Item Removed',
                'activity' => 'Item (' . $item->name . ') has been deleted !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            $item->delete();
            return response()->json(['message' => 'Item has been deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete Item', 'error' => $e->getMessage()], 400);
        }
    }
}
