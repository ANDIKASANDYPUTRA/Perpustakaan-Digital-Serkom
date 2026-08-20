"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import type { ApiResponse, DashboardStats } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import StatCard from "@/components/StatCard";
import { FiBook, FiUsers, FiRepeat, FiDollarSign } from "react-icons/fi";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { getRoleName } = useAuthStore();

  useEffect(() => {
    if (getRoleName() === "peminjam") {
      router.push("/dashboard/katalog");
    }
  }, [getRoleName, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<ApiResponse<DashboardStats>>(
          "/dashboard/statistik"
        );
        setStats(data.data);
      } catch {
        
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selamat datang! Berikut ringkasan data perpustakaan.
        </p>
      </div>

      {/* Stat Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FiUsers />}
            value={stats?.total_anggota ?? 0}
            label="Anggota"
          />
          <StatCard
            icon={<FiBook />}
            value={stats?.total_buku ?? 0}
            label="Buku"
          />
          <StatCard
            icon={<FiRepeat />}
            value={stats?.buku_dipinjam ?? 0}
            label="Dipinjam"
          />
          <StatCard
            icon={<FiDollarSign />}
            value={stats?.buku_dikembalikan ?? 0}
            label="Dikembalikan"
          />
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
        <p className="mt-1 text-sm text-gray-400">
          Gunakan menu di sidebar untuk mengelola data perpustakaan.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center py-8 text-gray-300">
          <svg className="mb-3 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-medium text-gray-400">
            Pilih menu di sidebar untuk memulai
          </p>
        </div>
      </div>
    </div>
  );
}
