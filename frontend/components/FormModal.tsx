"use client";

import React, { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiBookOpen, FiX } from "react-icons/fi";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Reusable modal overlay with fade/scale animation.
 * Wraps form content provided via children.
 */
export default function FormModal({ open, onClose, title, children }: FormModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FiBookOpen className="text-lg text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body — form content */}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
