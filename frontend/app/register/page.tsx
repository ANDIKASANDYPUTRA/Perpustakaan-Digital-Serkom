"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { FiUser, FiLock, FiMail, FiMapPin, FiPhone, FiBookOpen, FiArrowRight } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    alamat: "",
    no_hp: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "Registrasi gagal. Periksa kembali data Anda.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all focus:border-accent/50 focus:bg-white/15 focus:ring-2 focus:ring-accent/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5" />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-secondary/5" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-primary shadow-2xl shadow-primary/30">
          <div className="h-1.5 bg-gradient-to-r from-accent via-accent/80 to-accent" />

          <div className="px-8 pb-10 pt-8 sm:px-10">
            {/* Logo */}
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
                <FiBookOpen className="text-3xl text-primary" />
              </div>
              <h1 className="text-xl font-bold text-white">Buat Akun Baru</h1>
              <p className="mt-1 text-sm text-white/60">Daftar untuk mulai meminjam buku</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 animate-fade-in rounded-xl bg-red-500/20 px-4 py-3 text-center text-sm font-medium text-white">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Nama
              <div className="group relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="register-nama"
                  type="text"
                  placeholder="Nama Lengkap"
                  value={form.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  required
                  className={inputClass}
                />
              </div> */}

              {/* Email */}
              <div className="group relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="register-email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Username */}
              <div className="group relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="register-username"
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="group relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="register-password"
                  type="password"
                  placeholder="Password (min. 8 karakter)"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>

              <div className="group relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="password-confirmation"
                  type="password"
                  placeholder="Konfirmasi password"
                  value={form.password_confirmation}
                  onChange={(e) => handleChange("password_confirmation", e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>

              {/* Alamat */}
              <div className="group relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="register-alamat"
                  type="text"
                  placeholder="Alamat"
                  value={form.alamat}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* No HP */}
              <div className="group relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="register-nohp"
                  type="text"
                  placeholder="No. HP (10-15 digit)"
                  value={form.no_hp}
                  onChange={(e) => handleChange("no_hp", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-primary shadow-lg shadow-accent/30 transition-all duration-300 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                ) : (
                  <>
                    Daftar
                    <FiArrowRight className="text-base" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-5 text-center text-sm text-white/50">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
