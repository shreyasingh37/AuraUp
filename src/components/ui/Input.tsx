import React from "react";

export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        "w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none",
        "focus:border-black/30 focus:ring-2 focus:ring-black/10",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

