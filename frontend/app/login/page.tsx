"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { FiUser, FiLock, FiBookOpen, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });
      
      const role = useAuthStore.getState().getRoleName();
      if (role === "peminjam") {
        router.push("/dashboard/katalog");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "Login gagal. Periksa kembali email dan password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5" />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-secondary/5" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-primary shadow-2xl shadow-primary/30">
          {/* Top decorative strip */}
          <div className="h-1.5 bg-gradient-to-r from-accent via-accent/80 to-accent" />

          <div className="px-8 pb-10 pt-10 sm:px-10">
            {/* Logo / Icon */}
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
                <FiBookOpen className="text-4xl text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Perpustakaan Digital UBIG</h1>
              <p className="mt-1 text-sm text-white/60">Masuk ke akun Anda</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 animate-fade-in rounded-xl bg-red-500/20 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="group relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="login-email"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all focus:border-accent/50 focus:bg-white/15 focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Password */}
              <div className="group relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all focus:border-accent/50 focus:bg-white/15 focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-primary shadow-lg shadow-accent/30 transition-all duration-300 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                ) : (
                  <>
                    Masuk
                    <FiArrowRight className="text-base" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-white/50">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
