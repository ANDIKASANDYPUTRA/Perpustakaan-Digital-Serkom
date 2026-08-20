<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Peminjaman;

class PeminjamanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $peminjaman = Peminjaman::query()->with(['buku', 'anggota'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $peminjaman,
        ], 200);
    }

    public function riwayatSaya(Request $request)
    {
        $riwayat = Peminjaman::query()
            ->where('id_anggota', $request->user()->id)
            ->with(['buku', 'anggota'])
            ->latest('id')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Riwayat peminjaman berhasil diambil',
            'data' => $riwayat,
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
        $request->validate([
            'id_anggota' => 'required|exists:pengguna,id',
            'id_buku' => 'required|exists:buku,id',
            'tanggal_pinjam' => 'required|date|date_format:Y-m-d',
            'tanggal_kembali' => 'required|date|date_format:Y-m-d',
        ]);

        $isSudahPinjam = Peminjaman::query()
            ->where('id_anggota', $request->id_anggota)
            ->where('id_buku', $request->id_buku)
            ->where('status', 'Dipinjam')
            ->exists();

        if ($isSudahPinjam) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda masih meminjam buku ini',
            ], 400);
        }

        $peminjaman = Peminjaman::query()->create([
            'id_anggota' => $request->id_anggota,
            'id_buku' => $request->id_buku,
            'tanggal_pinjam' => $request->tanggal_pinjam,
            'tanggal_kembali' => $request->tanggal_kembali,
            'status' => 'Dipinjam',
        ]);

        $peminjaman->load(['buku', 'anggota']);

        return response()->json([
            'status' => 'success',
            'message' => 'Peminjaman berhasil dicatat',
            'data' => $peminjaman,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $peminjaman = Peminjaman::query()->with(['buku', 'anggota'])->find($id);

        if (!$peminjaman) {
            return response()->json([
                'status' => 'error',
                'message' => 'Peminjaman tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $peminjaman,
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

        $peminjaman = Peminjaman::query()->find($id);

        if (!$peminjaman) {
            return response()->json([
                'status' => 'error',
                'message' => 'Peminjaman tidak ditemukan',
            ], 404);
        }

        $request->validate([
            'tanggal_kembali' => 'required|date|date_format:Y-m-d',
            'status' => 'required|in:Dipinjam,Selesai,Dikembalikan',
        ]);

        $peminjaman->update([
            'tanggal_kembali' => $request->tanggal_kembali,
            'status' => $request->status,
        ]);

        $peminjaman->load(['buku', 'anggota']);

        return response()->json([
            'status' => 'success',
            'message' => 'Peminjaman berhasil diperbarui',
            'data' => $peminjaman,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        if (!$this->checkRole($request, ['admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak. Petugas tidak diizinkan menghapus peminjaman.'], 403);
        }

        $peminjaman = Peminjaman::query()->find($id);

        if (!$peminjaman) {
            return response()->json([
                'status' => 'error',
                'message' => 'Peminjaman tidak ditemukan',
            ], 404);
        }

        // Hapus pengembalian terkait agar tidak kena FK constraint
        \DB::table('pengembalian')->where('id_peminjaman', $id)->delete();

        $peminjaman->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Peminjaman berhasil dihapus',
        ], 200);
    }
}
