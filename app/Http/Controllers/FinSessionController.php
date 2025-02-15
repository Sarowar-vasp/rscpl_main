<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\FinSession;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinSessionController extends Controller
{


    public function get_items()
    {
        $fses = FinSession::orderBy('start_date', 'asc')->get();
        return response()->json($fses);
    }

    public function get_item(FinSession $finsession)
    {
        return response()->json($finsession);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'active' => 'nullable'
        ]);

        $new_item = new FinSession();
        $new_item->start_date = Carbon::parse($request->start_date)->format('Y-m-d');
        $new_item->end_date = Carbon::parse($request->end_date)->format('Y-m-d');

        if (FinSession::count() <= 0) {
            $new_item->active = 1;
        } else {
            if ($request->active) {
                FinSession::query()->update(['active' => 0]);
                $new_item->active = 1;
            } else {
                $new_item->active = 0;
            }
        }

        $new_item->save();
        if ($new_item) {
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Session Added',
                'activity' => 'Session (' . $new_item->start_date .' to '. $new_item->end_date . ') has been added !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
        }
        return response()->json(['message' => 'Financial session created successfully.', 'item' => $new_item], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FinSession $finsession)
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
        ]);

        if ($request->has('start_date')) {
            $finsession->start_date = Carbon::parse($request->start_date)->format('Y-m-d');
        }

        if ($request->has('end_date')) {
            $finsession->end_date = Carbon::parse($request->end_date)->format('Y-m-d');
        }

        $finsession->save();
        if ($finsession) {
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Session Updated',
                'activity' => 'Session (' . $finsession->start_date .' to '. $finsession->end_date . ') has been updated !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
        }
        return response()->json(['message' => 'Financial session updated successfully.', 'item' => $finsession], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FinSession $finsession)
    {
        if (!$finsession->active) {
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Session Removed',
                'activity' => 'Session (' . $finsession->start_date .' to '. $finsession->end_date . ') has been deleted !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            $finsession->delete();
            return response()->json(['message' => 'Financial session deleted successfully.'], 200);
        } else {
            return response()->json(['message' => 'Active financial session could not be deleteded'], 200);
        }
    }

    /**
     * Set the current financial session.
     */
    public function set_current_session(FinSession $finsession)
    {
        FinSession::query()->update(['active' => 0]);
        $finsession->active = 1;
        $finsession->save();
        $user = Auth::user();
        ActivityLog::create([
            'title' => 'Session Updated',
            'activity' => 'Session (' . $finsession->start_date .' to '. $finsession->end_date . ') is activated !',
            'user_id' => $user->id,
            'branch_id' => $user->branch->id,
            'created_at' => now()
        ]);
        return response()->json(['message' => 'Current financial session set successfully.', 'item' => $finsession], 200);
    }
}
