<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    //
    /**
     * Display a listing of admin users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Fetch only users with role 'admin'
        $admins = User::where('role', 'admin')->get();

        return response()->json($admins);
    }

    /**
     * Store a newly created admin user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Create a new admin user
        $admin = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password')),
            'role' => $request->input('role'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin user created successfully.',
            'data' => $admin,
        ], 201);
    }

    /**
     * Display the specified admin user.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Find the admin user by ID and ensure they have an admin role
        $admin = User::where('id', $id)
                     ->where('role', 'admin')
                     ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin user not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $admin,
        ]);
    }

    /**
     * Update the specified admin user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Find the admin user by ID and ensure they have an admin role
        $admin = User::where('id', $id)
                     ->where('role', 'admin')
                     ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin user not found.',
            ], 404);
        }

        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update the admin user
        $admin->update([
            'name' => $request->input('name', $admin->name),
            'email' => $request->input('email', $admin->email),
            'password' => $request->filled('password') ? bcrypt($request->input('password')) : $admin->password,
            'role' => $request->input('role', $admin->role),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin user updated successfully.',
            'data' => $admin,
        ]);
    }

    /**
     * Remove the specified admin user from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        // Find the admin user by ID and ensure they have an admin role
        $admin = User::where('id', $id)
                     ->where('role', 'admin')
                     ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin user not found.',
            ], 404);
        }

        // Delete the admin user
        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin user deleted successfully.',
        ]);
    }
}
