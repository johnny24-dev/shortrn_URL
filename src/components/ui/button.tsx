import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-[#e8950c] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_20px_rgb(232_149_12/0.18)] transition hover:bg-[#c57504] disabled:cursor-not-allowed disabled:bg-[#cfc7bb] disabled:shadow-none ${className}`}
    />
  );
}
