<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display dashboard statistics.
     */
    public function statistik()
    {
        $totalBuku = Buku::query()->count();

        $totalAnggota = User::query()->whereHas('role', function ($query) {
            $query->whereIn(DB::raw('LOWER(nama_role)'), ['peminjam']);
        })->count();

        $bukuDipinjam = Peminjaman::query()->where('status', 'Dipinjam')->count();

        $bukuDikembalikan = Peminjaman::query()->whereIn('status', ['Selesai', 'Dikembalikan'])->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Statistik dashboard berhasil diambil',
            'data' => [
                'total_buku' => $totalBuku,
                'total_anggota' => $totalAnggota,
                'buku_dipinjam' => $bukuDipinjam,
                'buku_dikembalikan' => $bukuDikembalikan,
            ],
        ], 200);
    }
}
