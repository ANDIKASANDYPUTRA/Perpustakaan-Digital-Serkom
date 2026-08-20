<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\KategoriBuku;

class KategoriController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kategori = KategoriBuku::all();

        return response()->json([
            'status' => 'success',
            'data' => $kategori,
        ], 200);
    }

    private function checkRole($request, array $allowedRoles)
    {
        $user = $request->user();
        if (!$user) return false;
        $user->loadMissing('role');
        $roleName = strtolower($user->role->nama_role ?? '');
        return in_array($roleName, $allowedRoles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!$this->checkRole($request, ['admin', 'petugas', 'pengelola'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'nama_kategori' => 'required|string|max:100',
        ]);

        $kategori = KategoriBuku::create([
            'nama_kategori' => $request->nama_kategori,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'kategori berhasil di tambahkan',
            'data' => $kategori,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $kategori = KategoriBuku::find($id);

        if (!$kategori) {
            return response()->json([
                'status' => 'error',
                'data' => 'kategori tidak ditemukan',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $kategori,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!$this->checkRole($request, ['admin', 'petugas', 'pengelola'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $kategori = KategoriBuku::find($id);

        if (!$kategori) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tidak di temukan',
            ]);
        }

        $request->validate([
            'nama_kategori' => 'required|string|max:100',
        ]);

        $kategori->update([
            'nama_kategori' => $request->nama_kategori,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori berhasil diperbarui',
            'data' => $kategori,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        if (!$this->checkRole($request, ['admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak. Petugas tidak diizinkan menghapus kategori.'], 403);
        }

        $kategori = KategoriBuku::find($id);

        if (!$kategori) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tidak ditemukan',
            ]);
        }

        // Lepas relasi pivot buku_kategori agar tidak kena FK constraint
        \DB::table('buku_kategori')->where('id_kategori', $kategori->id)->delete();

        $kategori->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
