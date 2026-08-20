"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  FiGrid,
  FiBook,
  FiLayers,
  FiRepeat,
  FiCornerDownLeft,
  FiFileText,
  FiUsers,
  FiLogOut,
  FiBookOpen,
  FiClock,
  FiX,
} from "react-icons/fi";

/* ═══════════════════════════════════════════════════
   Sidebar — Role-Based Navigation
   ═══════════════════════════════════════════════════ */

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function getMenuByRole(role: string | null): MenuItem[] {
  const base: MenuItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <FiGrid /> },
  ];

  switch (role) {
    case "admin":
      return [
        ...base,
        { label: "Buku", href: "/dashboard/buku", icon: <FiBook /> },
        { label: "Kategori Buku", href: "/dashboard/kategori", icon: <FiLayers /> },
        { label: "Peminjaman", href: "/dashboard/peminjaman", icon: <FiRepeat /> },
        { label: "Laporan", href: "/dashboard/laporan", icon: <FiFileText /> },
        { label: "Kelola Pengguna", href: "/dashboard/pengguna", icon: <FiUsers /> },
      ];
    case "petugas":
    case "pengelola":
      return [
        ...base,
        { label: "Buku", href: "/dashboard/buku", icon: <FiBook /> },
        { label: "Kategori Buku", href: "/dashboard/kategori", icon: <FiLayers /> },
        { label: "Peminjaman", href: "/dashboard/peminjaman", icon: <FiRepeat /> },
      ];
    case "peminjam":
    default:
      return [
        { label: "Pinjam Buku", href: "/dashboard/katalog", icon: <FiBookOpen /> },
        { label: "Peminjaman", href: "/dashboard/riwayat", icon: <FiClock /> },
      ];
  }
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, getRoleName } = useAuthStore();
  const role = getRoleName();
  const menuItems = getMenuByRole(role);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full w-[270px] flex-col bg-white shadow-xl
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-100
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header — User Profile */}
        <div className="relative flex flex-col items-center border-b border-gray-100 px-5 py-6">
          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <FiX className="text-lg" />
          </button>

          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
            <span className="text-xl font-bold text-white">
              {user?.username?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>

          <h3 className="mt-3 text-sm font-semibold text-gray-800 text-center">
            {user?.username ?? "Pengguna"}
          </h3>
          <span className="mt-1 inline-flex rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium capitalize text-primary">
            {role ?? "—"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-secondary text-white shadow-md shadow-secondary/25"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <span
                      className={`text-lg transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
