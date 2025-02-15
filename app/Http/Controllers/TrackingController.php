<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Tracking;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function get_items(Request $request)
    {
        $cn = $request->cn_no;

        $booking = Booking::where('cn_no', $cn)->with('manifest')->first();
        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $tracks = [];

        if ($booking->manifest) {
            $m_track = [
                'booking_id' => $booking->id,
                'status' => 'Manifest Created',
                'description' => 'Manifest (' . $booking->manifest->manifest_no . ') has been generated.',
                'created_at' => $booking->manifest->created_at,
            ];
            array_push($tracks, $m_track); // Corrected to use array_push for a single element
        }

        $b_tracks = Tracking::where('booking_id', $booking->id)
            ->get();

        foreach ($b_tracks as $b_track) {
            $tracks[] = $b_track->toArray(); // Corrected to use a loop to add each element
        }

        usort($tracks, function ($a, $b) {
            return strtotime($a['created_at']) - strtotime($b['created_at']);
        });

        return response()->json($tracks);
    }
}
