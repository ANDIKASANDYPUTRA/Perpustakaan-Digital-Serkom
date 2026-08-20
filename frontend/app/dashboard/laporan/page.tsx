"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import type { ApiResponse, Laporan } from "@/lib/types";
import DataTable, { type Column } from "@/components/DataTable";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

export default function LaporanPage() {
  const { getRoleName } = useAuthStore();
  const role = getRoleName();
  const router = useRouter();

  const [data, setData] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tglAwal, setTglAwal] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (role && role !== "admin") {
      router.push("/dashboard");
    }
  }, [role, router]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (tglAwal) params.tanggal_pinjam_awal = tglAwal;
      if (tglAkhir) params.tanggal_pinjam_akhir = tglAkhir;
      if (search) params.search = search;

      const { data: res } = await api.get<ApiResponse<Laporan[]>>("/laporan", { params });
      setData(res.data ?? []);
    } catch (error: any) {
      console.error("Gagal mengambil laporan:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Hanya fetch ketika role sudah terkonfirmasi sebagai admin
  useEffect(() => {
    if (role === "admin") {
      fetchLaporan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, tglAwal, tglAkhir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLaporan();
  };

  const columns: Column<Laporan>[] = [
    {
      key: "peminjam",
      header: "Peminjam",
      render: (r) => r.anggota?.username ?? "-",
    },
    {
      key: "buku",
      header: "Judul Buku",
      render: (r) => r.buku?.judul_buku ?? "-",
    },
    {
      key: "tanggal_pinjam",
      header: "Tgl Pinjam",
      render: (r) => r.tanggal_pinjam ?? "-",
    },
    {
      key: "tanggal_kembali",
      header: "Tgl Kembali",
      render: (r) => r.tanggal_kembali ?? "-",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            r.status === "Dipinjam"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  const handleCetak = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in print:m-0 print:p-0 print:animate-none">
      {/* Printable Header */}
      <div className="hidden print:block mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">LAPORAN PEMINJAMAN PERPUSTAKAAN DIGITAL</h1>
        <p className="text-sm text-gray-600">Dicetak pada: {new Date().toLocaleDateString("id-ID")}</p>
        {(tglAwal || tglAkhir) && (
          <p className="text-xs text-gray-500 mt-1">
            Periode: {tglAwal || "Awal"} s.d. {tglAkhir || "Akhir"}
          </p>
        )}
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Screen Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Perpustakaan</h1>
          <p className="mt-1 text-sm text-gray-500">Rekap seluruh transaksi peminjaman buku</p>
        </div>

        <button
          onClick={handleCetak}
          disabled={loading || data.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7"></path>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Export PDF / Cetak
        </button>
      </div>

      {/* Filters (Date Range & Search) */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tgl Pinjam Awal</label>
            <input
              type="date"
              value={tglAwal}
              onChange={(e) => setTglAwal(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tgl Pinjam Akhir</label>
            <input
              type="date"
              value={tglAkhir}
              onChange={(e) => setTglAkhir(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-gray-600">Pencarian</label>
            <input
              type="text"
              placeholder="Cari username, judul buku, atau status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm print:border-none print:shadow-none print:p-0">
        {data.length === 0 && !loading ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-medium">Tidak ada data laporan</p>
          </div>
        ) : (
          <DataTable columns={columns} data={data} isLoading={loading} />
        )}
      </div>
    </div>
  );
}