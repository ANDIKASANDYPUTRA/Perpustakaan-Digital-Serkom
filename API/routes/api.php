<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BukuController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PeminjamanController;
use App\Http\Controllers\PengembalianController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\RoleController;
use App\Models\Role;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // 1. Profil Pengguna Saat Ini
    Route::get('/me', [AuthController::class, 'me']);

    // 2. Manajemen Pengguna (CRUD)
    Route::apiResource('pengguna', PenggunaController::class);

    // 3. Riwayat Peminjaman Pribadi
    Route::get('/peminjaman/riwayat-saya', [PeminjamanController::class, 'riwayatSaya']);
    Route::apiResource('peminjaman', PeminjamanController::class);

    // 4. Statistik Dashboard
    Route::get('/dashboard/statistik', [DashboardController::class, 'statistik']);

    // 5. Laporan Perpustakaan
    Route::get('/laporan', [LaporanController::class, 'index']);

    // Endpoints Lainnya
    Route::apiResource('kategori', KategoriController::class);
    Route::apiResource('buku', BukuController::class);
    Route::apiResource('pengembalian', PengembalianController::class)->only(['index', 'store', 'show']);

    // Roles
    Route::get('/roles', function () {
        return response()->json([
            'status' => 'success',
            'data' => Role::all(),
        ]);
    });
});