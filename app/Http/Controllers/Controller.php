<?php

namespace App\Http\Controllers;

use App\Models\FinSession;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;

abstract class Controller
{
    protected $branch;
    protected $role;
    protected $fin_session;

    public function __construct()
    {
        $user = Auth::user();
        if ($user) {
            $this->branch = $user->branch;
            $this->role = $user->role;
        } else {
            $this->branch = null;
            $this->role = null;
        }

        $fin_session = FinSession::where('active', 1)->first();
        if ($fin_session) {
            $this->fin_session = $fin_session;
        }

        View::share('fin_session', $this->fin_session);
        View::share('branch', $this->branch);
        View::share('role', $this->role);
    }
}
