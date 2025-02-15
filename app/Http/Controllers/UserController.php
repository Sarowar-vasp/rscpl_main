<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\UserRole;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index()
    {
        return Inertia::render('Dashboard/UserManagement/index');
    }


    /**
     * Get multiple users with branch validation.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function get_users()
    {
        $privilege = optional($this->role)->privilege_index;
        $branchId = optional($this->branch)->id;

        $query = User::with('role');

        if ($privilege < 999) {
            if (!$branchId) {
                return response()->json(['message' => 'Branch ID not available'], 404);
            }
            $query->whereHas('branch', function ($q) use ($branchId) {
                $q->where('id', $branchId);
            });
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            return response()->json(['message' => 'No users found'], 404);
        }

        return response()->json($users);
    }



    /**
     * Get user details with branch validation.
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function get_user(User $user)
    {

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $privilege = optional($this->role)->privilege_index;

        if ($privilege < 999) {
            $branchId = optional($this->branch)->id;
            if (!$user->branch) {
                return response()->json(['message' => 'User does not belong to any branch'], 404);
            }
            if ($user->branch->id !== $branchId) {
                return response()->json(['message' => 'User belongs to another branch'], 404);
            }
        }

        return response()->json($user->load('role'));
    }

    /**
     * Store a new user with branch and role validation.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:user_roles,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $privilege = optional($this->role)->privilege_index;
        $branchId = $privilege > 999 ? $request->input('branch_id') : optional($this->branch)->id;

        if (!$branchId) {
            return response()->json(['message' => 'Branch ID not available'], 404);
        }

        $role = UserRole::find($validatedData['role_id']);

        if (!$role || $role->privilege_index >= $privilege) {
            return response()->json(['message' => 'Invalid role or insufficient privilege'], 403);
        } else {
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'email_verified_at' => now(),
                'password' => Hash::make($validatedData['password']),
                'user_role_id' => $role->id,
                'branch_id' => $branchId
            ]);

            $logger = Auth::user();

            ActivityLog::create([
                'title' => 'User Stored',
                'activity' => 'User (' . $user->name . ') has been added.',
                'user_id' => $logger->id,
                'created_at' => now()
            ]);
            
            return response()->json($user, 201);
        }
    }

    /**
     * Update the specified user with branch and role validation.
     *
     * @param \Illuminate\Http\Request $request
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'user_role_id' => 'sometimes|required|exists:user_roles,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $privilege = optional($this->role)->privilege_index;


        $branchId = $privilege > 999 ? $request->input('branch_id') : optional($this->branch)->id;

        if ($privilege <= 999 && !$branchId) {
            return response()->json(['message' => 'Branch ID not available'], 404);
        }

        if (isset($validatedData['user_role_id'])) {
            $role = UserRole::find($validatedData['user_role_id']);
            if (!$role || $role->privilege_index >= $privilege) {
                return response()->json(['message' => 'Invalid role or insufficient privilege'], 403);
            }
            $user->user_role_id = $validatedData['user_role_id'];
        }

        $user->fill($validatedData);
        $user->branch_id = $branchId;
        $user->save();
        $logger = Auth::user();
        ActivityLog::create([
            'title' => 'User updated',
            'activity' => 'User (' . $user->name . ') has been updated.',
            'user_id' => $logger->id,
            'created_at' => now()
        ]);
        return response()->json($user->load('role'), 200);
    }

    /**
     * Change the password for the specified user.
     *
     * @param \Illuminate\Http\Request $request
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function change_password(Request $request, User $user)
    {
        $privilege = optional($this->role)->privilege_index;

        if ($privilege <= optional($user->role)->privilege_index) {
            return response()->json(['message' => 'Cannot change the password of a user with equal or higher privilege'], 403);
        }

        $validatedData = $request->validate([
            'old_password' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        if (!Hash::check($validatedData['old_password'], $user->password)) {
            return response()->json(['message' => 'Old password is incorrect'], 422);
        }

        $user->password = Hash::make($validatedData['password']);
        $user->save();
        $logger = Auth::user();
        ActivityLog::create([
            'title' => 'Password Changed',
            'activity' => 'Password for (' . $user->name . ') has been changed.',
            'user_id' => $logger->id,
            'created_at' => now()
        ]);
        return response()->json(['message' => 'Password updated successfully'], 200);
    }

    /**
     * Delete the specified user.
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(User $user)
    {
        $privilege = optional($this->role)->privilege_index;

        if ($privilege <= optional($user->role)->privilege_index) {
            return response()->json(['message' => 'Cannot delete a user with equal or higher privilege'], 403);
        }
        $logger = Auth::user();
        ActivityLog::create([
            'title' => 'User removed',
            'activity' => 'User (' . $user->name . ') has been removed.',
            'user_id' => $logger->id,
            'created_at' => now()
        ]);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
