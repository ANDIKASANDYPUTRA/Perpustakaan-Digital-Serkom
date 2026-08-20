<?php

namespace App\Http\Controllers;

use App\Models\Peminjaman;
use Illuminate\Http\Request;

class PengembalianController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pengembalian = Peminjaman::query()
            ->where('status', 'Dikembalikan')
            ->with(['buku', 'anggota'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $pengembalian,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_peminjaman' => 'required|exists:peminjaman,id',
            'tanggal_dikembalikan' => 'required|date|date_format:Y-m-d',
        ]);

        $peminjaman = Peminjaman::query()->find($request->id_peminjaman);

        if (!$peminjaman) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data peminjaman tidak ditemukan',
            ], 404);
        }

        if ($peminjaman->status === 'Dikembalikan') {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku ini sudah tercatat dikembalikan sebelumnya',
            ], 400);
        }

        $peminjaman->update([
            'tanggal_kembali' => $request->tanggal_dikembalikan,
            'status' => 'Dikembalikan',
        ]);

        $peminjaman->load(['buku', 'anggota']);

        return response()->json([
            'status' => 'success',
            'message' => 'Buku berhasil dikembalikan',
            'data' => $peminjaman,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $pengembalian = Peminjaman::query()
            ->where('status', 'Dikembalikan')
            ->with(['buku', 'anggota'])
            ->find($id);

        if (!$pengembalian) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pengembalian tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pengembalian,
        ], 200);
    }
}
