import React from "react";

type Variant = "primary" | "ghost" | "soft";

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:translate-y-[1px] disabled:opacity-50 disabled:active:translate-y-0";
  const styles: Record<Variant, string> = {
    primary: "bg-black text-white hover:bg-black/90",
    ghost: "bg-transparent text-black hover:bg-black/5",
    soft: "bg-white/70 text-black hover:bg-white glass",
  };
  return <button className={[base, styles[variant], className].join(" ")} {...props} />;
}

