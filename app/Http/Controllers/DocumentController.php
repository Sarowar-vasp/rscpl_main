<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    
    /**
     * Change the specified resource in storage.
     */
    public function change(Request $request, Document $document) {
        $request->validate([
            'image' => 'required|mimes:jpeg,jpg,png|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents', $filename, 'public'); // Save file to 'storage/app/public/documents'

            if ($document) {
                $booking_id = $document->booking->id;
                $prev_doc = $document->file_location;
                // Storage::disk('public')->delete($prev_doc);
                $document->file_location = $path;
                $document->save();
    
                $user = Auth::user();
                ActivityLog::create([
                    'title' => 'Document Updated',
                    'activity' => 'Document '. ($prev_doc) . ' of booking id ('. $booking_id .') has been Updated !',
                    'user_id' => $user->id,
                    'branch_id'=> $user->branch_id,
                    'created_at' => now()
                ]);
                return response()->json(['message' => 'Document Updated successfully'], 200);
            } else {
                return response()->json(['message' => 'Document not found'], 404);
            }
        }
        return response()->json(['message' => 'Image not found'], 404);

    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        if ($document) {
            $booking_id = $document->booking->id;
            $prev_doc = $document->file_location;
            // Storage::disk('public')->delete($prev_doc);
            $document->delete();
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Document Removed',
                'activity' => 'Document '. ($prev_doc) . ' of booking id ('. $booking_id .') has been Removed !',
                'user_id' => $user->id,
                'branch_id'=> $user->branch_id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Document deleted successfully'], 200);
        } else {
            return response()->json(['message' => 'Document not found'], 404);
        }
    }
}
