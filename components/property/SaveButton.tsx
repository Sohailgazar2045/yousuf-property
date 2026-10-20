"use client";

import { HeartIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/cn";
import { useShortlist } from "@/lib/shortlist";
import { button } from "@/lib/ui";

interface SaveButtonProps {
  listingId: string;
  /** "overlay" sits on a photo; "inline" is a labelled button. */
  variant?: "overlay" | "inline";
  className?: string;
}

export function SaveButton({ listingId, variant = "overlay", className }: SaveButtonProps) {
  const { t } = useI18n();
  const { has, toggle } = useShortlist();
  const saved = has(listingId);
  const label = t.common.save;

  const heart = (
    <HeartIcon
      key={String(saved)}
      className={cn("size-[18px]", saved ? "animate-pop fill-rose-500 text-rose-500" : "text-slate-800")}
      strokeWidth={2}
    />
  );

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggle(listingId)}
        aria-pressed={saved}
        className={cn(button.outline, "h-11 px-3.5 text-[14px]", className)}
      >
        {heart}
        {saved ? t.common.savedShort : t.common.saveShort}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(listingId)}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? t.common.unsave : t.common.save}
      className={cn("-m-1.5 grid size-12 shrink-0 place-items-center rounded-full", className)}
    >
      <span className="grid size-9 place-items-center rounded-full bg-white shadow-raise transition-transform active:scale-90">
        {heart}
      </span>
    </button>
  );
}
