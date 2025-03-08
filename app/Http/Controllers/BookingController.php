<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Rate;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\Document;
use App\Models\Location;
use App\Models\Tracking;
use App\Models\ActivityLog;
use App\Models\BookingItem;
use Illuminate\Http\Request;
use App\Models\BookingStatus;
use App\Models\ReturnBooking;
use Illuminate\Support\Facades\DB;

use App\Models\BookingItemQuantity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BookingController extends Controller
{
    public function get_items(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $active_session = optional($this->fin_session);
        $perPage = $request->input('per_page', 10);

        $orderBy = $request->input('order_by', 'created_at');
        $order = $request->input('order', 'desc');
        $consignor_id = $request->input('cnr', '');
        $consignee_id = $request->input('cne', '');
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = Booking::query();

        if ($active_session && $active_session->active) {
            $query->whereHas('manifest', function ($mani) use ($active_session) {
                $mani
                    ->where('trip_date', '>=', $active_session->start_date)
                    ->where('trip_date', '<=', $active_session->end_date);
            });
        }

        if (!empty($branchId)) {
            $query->whereHas('manifest.branch', function ($q) use ($branchId) {
                $q->where('id', $branchId);
            });
        }

        if (!empty($consignor_id)) {
            $query->whereHas('consignor', function ($cr) use ($consignor_id) {
                $cr->where('id', $consignor_id);
            });
        }

        if (!empty($consignee_id)) {
            $query->whereHas('consignee', function ($ce) use ($consignee_id) {
                $ce->where('id', $consignee_id);
            });
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('cn_no', 'LIKE', "%" . $search . "%")->orWhereHas("items", function ($qi) use ($search){
                    $qi->where('invoice_no', 'LIKE', "%" . $search . "%");
                });
            });
        }

        // status check
        if (!empty($status)) {
            $query->whereHas('statuses', function ($st) use ($status) {
                $st->where('active', 1);
                if ($status != '') {
                    $st->where('status', $status);
                }
            });
        }


        $bookings = $query->with([
            'manifest.branch',
            'manifest.lorry',
            'consignor.location',
            'consignee.location',
            'items.item_quantities',
            'statuses',
            'document'
        ])
            ->orderBy($orderBy, $order)
            ->paginate($perPage);

        return response()->json($bookings);
    }

    public function booking_reports(Request $request)
    {
        $from_date = Carbon::parse($request->from_date)->startOfDay();
        $to_date = Carbon::parse($request->to_date)->endOfDay();

        $query = Booking::query();
        $branchId = optional($this->branch)->id;

        $query = $query->whereHas('manifest', function ($m) use ($branchId, $from_date, $to_date) {
            $m->where('branch_id', $branchId);

            if ($from_date->format('Y-m-d') == $to_date->format('Y-m-d')) {
                $m->whereDate('trip_date', $from_date->format('Y-m-d'));
            } else {
                $m->whereBetween('trip_date', [$from_date, $to_date]);
            }
        })
        ->with(['document', 'statuses', 'manifest.branch', 'manifest.lorry', 'consignor.location', 'consignee.location', 'items.item_quantities'])
        ->get();

        // foreach ($query as $booking) {
        //     if ($booking->manifest) {
        //         $toLoc = 'test';

        //         if($toLoc && !empty($toLoc->beat_no)) {
        //             $rateInfo = Rate::where('beat_no', $booking->manifest->beat_no)->where('branch_id',$branchId)->first();
        //             $booking->manifest->rate = $rateInfo ? $rateInfo->rate : 0;
        //         } else {
        //             $booking->manifest->rate = 0;
        //         }
        //     }
        // }
        
        return response()->json($query);
    }

    public function return_booking_reports(Request $request)
    {
        $from_date = Carbon::parse($request->from_date)->startOfDay();
        $to_date = Carbon::parse($request->to_date)->endOfDay();

        $query = ReturnBooking::query();

        $branchId = optional($this->branch)->id;

        $query = $query->whereHas('manifest', function ($m) use ($branchId, $from_date, $to_date) {
            $m->where('branch_id', $branchId);
            if ($from_date->format('Y-m-d') == $to_date->format('Y-m-d')) {
                $m->whereDate('trip_date', $from_date->format('Y-m-d'));
            } else {
                $m->whereBetween('trip_date', [$from_date, $to_date]);
            }
        })
            ->with(['manifest.branch', 'manifest.lorry', 'consignor.location', 'consignee.location', 'items.item_quantities'])
            ->get();

        return response()->json($query);
    }

    public function party_booking_reports(Request $request)
    {
        $party_id = $request->party_id;
        $from_date = Carbon::parse($request->from_date)->startOfDay();
        $to_date = Carbon::parse($request->to_date)->endOfDay();

        $query = Booking::query();

        $branchId = optional($this->branch)->id;

        $query = $query->whereHas('consignee', function ($con) use ($party_id) {
            $con->where('id', $party_id);
        });

        $query = $query->whereHas('manifest', function ($m) use ($branchId, $from_date, $to_date) {
            $m->where('branch_id', $branchId);
            if ($from_date->format('Y-m-d') == $to_date->format('Y-m-d')) {
                $m->whereDate('trip_date', $from_date->format('Y-m-d'));
            } else {
                $m->whereBetween('trip_date', [$from_date, $to_date]);
            }
        })
            ->with(['document', 'statuses', 'manifest.branch', 'manifest.lorry', 'consignor.location', 'consignee.location', 'items.item_quantities'])
            ->get();

        return response()->json($query);
    }

    public function get_item(Booking $booking)
    {
        $branchId = optional($this->branch)->id;
        $booking->load(['document', 'statuses', 'manifest.branch', 'manifest.lorry', 'consignor.location', 'consignee.location', 'items.item_quantities']);
        if ($booking->manifest->branch->id !== $branchId) {
            return response()->json(['error' => 'Booking not found for the specified branch.'], 404);
        }
        return response()->json($booking);
    }

    public function booking_view(Booking $booking)
    {
        $branchId = optional($this->branch)->id;

        if (is_null($branchId)) {
            abort(404, 'Branch ID is not set.');
        }

        $booking->load([
            'manifest.branch',
            'manifest.lorry',
            'consignor.location',
            'consignee.location',
            'items.item_quantities',
            'statuses'
        ]);
        if ($booking->manifest->branch->id == $branchId) {
            return Inertia::render('Dashboard/Transaction/Booking/BookingItem', [
                'booking' => $booking
            ]);
        }

        abort(404, 'Booking does not belong to the specified branch.');
    }


    public function print_booking_item(Booking $booking)
    {
        $booking->load([
            'manifest.branch',
            'manifest.lorry',
            'consignor.location',
            'consignee.location',
            'items.item_quantities',
            'statuses'
        ]);
        return Inertia::render('Dashboard/Transaction/Booking/PrintItem', ['booking' => $booking, 'is_return' => false]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'bookingData' => 'required|array',
            'bookingData.manifest_id' => 'required|integer',
            'bookingData.cn_no' => 'required|string',
            'bookingData.cewb' => 'nullable|string',
            'bookingData.cewb_expires' => 'nullable',
            'bookingData.consignor' => 'required|integer',
            'bookingData.consignee' => 'required|integer',
            'bookingData.amount' => 'required|numeric',
            'bookingData.remarks' => 'nullable|string',
            'bookingItemsData' => 'required|array',
            'bookingItemsData.*.invoice_no' => 'required|string',
            'bookingItemsData.*.invoice_date' => 'required|date',
            'bookingItemsData.*.amount' => 'required|numeric',
            'bookingItemsData.*.weight' => 'nullable|numeric',
            'bookingItemsData.*.remarks' => 'nullable|string',
            'bookingItemsData.*.itemsInfo' => 'required|array',
            'bookingItemsData.*.itemsInfo.*.item_name' => 'required|string',
            'bookingItemsData.*.itemsInfo.*.quantity' => 'required|integer',
        ]);
        // 
        try {
            DB::beginTransaction();
            $cewb_exp = null;
            if ($request->bookingData['cewb_expires']) {
                $cewb_exp = Carbon::parse($request->bookingData['cewb_expires'])->format('Y-m-d');
            }

            $booking = Booking::create([
                'manifest_id' => $request->bookingData['manifest_id'],
                'cn_no' => $request->bookingData['cn_no'],
                'cewb' => $request->bookingData['cewb'],
                'cewb_expires' => $cewb_exp,
                'consignor' => $request->bookingData['consignor'],
                'consignee' => $request->bookingData['consignee'],
                'amount' => $request->bookingData['amount'],
                'remarks' => $request->bookingData['remarks'],
                'ship_to_party' => $request->bookingData['ship_to_party'] ? 1 : 0,
                'party_location' => $request->bookingData['ship_to_party'] ? $request->bookingData['party_location'] : '',
            ]);


            if ($booking) {
                $stat = BookingStatus::create([
                    'booking_id' => $booking->id,
                    'status' => 'pending',
                    'active' => 1,
                    'created_at' => Carbon::now(),
                ]);
                if ($stat) {
                    BookingStatus::where('booking_id', $booking->id)
                        ->where('id', '!=', $stat->id)
                        ->update(['active' => 0]);
                }

                foreach ($request->bookingItemsData as $itemData) {
                    $inv_date =  Carbon::parse($itemData['invoice_date'])->format('Y-m-d');
                    $bookingItem = BookingItem::create([
                        'booking_id' => $booking->id,
                        'invoice_no' => $itemData['invoice_no'],
                        'invoice_date' => $inv_date,
                        'amount' => $itemData['amount'],
                        'weight' => $itemData['weight'],
                        'remarks' => $itemData['remarks']
                    ]);

                    if ($bookingItem) {
                        foreach ($itemData['itemsInfo'] as $itemInfo) {
                            BookingItemQuantity::create([
                                'booking_item_id' => $bookingItem->id,
                                'item_name' => $itemInfo['item_name'],
                                'quantity' => $itemInfo['quantity'],
                            ]);
                        }
                    }
                }

                Tracking::create([
                    'booking_id' => $booking->id,
                    'status' => 'Booking generated',
                    'description' => 'Consignment (' . $booking->cn_no . ') has been generated.',
                    'created_at' => Carbon::now()
                ]);

                $user = Auth::user();
                ActivityLog::create([
                    'title' => 'Booking Created',
                    'activity' => 'Consignment (CN no : ' . $booking->cn_no . ') has been created !',
                    'user_id' => $user->id,
                    'branch_id' => $user->branch->id,
                    'created_at' => now()
                ]);
            }


            DB::commit();

            return response()->json(['message' => 'Booking created successfully'], 201);
        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error' => $th], 500);
        }
    }


    public function update(Request $request, Booking $booking)
    {
        $request->validate([
            'bookingItemsData' => 'required|array',
            'bookingItemsData.*.invoice_no' => 'required|string',
            'bookingItemsData.*.invoice_date' => 'required|date',
            'bookingItemsData.*.amount' => 'required|numeric',
            'bookingItemsData.*.weight' => 'nullable|numeric',
            'bookingItemsData.*.remarks' => 'nullable|string',
            'bookingItemsData.*.item_quantities' => 'required|array',
            'bookingItemsData.*.item_quantities.*.item_name' => 'required|string',
            'bookingItemsData.*.item_quantities.*.quantity' => 'required|integer',
        ]);

        try {
            DB::beginTransaction();

            // Update only the total amount
            $totalAmount = collect($request->bookingItemsData)->sum('amount');
            $booking->update([
                'amount' => $totalAmount,
            ]);

            // Delete existing booking items and quantities
            $booking->items()->each(function ($item) {
                $item->item_quantities()->delete();
                $item->delete();
            });

            // Create new booking items and quantities
            foreach ($request->bookingItemsData as $itemData) {
                $bookingItem = $booking->items()->create([
                    'invoice_no' => $itemData['invoice_no'],
                    'invoice_date' => Carbon::parse($itemData['invoice_date'])->format('Y-m-d'),
                    'amount' => $itemData['amount'],
                    'weight' => $itemData['weight'],
                    'remarks' => $itemData['remarks'],
                ]);

                foreach ($itemData['item_quantities'] as $itemQuantity) {
                    $bookingItem->item_quantities()->create([
                        'item_name' => $itemQuantity['item_name'],
                        'quantity' => $itemQuantity['quantity'],
                    ]);
                }
            }

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Booking Items Updated',
                'activity' => 'Items for Consignment (CN no : ' . $booking->cn_no . ') have been updated!',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);

            DB::commit();

            return response()->json(['message' => 'Booking items updated successfully'], 200);
        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }

    public function update_status(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => 'required'
        ]);

        $stat = BookingStatus::create([
            'booking_id' => $booking->id,
            'status' => $request->status,
            'active' => 1,
            'created_at' => Carbon::now(),
        ]);

        $user = Auth::user();

        if ($stat) {
            ActivityLog::create([
                'title' => 'Booking Status Changed',
                'activity' => 'Status of consignment (CN no : ' . $booking->cn_no . ') has been changed !',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);

            BookingStatus::where('booking_id', $booking->id)
                ->where('id', '!=', $stat->id)
                ->update(['active' => 0]);

            Tracking::create([
                'status' => 'Status updated',
                'description' => 'Consignment is (' . $stat->status . ') at ' . $stat->created_at . '.',
                'booking_id' => $booking->id,
                'created_at' => Carbon::now()
            ]);
        }
        return response()->json(['message' => 'Booking updated successfully.'], 200);
    }

    public function upload_document(Request $request, Booking $booking)
    {
        $request->validate([
            'image' => 'required|mimes:jpeg,jpg,png|max:2048',
        ]);

        $deliv_date = Carbon::parse($request->input('delivery_date'))->toDateString();


        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents', $filename, 'public'); // Save file to 'storage/app/public/documents'

            $existingDoc = Document::where('booking_id', $booking->id)->first();

            if ($existingDoc) {
                Storage::disk('public')->delete($existingDoc->file_location);
                $existingDoc->file_location = $path;
                $existingDoc->delivery_date = $deliv_date;
                $existingDoc->save();
            } else {
                $doc = new Document;
                $doc->booking_id = $booking->id;
                $doc->file_location = $path;
                $doc->delivery_date = $deliv_date;
                $doc->save();
            }
        }
        $user = Auth::user();
        ActivityLog::create([
            'title' => 'POD Added',
            'activity' => 'Document to the Consignment (CN no : ' . $booking->cn_no . ') has been Added !',
            'user_id' => $user->id,
            'branch_id' => $user->branch->id,
            'created_at' => now()
        ]);
        return response()->json(['message' => 'Document uploaded and status updated successfully'], 200);
    }

    public function destroy_document($id)
    {
        $document = Document::find($id);

        if ($document) {
            Storage::disk('public')->delete($document->file_location);
            $document->delete();
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Document Removed',
                'activity' => 'Document was removed from path : ' . $document->file_location,
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Document deleted successfully'], 200);
        } else {
            return response()->json(['message' => 'Document not found'], 404);
        }
    }

    public function destroy(Booking $booking)
    {
        try {
            DB::beginTransaction();

            $isPending = $booking->statuses()->count() == 0 || $booking->statuses()->where('active', 1)->where('status', 'pending')->exists();

            if (!$isPending) {
                return response()->json(['error' => 'Only pending bookings can be deleted.'], 403);
            }

            // Delete related items and their quantities
            foreach ($booking->items as $item) {
                $item->item_quantities()->delete();
            }
            $booking->items()->delete();

            // Delete related statuses
            $booking->statuses()->delete();

            // Delete related documents and their associated images
            $document = $booking->document;
            if ($document) {
                if ($document->file_location) {
                    Storage::disk('public')->delete($document->file_location);
                }
                $document->delete();
            }

            $booking->delete();

            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Booking Deleted',
                'activity' => 'Consignment (CN no : ' . $booking->cn_no . ') has been deleted!',
                'user_id' => $user->id,
                'branch_id' => $user->branch->id,
                'created_at' => now()
            ]);

            DB::commit();

            return response()->json(['message' => 'Booking deleted successfully'], 200);
        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }
}
