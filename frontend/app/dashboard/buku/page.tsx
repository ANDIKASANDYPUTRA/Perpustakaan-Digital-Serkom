"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/axios";
import type { ApiResponse, Buku, KategoriBuku } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";
import DataTable, { type Column } from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import { FiPlus } from "react-icons/fi";

/* ═══════════════════════════════════════════════════
   Buku Page — /dashboard/buku
   CRUD with role-based conditional rendering
   ═══════════════════════════════════════════════════ */

export default function BukuPage() {
  const { getRoleName } = useAuthStore();
  const role = getRoleName();
  const canAdd = role === "admin" || role === "petugas";
  const canEdit = role === "admin" || role === "petugas";
  const canDelete = role === "admin";

  const [data, setData] = useState<Buku[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriBuku[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Buku | null>(null);
  const [form, setForm] = useState({
    judul_buku: "",
    penulis: "",
    penerbit: "",
    tahun_terbit: "",
    kategori_id: [] as number[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<ApiResponse<Buku[]>>("/buku");
      setData(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchKategori = async () => {
    try {
      const { data: res } = await api.get<ApiResponse<KategoriBuku[]>>("/kategori");
      setKategoriList(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    fetchKategori();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ judul_buku: "", penulis: "", penerbit: "", tahun_terbit: "", kategori_id: [] });
    setModalOpen(true);
  };

  const openEdit = (item: Buku) => {
    setEditItem(item);
    setForm({
      judul_buku: item.judul_buku,
      penulis: item.penulis,
      penerbit: item.penerbit,
      tahun_terbit: String(item.tahun_terbit),
      kategori_id: item.kategori?.map((k) => k.id) ?? [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, tahun_terbit: Number(form.tahun_terbit) };

    if (editItem) {
      await api.put(`/buku/${editItem.id}`, payload);
    } else {
      await api.post("/buku", payload);
    }

    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (item: Buku) => {
    if (!confirm(`Hapus buku "${item.judul_buku}"?`)) return;
    try {
      await api.delete(`/buku/${item.id}`);
      alert(`Buku "${item.judul_buku}" berhasil dihapus.`);
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Gagal menghapus buku.";
      alert(`Error: ${msg}`);
      console.error("Gagal menghapus data", error);
    }
  };

  const toggleKategori = (id: number) => {
    setForm((prev) => ({
      ...prev,
      kategori_id: prev.kategori_id.includes(id)
        ? prev.kategori_id.filter((k) => k !== id)
        : [...prev.kategori_id, id],
    }));
  };

  const filteredData = data.filter(
    (b) =>
      b.judul_buku.toLowerCase().includes(search.toLowerCase()) ||
      b.penulis.toLowerCase().includes(search.toLowerCase()) ||
      b.penerbit.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Buku>[] = [
    { key: "judul_buku", header: "Judul Buku" },
    { key: "penulis", header: "Penulis" },
    { key: "penerbit", header: "Penerbit" },
    { key: "tahun_terbit", header: "Tahun" },
    {
      key: "kategori",
      header: "Kategori",
      render: (row) =>
        row.kategori?.map((k) => (
          <span key={k.id} className="mr-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {k.nama_kategori}
          </span>
        )) ?? "-",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Buku</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola koleksi buku perpustakaan</p>
        </div>
        {canAdd && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            <FiPlus className="text-lg" /> Tambah Buku
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari judul, penulis, atau penerbit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={loading}
          showActions={canEdit || canDelete}
          onEdit={canEdit ? (row) => openEdit(row as unknown as Buku) : undefined}
          onDelete={canDelete ? (row) => handleDelete(row as unknown as Buku) : undefined}
        />
      </div>

      {/* Modal Form */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Buku" : "Tambah Buku"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Judul Buku</label>
            <input
              type="text"
              value={form.judul_buku}
              onChange={(e) => setForm((p) => ({ ...p, judul_buku: e.target.value }))}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Penulis</label>
              <input
                type="text"
                value={form.penulis}
                onChange={(e) => setForm((p) => ({ ...p, penulis: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Penerbit</label>
              <input
                type="text"
                value={form.penerbit}
                onChange={(e) => setForm((p) => ({ ...p, penerbit: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tahun Terbit</label>
            <input
              type="number"
              value={form.tahun_terbit}
              onChange={(e) => setForm((p) => ({ ...p, tahun_terbit: e.target.value }))}
              required
              min={1900}
              max={2099}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {kategoriList.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {kategoriList.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKategori(k.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      form.kategori_id.includes(k.id)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {k.nama_kategori}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-primary shadow-md transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            {editItem ? "Perbarui" : "Simpan"}
          </button>
        </form>
      </FormModal>
    </div>
  );
}
