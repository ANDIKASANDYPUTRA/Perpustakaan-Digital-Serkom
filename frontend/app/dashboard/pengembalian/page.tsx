"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/axios";
import type { ApiResponse, Pengembalian } from "@/lib/types";
import DataTable, { type Column } from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import { FiPlus } from "react-icons/fi";

export default function PengembalianPage() {
  const [data, setData] = useState<Pengembalian[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ id_peminjaman: "", tanggal_dikembalikan: "", kondisi_buku: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<ApiResponse<Pengembalian[]>>("/pengembalian");
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/pengembalian", { ...form, id_peminjaman: Number(form.id_peminjaman) });
    setModalOpen(false);
    setForm({ id_peminjaman: "", tanggal_dikembalikan: "", kondisi_buku: "" });
    fetchData();
  };



  const columns: Column<Pengembalian>[] = [
    { key: "peminjaman", header: "Peminjam", render: (r) => r.peminjaman?.anggota?.nama ?? "-" },
    { key: "buku", header: "Buku", render: (r) => r.peminjaman?.buku?.judul_buku ?? "-" },
    { key: "tanggal_dikembalikan", header: "Tgl Dikembalikan" },

    { key: "kondisi_buku", header: "Kondisi", render: (r) => r.kondisi_buku ?? "-" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Pengembalian</h1>
          <p className="mt-1 text-sm text-gray-500">Catat pengembalian buku</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg">
          <FiPlus className="text-lg" /> Proses Pengembalian
        </button>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={data} isLoading={loading} />
      </div>
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Proses Pengembalian">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ID Peminjaman</label>
            <input type="number" value={form.id_peminjaman} onChange={(e) => setForm(p => ({ ...p, id_peminjaman: e.target.value }))} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tanggal Dikembalikan</label>
            <input type="date" value={form.tanggal_dikembalikan} onChange={(e) => setForm(p => ({ ...p, tanggal_dikembalikan: e.target.value }))} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Kondisi Buku</label>
            <input type="text" value={form.kondisi_buku} onChange={(e) => setForm(p => ({ ...p, kondisi_buku: e.target.value }))} placeholder="Baik / Rusak" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <button type="submit" className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-primary shadow-md transition-all hover:bg-accent-hover hover:shadow-lg">Proses</button>
        </form>
      </FormModal>
    </div>
  );
}
