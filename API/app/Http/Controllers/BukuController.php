<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Buku;

class BukuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $buku = Buku::with('kategori')->get();

        return response()->json([
            'status' => 'success',
            'data' => $buku,
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
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak. Peran Anda tidak diizinkan.'], 403);
        }

        $request->validate([
            'judul_buku' => 'required|string',
            'penulis' => 'required|string',
            'penerbit' => 'required|string',
            'tahun_terbit' => 'required|digits:4|integer',
            'kategori_id' => 'nullable|array',
            'kategori_id.*' => 'exists:kategori_buku,id',
        ]);

        $buku = Buku::create([
            'judul_buku' => $request->judul_buku,
            'penulis' => $request->penulis,
            'penerbit' => $request->penerbit,
            'tahun_terbit' => $request->tahun_terbit,
        ]);

        if ($request->has('kategori_id')) {
            $buku->kategori()->attach($request->kategori_id);
        }

        $buku->load('kategori');

        return response()->json([
            'status' => 'success',
            'message' => 'Buku berhasil ditambahkan',
            'data' => $buku,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $buku = Buku::with('kategori')->find($id);

        if (!$buku) {
            return response()->json([
                'status' => 'error',
                'messsage' => 'Buku tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $buku,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!$this->checkRole($request, ['admin', 'petugas', 'pengelola'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak. Peran Anda tidak diizinkan.'], 403);
        }

        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku tidak ditemukan',
            ], 404);
        }

        $request->validate([
            'judul_buku' => 'required|string',
            'penulis' => 'required|string',
            'penerbit' => 'required|string',
            'tahun_terbit' => 'required|digits:4|integer',
            'kategori_id' => 'nullable|array',
            'kategori_id.*' => 'exists:kategori_buku,id',
        ]);

        $buku->update([
            'judul_buku' => $request->judul_buku,
            'penulis' => $request->penulis,
            'penerbit' => $request->penerbit,
            'tahun_terbit' => $request->tahun_terbit,
        ]);

        if ($request->has('kategori_id')) {
            $buku->kategori()->sync($request->kategori_id);
        }

        $buku->load('kategori');

        return response()->json([
            'status' => 'success',
            'message' => 'Data buku berhasil diperbarui',
            'data' => $buku,
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        if (!$this->checkRole($request, ['admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak. Petugas dan Peminjam tidak diizinkan menghapus buku.'], 403);
        }

        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku tidak ditemukan',
            ], 404);
        }

        // Hapus pengembalian & peminjaman terkait agar tidak kena FK constraint
        $peminjamanIds = $buku->peminjaman()->pluck('id');
        \DB::table('pengembalian')->whereIn('id_peminjaman', $peminjamanIds)->delete();
        $buku->peminjaman()->delete();

        // Lepas relasi pivot kategori
        $buku->kategori()->detach();

        $buku->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Buku berhasil dihapus',
        ], 201);
    }
}
