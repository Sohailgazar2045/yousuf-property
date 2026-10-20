import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PillProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** Single-choice chip, e.g. budget presets. */
export function Pill({ selected, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center justify-center whitespace-nowrap rounded-(--radius-control) border px-2.5 text-[14px] font-semibold transition-colors lg:h-10 lg:text-[13px]",
        selected
          ? "border-brand-800 bg-brand-800 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-500",
      )}
    >
      {children}
    </button>
  );
}
