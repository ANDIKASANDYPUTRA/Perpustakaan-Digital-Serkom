/* ═══════════════════════════════════════════════════
   Type Definitions — Sistem Manajemen Perpustakaan
   ═══════════════════════════════════════════════════ */

// ─── API Generic Wrapper ─────────────────────────
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data: T;
  token?: string;
}

// ─── Auth & User ─────────────────────────────────
export interface Role {
  id: number;
  nama_role: string;
}

export type RoleName = "admin" | "petugas" | "peminjam";

export interface User {
  id: number;
  nama: string;
  email: string;
  username: string;
  alamat: string | null;
  no_hp: string;
  tanggal_bergabung: string;
  id_role: number;
  role?: Role;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterPayload {
  nama: string;
  email: string;
  username: string;
  password: string;
  alamat: string;
  no_hp: string;
}

// ─── Dashboard ───────────────────────────────────
export interface DashboardStats {
  total_buku: number;
  total_anggota: number;
  buku_dipinjam: number;
  buku_dikembalikan?: number;
}

// ─── Buku ────────────────────────────────────────
export interface KategoriBuku {
  id: number;
  nama_kategori: string;
}

export interface Buku {
  id: number;
  judul_buku: string;
  penulis: string;
  penerbit: string;
  tahun_terbit: number;
  kategori?: KategoriBuku[];
}

// ─── Peminjaman ──────────────────────────────────
export interface Peminjaman {
  id: number;
  id_anggota: number;
  id_buku: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: "Dipinjam" | "Selesai" | "Dikembalikan";
  buku?: Buku;
  anggota?: User;
}

// ─── Pengembalian ────────────────────────────────
export interface Pengembalian {
  id: number;
  id_peminjaman: number;
  tanggal_dikembalikan: string;
  kondisi_buku: string | null;
  peminjaman?: Peminjaman;
}

// ─── Laporan ─────────────────────────────────────
export type Laporan = Peminjaman;

