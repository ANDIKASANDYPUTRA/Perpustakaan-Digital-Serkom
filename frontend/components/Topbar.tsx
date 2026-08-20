"use client";

import React from "react";
import { FiMenu, FiBell } from "react-icons/fi";
import { useAuthStore } from "@/lib/auth-store";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, getRoleName } = useAuthStore();
  const role = getRoleName();

  const TanggalSekarang = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <nav className="sticky top-0 z-30 flex h-16 items-center justify-between bg-primary px-4 shadow-lg shadow-primary/20 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-xl" />
        </button>

        <div className="flex items-center gap-2.5">
          <h1 className="hidden text-base font-semibold text-white sm:block">
            {TanggalSekarang}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2.5 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight text-white">
              Hi, {user?.username ?? "Pengguna"}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
