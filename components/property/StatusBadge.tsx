"use client";

import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/cn";
import type { ListingStatus } from "@/lib/listings";

export function StatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  const { t } = useI18n();
  if (status === "available") return null;

  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-[12px] font-bold shadow-raise",
        status === "sold" ? "bg-slate-900 text-white" : "bg-slate-900/85 text-white backdrop-blur-sm",
        className,
      )}
    >
      {t.status[status]}
    </span>
  );
}
