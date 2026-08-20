"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import type { ApiResponse, Peminjaman } from "@/lib/types";
import DataTable, { type Column } from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import { FiCheckCircle } from "react-icons/fi";

export default function RiwayatPage() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<Peminjaman | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<ApiResponse<Peminjaman[]>>("/peminjaman/riwayat-saya");
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openKembalikanModal = (item: Peminjaman) => {
    setSelectedPeminjaman(item);
    setSuccess(false);
    setModalOpen(true);
  };

  const handleKembalikan = async () => {
    if (!selectedPeminjaman) return;
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      await api.post("/pengembalian", {
        id_peminjaman: selectedPeminjaman.id,
        tanggal_dikembalikan: today,
        kondisi_buku: "Baik" // asumsi pengembalian self-service kondisi baik, jika rusak lapor ke admin
      });
      
      setSuccess(true);
      fetchData(); // Reload data to update status
    } catch (err) {
      alert("Gagal memproses pengembalian. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Peminjaman>[] = [
    { key: "buku", header: "Judul Buku", render: (r) => r.buku?.judul_buku ?? "-" },
    { key: "tanggal_pinjam", header: "Tgl Pinjam" },
    { key: "tanggal_kembali", header: "Tgl Kembali" },
    { key: "status", header: "Status", render: (r) => (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.status === "Dipinjam" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
        {r.status}
      </span>
    )},
    { key: "aksi", header: "Aksi", render: (r) => (
      r.status === "Dipinjam" ? (
        <button
          onClick={() => openKembalikanModal(r)}
          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Kembalikan
        </button>
      ) : (
        <span className="text-xs text-gray-400">-</span>
      )
    )}
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Peminjaman</h1>
        <p className="mt-1 text-sm text-gray-500">Riwayat peminjaman buku Anda</p>
      </div>
      
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={data} isLoading={loading} />
      </div>

      {/* Modal Konfirmasi Pengembalian */}
      <FormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={success ? "Pengembalian Berhasil" : "Konfirmasi Pengembalian"}
      >
        {success ? (
          <div className="flex flex-col items-center py-4 text-center">
            <FiCheckCircle className="mb-4 text-5xl text-emerald-500" />
            <h3 className="mb-1 text-lg font-bold text-gray-800">Terima Kasih!</h3>
            <p className="mb-6 text-sm text-gray-500">
              Buku "{selectedPeminjaman?.buku?.judul_buku}" telah berhasil dikembalikan.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-primary shadow-md transition-all hover:bg-accent-hover hover:shadow-lg"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="flex flex-col text-center sm:text-left">
            <p className="mb-6 text-gray-700">
              Apakah anda yakin ingin mengembalikan buku <span className="font-bold">"{selectedPeminjaman?.buku?.judul_buku}"</span> sekarang?
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleKembalikan}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Ya, Kembalikan"
                )}
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
