"use client";

import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-[#e8e1d7] bg-white shadow-[0_28px_80px_rgb(17_17_19/0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#eee8df] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#111113]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[#6d6a65]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-bold text-[#6d6a65] transition hover:bg-[#f7f1e8] hover:text-[#111113]"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
