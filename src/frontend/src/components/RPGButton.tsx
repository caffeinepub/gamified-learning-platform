import { Loader2 } from "lucide-react";
import type React from "react";
import { cn } from "../lib/utils";

interface RPGButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "emerald" | "crimson" | "navy";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES = {
  gold: "bg-gradient-to-b from-gold-light to-gold border-2 border-gold-dark text-navy-dark shadow-[0_4px_0_0_#92400e] hover:shadow-[0_2px_0_0_#92400e] hover:translate-y-0.5 active:shadow-none active:translate-y-1",
  emerald:
    "bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-emerald-800 text-white shadow-[0_4px_0_0_#065f46] hover:shadow-[0_2px_0_0_#065f46] hover:translate-y-0.5 active:shadow-none active:translate-y-1",
  crimson:
    "bg-gradient-to-b from-red-400 to-red-600 border-2 border-red-800 text-white shadow-[0_4px_0_0_#7f1d1d] hover:shadow-[0_2px_0_0_#7f1d1d] hover:translate-y-0.5 active:shadow-none active:translate-y-1",
  navy: "bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-900 text-white shadow-[0_4px_0_0_#1e3a5f] hover:shadow-[0_2px_0_0_#1e3a5f] hover:translate-y-0.5 active:shadow-none active:translate-y-1",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-8 py-3.5 text-lg rounded-xl",
};

export default function RPGButton({
  variant = "gold",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: RPGButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "font-heading font-bold transition-all duration-100 cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <Loader2 size={16} className="animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
