"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/axios";
import type { ApiResponse, KategoriBuku } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";
import DataTable, { type Column } from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import { FiPlus } from "react-icons/fi";

/* ═══════════════════════════════════════════════════
   Kategori Buku Page — /dashboard/kategori
   ═══════════════════════════════════════════════════ */

export default function KategoriPage() {
  const { getRoleName } = useAuthStore();
  const role = getRoleName();
  const canAdd = role === "admin" || role === "petugas";
  const canEdit = role === "admin" || role === "petugas";
  const canDelete = role === "admin";

  const [data, setData] = useState<KategoriBuku[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<KategoriBuku | null>(null);
  const [namaKategori, setNamaKategori] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<ApiResponse<KategoriBuku[]>>("/kategori");
      setData(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setNamaKategori("");
    setModalOpen(true);
  };

  const openEdit = (item: KategoriBuku) => {
    setEditItem(item);
    setNamaKategori(item.nama_kategori);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/kategori/${editItem.id}`, { nama_kategori: namaKategori });
        alert("Kategori berhasil diperbarui.");
      } else {
        await api.post("/kategori", { nama_kategori: namaKategori });
        alert("Kategori berhasil ditambahkan.");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Gagal menyimpan kategori.";
      alert(`Error: ${msg}`);
      console.error("Gagal menyimpan data", error);
    }
  };

  const handleDelete = async (item: KategoriBuku) => {
    if (!confirm(`Hapus kategori "${item.nama_kategori}"?`)) return;
    try {
      await api.delete(`/kategori/${item.id}`);
      alert(`Kategori "${item.nama_kategori}" berhasil dihapus.`);
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Gagal menghapus kategori.";
      alert(`Error: ${msg}`);
      console.error("Gagal menghapus data", error);
    }
  };

  const filteredData = data.filter((k) =>
    k.nama_kategori.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<KategoriBuku>[] = [
    { key: "nama_kategori", header: "Nama Kategori" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kategori Buku</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola kategori buku perpustakaan</p>
        </div>
        {canAdd && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            <FiPlus className="text-lg" /> Tambah Kategori
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={loading}
          showActions={canEdit || canDelete}
          onEdit={canEdit ? (row) => openEdit(row as unknown as KategoriBuku) : undefined}
          onDelete={canDelete ? (row) => handleDelete(row as unknown as KategoriBuku) : undefined}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Kategori" : "Tambah Kategori"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Kategori</label>
            <input
              type="text"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
