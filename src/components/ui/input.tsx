import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`focus-ring min-h-11 rounded-md border border-[#e8e1d7] bg-white px-3 text-sm text-[#111113] transition placeholder:text-[#9b948c] ${className}`}
    />
  );
}
