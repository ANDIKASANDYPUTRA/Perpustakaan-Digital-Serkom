"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/axios";
import type { ApiResponse, Peminjaman } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";
import DataTable, { type Column } from "@/components/DataTable";
import FormModal from "@/components/FormModal";

export default function PeminjamanPage() {
  const { getRoleName } = useAuthStore();
  const role = getRoleName();

  // Sesuai requirement soal:
  // Admin dan Petugas dapat mengedit peminjaman.
  // Hanya Admin yang dapat menghapus peminjaman.
  const canEdit = role === "admin" || role === "petugas";
  const canDelete = role === "admin";

  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Peminjaman | null>(null);

  const [form, setForm] = useState({
    tanggal_kembali: "",
    status: "Dipinjam",
  });

  /**
   * Mengambil seluruh data peminjaman
   */
  const fetchData = async () => {
    setLoading(true);

    try {
      const { data: res } = await api.get<ApiResponse<Peminjaman[]>>(
        "/peminjaman"
      );

      setData(res.data ?? []);
    } catch (error) {
      console.error("Gagal mengambil data peminjaman:", error);

      alert("Gagal mengambil data peminjaman.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ambil data ketika halaman pertama kali dibuka
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Membuka modal edit
   */
  const openEdit = (item: Peminjaman) => {
    setEditItem(item);

    setForm({
      tanggal_kembali: item.tanggal_kembali ?? "",
      status: item.status ?? "Dipinjam",
    });

    setModalOpen(true);
  };

  /**
   * Menutup modal dan membersihkan state
   */
  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);

    setForm({
      tanggal_kembali: "",
      status: "Dipinjam",
    });
  };

  /**
   * Submit edit peminjaman
   *
   * Sesuai soal:
   * - Peminjam tidak dapat diubah
   * - Buku tidak dapat diubah
   * - Tanggal pinjam tidak dapat diubah
   * - Hanya tanggal kembali dan status yang dapat diubah
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editItem) return;

    try {
      await api.put(`/peminjaman/${editItem.id}`, {
        tanggal_kembali: form.tanggal_kembali,
        status: form.status,
      });

      alert("Data peminjaman berhasil diperbarui.");

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Gagal memperbarui peminjaman:", error);

      alert("Gagal memperbarui data peminjaman.");
    }
  };

  /**
   * Hapus peminjaman
   *
   * Sesuai soal:
   * - Admin dapat menghapus
   * - Petugas tidak dapat menghapus
   */
  const handleDelete = async (item: Peminjaman) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus data peminjaman ini?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/peminjaman/${item.id}`);

      alert("Data peminjaman berhasil dihapus.");

      await fetchData();
    } catch (error) {
      console.error("Gagal menghapus peminjaman:", error);

      alert("Gagal menghapus data peminjaman.");
    }
  };

  /**
   * Search peminjaman berdasarkan:
   * - Nama peminjam
   * - Judul buku
   * - Status
   */
  const searchValue = search.trim().toLowerCase();

  const filteredData = data.filter((peminjaman) => {
    const namaPeminjam =
      peminjaman.anggota?.username?.toLowerCase() ?? "";

    const judulBuku =
      peminjaman.buku?.judul_buku?.toLowerCase() ?? "";

    const status =
      peminjaman.status?.toLowerCase() ?? "";

    return (
      namaPeminjam.includes(searchValue) ||
      judulBuku.includes(searchValue) ||
      status.includes(searchValue)
    );
  });

  /**
   * Kolom DataTable
   */
  const columns: Column<Peminjaman>[] = [
    {
      key: "anggota",
      header: "Peminjam",
      render: (row) => row.anggota?.username ?? "-",
    },
    {
      key: "buku",
      header: "Buku",
      render: (row) => row.buku?.judul_buku ?? "-",
    },
    {
      key: "tanggal_pinjam",
      header: "Tgl Pinjam",
      render: (row) => row.tanggal_pinjam ?? "-",
    },
    {
      key: "tanggal_kembali",
      header: "Tgl Kembali",
      render: (row) => row.tanggal_kembali ?? "-",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            row.status === "Dipinjam"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Data Peminjaman
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola transaksi peminjaman buku
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari peminjam, judul buku, atau status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <DataTable<Peminjaman>
          columns={columns}
          data={filteredData}
          isLoading={loading}
          showActions={canEdit || canDelete}
          onEdit={canEdit ? openEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
        />
      </div>

      {/* Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title="Edit Peminjaman"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* Peminjam - tidak dapat diedit */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Peminjam
            </label>

            <input
              type="text"
              value={editItem?.anggota?.username ?? "-"}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>

          {/* Buku - tidak dapat diedit */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Buku
            </label>

            <input
              type="text"
              value={editItem?.buku?.judul_buku ?? "-"}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>

          {/* Tanggal Pinjam - tidak dapat diedit */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tanggal Pinjam
            </label>

            <input
              type="date"
              value={editItem?.tanggal_pinjam ?? ""}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>

          {/* Tanggal Kembali - dapat diedit */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tanggal Kembali
            </label>

            <input
              type="date"
              value={form.tanggal_kembali}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tanggal_kembali: e.target.value,
                }))
              }
              required
              className={inputCls}
            />
          </div>

          {/* Status - dapat diedit */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className={inputCls}
            >
              <option value="Dipinjam">Dipinjam</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-primary shadow-md transition-all hover:bg-accent-hover hover:shadow-lg"
          >
            Perbarui
          </button>
        </form>
      </FormModal>
    </div>
  );
}