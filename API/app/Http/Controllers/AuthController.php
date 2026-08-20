<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|unique:pengguna,email',
            'username' => 'required|string|unique:pengguna,username',
            'password' => 'required|string|min:8|confirmed',
            'alamat' => 'nullable|string',
            'no_hp' => 'required|digits_between:10,15',
        ]);

        $rolePeminjam = Role::query()->where('nama_role', 'peminjam')->first();

        if (!$rolePeminjam) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role peminjam belum dikonfigurasi di database.'
            ], 500);
        }

        $user = User::query()->create([
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'alamat' => $request->alamat,
            'no_hp' => $request->no_hp,
            'tanggal_bergabung' => now()->format('Y-m-d'),
            'id_role' => $rolePeminjam->id,
        ]);

        $token = $user->createToken('login_tokens')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Register berhasil',
            'data' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'nullable|string',
            'username' => 'nullable|string',
            'password' => 'required|min:8|string',
        ]);

        $loginInput = $request->email ?? $request->username;

        if (!$loginInput) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau username wajib diisi'
            ], 422);
        }

        $user = User::query()
            ->where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email/username atau password salah'
            ], 401);
        }

        $token = $user->createToken('login_tokens')->plainTextToken;

        return response()->json([
            'status' => 'success',  
            'message' => 'Login berhasil',  
            'data' => $user->load('role'),  
            'token' => $token,  
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('role');

        return response()->json([
            'status' => 'success',
            'message' => 'Data profil berhasil diambil',
            'data' => $user,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil',
        ]);
    }
}
