<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LorryController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\PartyController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ItemUnitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ManifestController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\UserRoleController;
use App\Http\Middleware\PrivilegeMiddleware;
use App\Http\Controllers\FinSessionController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BeatController;
use App\Http\Controllers\BookingItemController;
use App\Http\Controllers\ReturnBookingController;

Route::controller(PagesController::class)->group(function () {
    Route::get('/', 'welcome');
});

// Route::get('/test', function(){
//     return "Test";
// });

// Route::get('/linkstorage', function() {
//     Artisan::call('storage:link');
//     return 'Storage link created successfully.';
// });
// Route::get('/fix-db-connections', function () {
//     Artisan::call('queue:restart');
//     Artisan::call('cache:clear');
//     Artisan::call('config:clear');
//     Artisan::call('view:clear');
//     Artisan::call('optimize:clear');
//     return "Database connection issues fixed! ✅";
// });


// auth routes

Route::middleware('auth')->group(function () {
    // Open GET routes for all users
    Route::controller(PagesController::class)->group(function () {
        Route::get('/dashboard', 'dashboard')->name('dashboard');
        Route::get('/master/item-units', 'item_unit');
        Route::get('/master/locations', 'location_master');
        Route::get('/master/rates', 'rate_master');
        Route::get('/master/beats', 'beat_master');
        Route::get('/master/branches', 'branch_master');
        Route::get('/master/parties', 'party_master');
        Route::get('/master/items', 'item_master');
        Route::get('/master/lorries', 'lorry_master');
        Route::get('/transaction/manifest', 'manifest_list');
        Route::get('/transaction/booking', 'booking_list');
        Route::get('/transaction/challan', 'challan_list');
        Route::get('/booking/track', 'track_status');
        Route::get('/transaction/booking/report', 'booking_report');
        Route::get('/transaction/booking/party-report', 'party_booking_report');
    });

    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
        Route::get('/master/user/branch', 'get_branch');
    });
    // Group for CRUD operations with PrivilegeMiddleware
    Route::middleware(PrivilegeMiddleware::class . ':10')->group(function () {
        Route::controller(LocationController::class)->group(function () {
            Route::post('/master/data/new/location', 'store');
            Route::put('/master/data/location/{location}', 'update');
            Route::delete('/master/data/location/{location}', 'destroy');
        });
        Route::controller(LorryController::class)->group(function () {
            Route::post('/master/data/new/lorry', 'store');
            Route::put('/master/data/lorry/{lorry}', 'update');
            Route::delete('/master/data/lorry/{lorry}', 'destroy');
        });
        Route::controller(BeatController::class)->group(function () {
            Route::post('/master/data/new/beat', 'store');
            Route::put('/master/data/beat/{beat}', 'update');
            Route::delete('/master/data/beat/{beat}', 'destroy');
        });

        Route::controller(BranchController::class)->group(function () {
            Route::post('/master/data/new/branch', 'store');
            Route::put('/master/data/branch/{branch}', 'update');
            Route::delete('/master/data/branch/{branch}', 'destroy');
        });

        Route::controller(PartyController::class)->group(function () {
            Route::post('/master/data/new/party', 'store');
            Route::put('/master/data/party/{party}', 'update');
            Route::delete('/master/data/party/{party}', 'destroy');
        });

        Route::controller(ItemUnitController::class)->group(function () {
            Route::post('/master/data/new/itemunit', 'store');
            Route::put('/master/data/itemunit/{item_unit}', 'update');
            Route::delete('/master/data/itemunit/{item_unit}', 'destroy');
        });

        Route::controller(ItemController::class)->group(function () {
            Route::post('/master/data/new/item', 'store');
            Route::put('/master/data/item/{item}', 'update');
            Route::delete('/master/data/item/{item}', 'destroy');
        });

        Route::controller(BookingController::class)->group(function () {
            Route::post('/data/booking/new', 'store');
            Route::put('/data/update/booking/{booking}', 'update');
            Route::put('/data/booking/update/{booking}', 'update');
            Route::delete('/data/booking/delete/{booking}', 'destroy');

            // status
            Route::post('/transaction/booking/status/{booking}', 'update_status');
            Route::post('/transaction/booking/upload_document/{booking}', 'upload_document');

            // booking_reports
            Route::post('/data/report/booking', 'booking_reports');
            Route::post('/data/report/return/booking', 'return_booking_reports');
            Route::post('/data/report/party_booking', 'party_booking_reports');

            // print page
            Route::get('/print/booking/{booking}', 'print_booking_item');
        });
        
        Route::controller(ReturnBookingController::class)->group(function () {
            Route::post('/data/return/booking/new', 'store');
            Route::delete('/data/return/booking/delete/{returnBooking}', 'destroy');
            Route::put('/data/return/booking/update/{returnBooking}', 'update');
            Route::get('/print/return/booking/{booking}', 'print_return_item');
            Route::post('/transaction/return/booking/upload_document/{booking}', 'upload_document');

        });

        Route::controller(ManifestController::class)->group(function () {
            Route::post('/data/manifest/new', 'store');
            Route::put('/data/update/manifest/{manifest}', 'update');
            Route::delete('/data/manifest/delete/{manifest}', 'destroy');
        });

        Route::controller(UserController::class)->group(function () {
            Route::post('/data/store/user', 'store');
            Route::put('/data/update/user/{user}', 'update');
            Route::put('/data/change/password/{user}', 'change_password');
            Route::delete('/data/delete/user/{user}', 'destroy');
        });
    });

    // Open GET routes for CRUD operations
    Route::controller(LocationController::class)->group(function () {
        Route::get('/master/data/locations', 'get_locations');
        Route::get('/master/data/location/{location}', 'get_location');
    });

    Route::controller(BeatController::class)->group(function () {
        Route::get('/master/data/beats/{beat}', 'get_item');
        Route::get('/master/data/beats', 'get_items');
        Route::get('/master/data/beat/{beat_no}/locations', 'get_locations');
    });
    
    Route::controller(LorryController::class)->group(function () {
        Route::get('/master/data/lorries', 'get_lorries');
    });


    Route::controller(BranchController::class)->group(function () {
        Route::get('/master/data/branches', 'get_items');
        Route::get('/master/data/branches/all', 'get_all');
        Route::get('/master/data/branch/{branch}', 'get_item');
    });

    Route::controller(PartyController::class)->group(function () {
        Route::get('/master/data/parties', 'get_items');
        Route::get('/master/data/parties/all', 'get_allitems');
        Route::get('/master/data/beat/{beat_no}/parties', 'get_items_by_beat');
        Route::get('/master/data/party/{party}', 'get_item');
    });

    Route::controller(ItemUnitController::class)->group(function () {
        Route::get('/master/data/itemunits', 'get_itemunits');
        Route::get('/master/data/itemunit/{item_unit}', 'get_itemunit');
    });

    Route::controller(ItemController::class)->group(function () {
        Route::get('/master/data/items', 'get_items');
        Route::get('/master/data/item/{item}', 'get_item');
    });

    Route::controller(BookingController::class)->group(function () {
        Route::get('/data/bookings', 'get_items');
        Route::get('/data/booking/{booking}', 'get_item');
        Route::get('/transaction/booking/{booking}', 'booking_view');
    });

    Route::controller(ReturnBookingController::class)->group(function () {
        Route::get('/data/return/bookings', 'get_items');
        Route::get('/data/return/booking/{booking}', 'get_item');
    });

    Route::controller(ManifestController::class)->group(function () {
        Route::get('/data/manifests', 'get_items');
        Route::get('/data/manifest/{manifest}', 'get_item');
    });

    Route::controller(TrackingController::class)->group(function () {
        Route::get('/data/trackings', 'get_items');
    });

    Route::controller(UserRoleController::class)->group(function () {
        Route::get('/master/data/roles/all', 'get_all');
    });

    Route::controller(ActivityLogController::class)->group(function () {
        Route::get('/administration/activity-log', 'index');
        Route::get('/data/activities', 'get_items');
        Route::get('/data/activities/user/{user}', 'get_user_items');
    });

});

Route::controller(FinSessionController::class)->group(function () {
    Route::get('/data/sessions', 'get_items');
    Route::get('/data/session/{finsession}', 'get_item');
    Route::post('/data/session/store', 'store');
    Route::put('/data/session/update/{finsession}', 'update');
    Route::delete('/data/session/delete/{finsession}', 'destroy');
    Route::post('/data/session/{finsession}/activate', 'set_current_session');
});

Route::controller(DocumentController::class)->group(function () {
    Route::post('/data/pod/change/{document}', 'change');
    Route::delete('/data/pod/delete/{document}', 'destroy');
});

Route::controller(BookingItemController::class)->group(function () {
    Route::post('/data/invoice/check', 'duplicate_check');
    Route::post('/data/return/invoice/check', 'duplicate_return_check');
    Route::get('/data/last_item/challan', 'last_number');
    Route::get('/data/return/last_item/challan', 'last_return_number');
});

require __DIR__ . '/auth.php';
