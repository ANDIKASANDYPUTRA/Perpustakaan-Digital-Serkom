<?php

namespace App\Http\Controllers;

use App\Models\Peminjaman;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    /**
     * Display library transaction reports.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }
        $user->loadMissing('role');
        $roleName = strtolower($user->role->nama_role ?? '');

        if ($roleName !== 'admin') {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak. Halaman Laporan hanya untuk Admin.'], 403);
        }

        $query = Peminjaman::query()->with(['buku', 'anggota']);

        if ($request->filled('tanggal_pinjam_awal')) {
            $query->whereDate('tanggal_pinjam', '>=', $request->tanggal_pinjam_awal);
        }

        if ($request->filled('tanggal_pinjam_akhir')) {
            $query->whereDate('tanggal_pinjam', '<=', $request->tanggal_pinjam_akhir);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('anggota', function ($qu) use ($search) {
                    $qu->where('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('buku', function ($qu) use ($search) {
                    $qu->where('judul_buku', 'like', "%{$search}%")
                      ->orWhere('penulis', 'like', "%{$search}%");
                })->orWhere('status', 'like', "%{$search}%");
            });
        }

        $laporan = $query->orderBy('tanggal_pinjam', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan perpustakaan berhasil diambil',
            'data' => $laporan,
        ], 200);
    }
}
