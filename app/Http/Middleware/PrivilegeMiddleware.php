<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PrivilegeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $requiredPrivilege): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $privilege = $user->role->privilege_index;
        if ($privilege < $requiredPrivilege) {
            return redirect()->route('dashboard')->with('error', 'You do not have sufficient privileges to access this page.');
        }

        return $next($request);
    }
}
