<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PenggunaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pengguna = User::query()->with('role')->latest()->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Daftar pengguna berhasil diambil',
            'data' => $pengguna,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:pengguna,username',
            'email' => 'required|string|email|max:255|unique:pengguna,email',
            'password' => 'required|string|min:8',
            'alamat' => 'required|string',
            'no_hp' => 'required|string|max:15',
            'tanggal_bergabung' => 'nullable|date',
            'id_role' => 'required|exists:role,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        if (empty($validated['tanggal_bergabung'])) {
            $validated['tanggal_bergabung'] = now()->format('Y-m-d');
        }

        $pengguna = User::query()->create($validated);
        $pengguna->load('role');

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil ditambahkan',
            'data' => $pengguna,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $pengguna = User::query()->with('role')->find($id);

        if (!$pengguna) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Detail pengguna berhasil diambil',
            'data' => $pengguna,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pengguna = User::query()->find($id);

        if (!$pengguna) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'username' => 'sometimes|required|string|max:255|unique:pengguna,username,' . $id,
            'email' => 'sometimes|required|string|email|max:255|unique:pengguna,email,' . $id,
            'password' => 'nullable|string|min:8',
            'alamat' => 'sometimes|required|string',
            'no_hp' => 'sometimes|required|string|max:15',
            'tanggal_bergabung' => 'nullable|date',
            'id_role' => 'sometimes|required|exists:role,id',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $pengguna->update($validated);
        $pengguna->load('role');

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil diperbarui',
            'data' => $pengguna,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        // Hanya admin yang boleh menghapus pengguna
        $actor = $request->user();
        if ($actor) {
            $actor->loadMissing('role');
            $roleName = strtolower($actor->role->nama_role ?? '');
            if ($roleName !== 'admin') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Akses ditolak. Hanya Admin yang dapat menghapus pengguna.',
                ], 403);
            }
        }

        $pengguna = User::query()->find($id);

        if (!$pengguna) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        // Hapus data pengembalian & peminjaman milik pengguna ini terlebih dahulu agar tidak terkena foreign key constraint
        $peminjamanIds = $pengguna->peminjaman()->pluck('id');
        \DB::table('pengembalian')->whereIn('id_peminjaman', $peminjamanIds)->delete();
        $pengguna->peminjaman()->delete();

        $pengguna->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengguna berhasil dihapus',
        ], 200);
    }
}
