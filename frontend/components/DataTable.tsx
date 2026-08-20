"use client";

import React, { type ReactNode } from "react";

/* ═══════════════════════════════════════════════════
   DataTable — Reusable table component
   ═══════════════════════════════════════════════════ */

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  showActions?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  keyField?: string;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  showActions = false,
  onEdit,
  onDelete,
  keyField = "id",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="mb-3 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-sm font-medium">Belum ada data</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-secondary/10 text-xs uppercase tracking-wider text-gray-600">
            <th className="px-4 py-3 font-semibold">No</th>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold">
                {col.header}
              </th>
            ))}
            {showActions && <th className="px-4 py-3 text-center font-semibold">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr
              key={String((row as any)[keyField] ?? i)}
              className="transition-colors hover:bg-gray-50/80"
            >
              <td className="px-4 py-3 font-medium text-gray-500">{i + 1}</td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? "-")}
                </td>
              ))}
              {showActions && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary hover:text-white"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
