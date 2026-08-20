"use client";

import React, { type ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
}

/**
 * Dashboard statistic card with accent icon and white text
 * on primary blue background.
 */
export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative circle */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 transition-transform duration-500 group-hover:scale-125" />
      <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/[0.03]" />

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent transition-transform duration-300 group-hover:scale-110">
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight text-white">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-white/70">{label}</p>
        </div>
      </div>
    </div>
  );
}
