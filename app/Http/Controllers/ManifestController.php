<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Manifest;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ManifestController extends Controller
{
    public function get_items(Request $request)
    {
        $active_session = optional($this->fin_session);

        $branchId = optional($this->branch)->id;

        $perPage = $request->input('per_page', 20);
        $orderBy = $request->input('order_by', 'created_at');
        $order = $request->input('order', 'desc');
        $search = $request->input('search', '');
        $paginate = $request->input('paginate', 'yes');

        $query = Manifest::query();

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($active_session->active == 1) {
            $query->where('trip_date', '>=', $active_session->start_date)
                ->where('trip_date', '<=', $active_session->end_date);
        } else {
            return response()->json(['message' => 'No item found in this session !'], 404);
        }

        if (!empty($search)) {
            $escapedSearch = addslashes($search);
            $query->where(function ($q) use ($escapedSearch) {
                $q->where('manifest_no', 'LIKE', "%{$escapedSearch}%");
            });
        }

        if ($paginate == 'no') {
            $manifests = $query->with(['lorry'])->orderBy($orderBy, $order)->get();
        } else {
            $manifests = $query->with(['lorry'])->orderBy($orderBy, $order)->paginate($perPage);
        }

        return response()->json($manifests);
    }

    public function get_item(Manifest $manifest)
    {
        $branchId = optional($this->branch)->id;

        if ($branchId && $manifest->branch_id == $branchId) {
            $manifest->load([
                'bookings.statuses',
                'bookings.items.item_quantities',
                'bookings.consignor.location',
                'bookings.consignee.location',
                'branch',
                'lorry'
            ]);
            return response()->json($manifest);
        } else {
            return response()->json(['message' => 'This item does not belong to you.'], 404);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'trip_date' => 'required|date',
            'beat_no' => 'nullable|string',
            'lorry_id' => 'nullable|integer',
        ]);


        $new_no = $this->generateManifestNumber();
        $data = $request->all();
        $data['manifest_no'] = $new_no;
        $data['trip_date'] = Carbon::parse($request->trip_date)->format('Y-m-d');

        $user = Auth::user();

        if ($user->branch) {
            $data['branch_id'] = $user->branch->id;
        } else {
            return response()->json(['message' => 'Unauthorized access'], 400);
        }


        try {
            $m = Manifest::create($data);

            if ($m) {
                $user = Auth::user();
                ActivityLog::create([
                    'title' => 'Manifest added',
                    'activity' => 'Manifest (' . $m->manifest_no . ') for Trip date ' . $m->trip_date . ' has been created.',
                    'user_id' => $user->id,
                    'branch_id' => $user->branch->id,
                    'created_at' => now()
                ]);
            }

            return response()->json(['message' => 'Created successfully!', 'manifest_no' => $new_no], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Could not be stored', 'error' => $e->getMessage()], 400);
        }
    }


    private function generateManifestNumber()
    {
        $branchId = optional($this->branch)->id;

        $latestManifest = Manifest::whereDate('created_at', now()->toDateString())
            ->where('branch_id', $branchId)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($latestManifest) {
            $lastIndex = (int)substr($latestManifest->manifest_no, -3);
            $newIndex = $lastIndex + 1;
        } else {
            $newIndex = 1;
        }

        $index = str_pad($newIndex, 3, '0', STR_PAD_LEFT);
        $code = now()->format('ymd') . $index;
        return $code;
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Manifest $manifest)
    {
        DB::beginTransaction();
        $branchId = optional($this->branch)->id;

        if ($manifest->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $bookings = $manifest->bookings;

            if ($bookings->count() > 0) {
                $allPending = $bookings->every(function ($booking) {
                    return $booking->statuses()->count() == 0 || $booking->statuses()->where('active', 1)->where('status', 'pending')->exists();
                });

                if (!$allPending) {
                    return response()->json(['error' => 'Only manifests with pending bookings can be deleted.'], 403);
                }

                foreach ($bookings as $booking) {
                    $bookingController = new BookingController();
                    $bookingController->destroy($booking);
                }
            }

            $manifest->delete();

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Manifest Deleted',
                'activity' => 'Manifest (Manifest no : ' . $manifest->manifest_no . ') has been deleted!',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);

            DB::commit();
            return response()->json(['message' => 'Manifest deleted successfully'], 200);
        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Check if the manifest is deletable.
     *
     * @param Manifest $manifest
     * @return \Illuminate\Http\JsonResponse
     */
    public function is_deletable(Manifest $manifest)
    {
        $branchId = optional($this->branch)->id;

        if ($manifest->branch_id !== $branchId) {
            return response()->json([
                'is_deletable' => false,
                'message' => 'Unauthorized'
            ]);
        }

        $bookings = $manifest->bookings;

        if ($bookings->count() === 0) {
            return response()->json([
                'is_deletable' => true,
                'message' => 'Manifest is deletable'
            ]);
        }

        $allPending = $bookings->every(function ($booking) {
            return $booking->statuses()->count() == 0 || $booking->statuses()->where('active', 1)->where('status', 'pending')->exists();
        });

        return response()->json([
            'is_deletable' => $allPending,
            'message' => $allPending ? 'Manifest is deletable' : 'Manifest contains non-pending bookings and cannot be deleted'
        ]);
    }
}
