"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import type { ApiResponse, Buku } from "@/lib/types";
import { FiBook, FiUser, FiCalendar, FiCheckCircle, FiInfo } from "react-icons/fi";
import FormModal from "@/components/FormModal";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

export default function KatalogPage() {
  const [books, setBooks] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
  const router = useRouter();

  const [detailBook, setDetailBook] = useState<Buku | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Buku | null>(null);
  const [pinjamModalOpen, setPinjamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await api.get<ApiResponse<Buku[]>>("/buku");
        setBooks(res.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const openDetailModal = (book: Buku) => {
    setDetailBook(book);
    setDetailModalOpen(true);
  };

  const openPinjamModal = (book: Buku, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBook(book);
    setSuccess(false);
    setPinjamModalOpen(true);
  };

  const handlePinjam = async () => {
    if (!selectedBook || !user) return;
    setIsSubmitting(true);
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      await api.post("/peminjaman", {
        id_anggota: user.id,
        id_buku: selectedBook.id,
        tanggal_pinjam: today.toISOString().split("T")[0],
        tanggal_kembali: nextWeek.toISOString().split("T")[0],
      });
      setSuccess(true);
      if (detailModalOpen) setDetailModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal meminjam buku. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAndRedirect = () => {
    setPinjamModalOpen(false);
    router.push("/dashboard/riwayat");
  };

  const filtered = books.filter(b =>
    b.judul_buku.toLowerCase().includes(search.toLowerCase()) ||
    b.penulis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Header with Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pinjam Buku</h1>
        <p className="mt-1 text-base font-medium text-primary">Mau baca buku apa hari ini?</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari judul atau penulis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-200" />)}
        </div>
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <div
              key={book.id}
              onClick={() => openDetailModal(book)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <FiBook className="text-xl" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-primary flex items-center gap-1">
                  <FiInfo /> Detail
                </span>
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-800 line-clamp-2">{book.judul_buku}</h3>
              <div className="flex flex-col gap-1 text-sm text-gray-500 flex-1">
                <span className="flex items-center gap-1.5"><FiUser className="text-xs" />{book.penulis}</span>
                <span className="flex items-center gap-1.5"><FiCalendar className="text-xs" />{book.tahun_terbit}</span>
              </div>
              {book.kategori && book.kategori.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {book.kategori.map(k => (
                    <span key={k.id} className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-amber-700">{k.nama_kategori}</span>
                  ))}
                </div>
              )}
              
              <button 
                onClick={(e) => openPinjamModal(book, e)}
                className="mt-4 w-full rounded-xl bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark shadow-sm"
              >
                Pinjam
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400">
              <p className="text-sm font-medium">Buku tidak ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Buku */}
      <FormModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detail Buku"
      >
        {detailBook && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400">Judul Buku</label>
              <p className="text-lg font-bold text-gray-800">{detailBook.judul_buku}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Penulis</label>
                <p className="text-sm font-semibold text-gray-700">{detailBook.penulis}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Penerbit</label>
                <p className="text-sm font-semibold text-gray-700">{detailBook.penerbit}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">Tahun Terbit</label>
              <p className="text-sm font-semibold text-gray-700">{detailBook.tahun_terbit}</p>
            </div>
            {detailBook.kategori && detailBook.kategori.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Kategori</label>
                <div className="flex flex-wrap gap-1.5">
                  {detailBook.kategori.map((k) => (
                    <span key={k.id} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {k.nama_kategori}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                onClick={() => openPinjamModal(detailBook)}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark"
              >
                Pinjam Buku
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Modal Dialog Konfirmasi Pinjam Buku */}
      <FormModal 
        open={pinjamModalOpen} 
        onClose={() => setPinjamModalOpen(false)} 
        title={success ? "Peminjaman Berhasil" : "Konfirmasi Peminjaman"}
      >
        {success ? (
          <div className="flex flex-col items-center py-4 text-center">
            <FiCheckCircle className="mb-4 text-5xl text-emerald-500" />
            <h3 className="mb-2 text-lg font-bold text-gray-800">Berhasil Meminjam!</h3>
            <p className="mb-6 text-sm text-gray-600 leading-relaxed">
              Selamat, Anda telah berhasil meminjam buku <span className="font-bold text-gray-800">"{selectedBook?.judul_buku}"</span>. Durasi Peminjaman Buku Hanya Selama 1 Minggu.
            </p>
            <button
              onClick={closeAndRedirect}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark"
            >
              Lihat Peminjaman Saya
            </button>
          </div>
        ) : (
          <div className="flex flex-col text-center sm:text-left">
            <p className="mb-6 text-base text-gray-700">
              Apakah Anda yakin ingin meminjam buku <span className="font-bold text-gray-900">"{selectedBook?.judul_buku}"</span>?
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setPinjamModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Tidak
              </button>
              <button
                onClick={handlePinjam}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Ya"
                )}
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
