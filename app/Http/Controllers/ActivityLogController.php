<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use Inertia\Inertia;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/ActivityLog/index');
    }

    public function get_items()
    {
        $privilege = optional($this->role)->privilege_index;
        $active_session = optional($this->fin_session);
        $branchId = optional($this->branch)->id;

        if ($privilege <= 10) {
            return abort(404);
        }

        if (!$active_session->active) {
            return response()->json(['error' => 'No active financial session found.'], 404);
        }

        $start_date = Carbon::parse($active_session->start_date)->startOfDay();
        $end_date = Carbon::parse($active_session->end_date)->endOfDay();

        $query = ActivityLog::query();

        $query->whereHas('user', function ($usr) use ($branchId) {
            $usr->where('branch_id', $branchId);
        });

        $a_log =  $query->whereBetween('created_at', [$start_date, $end_date])->with('user')->get();
        return response()->json($a_log);
    }


    public function get_user_items(User $user)
    {
        $privilege = optional($this->role)->privilege_index;
        $active_session = optional($this->fin_session);

        if ($privilege <= 10) {
            return abort(404);
        }
        if (!$active_session->active) {
            return response()->json(['error' => 'No active financial session found.'], 404);
        }

        $start_date = Carbon::parse($active_session->start_date)->startOfDay();
        $end_date = Carbon::parse($active_session->end_date)->endOfDay();

        $query = ActivityLog::query();
        $query->where('user_id', $user->id)
            ->whereBetween('created_at', [$start_date, $end_date])
            ->with('user');

        $a_log = $query->get();

        return response()->json($a_log);
    }
}
