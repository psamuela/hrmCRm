<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with(['company', 'branch', 'employee'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email credentials or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact administrator.',
            ], 403);
        }

        // Generate Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log audit
        if ($user->company_id) {
            AuditLog::create([
                'company_id' => $user->company_id,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'module' => 'AUTH',
                'action' => 'login',
                'details' => "User {$user->email} logged in successfully.",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => $user,
                'company' => $user->company,
                'plan' => $user->company ? $user->company->plan : 'enterprise',
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->load(['company.branches', 'branch', 'employee.department']);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'company' => $user ? $user->company : null,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out',
        ]);
    }

    public function switchCompany(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $company = Company::with('branches')->findOrFail($request->company_id);
        $user = $request->user();
        $user->company_id = $company->id;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Switched to {$company->name}",
            'data' => [
                'company' => $company,
                'plan' => $company->plan,
            ],
        ]);
    }
}
