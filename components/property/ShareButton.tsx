"use client";

import { useEffect, useState } from "react";
import { CheckIcon, ShareIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/cn";
import { button } from "@/lib/ui";

interface ShareButtonProps {
  title: string;
  url: string;
  /** "overlay" is a round icon button that sits on a photo. */
  variant?: "inline" | "overlay";
  className?: string;
}

/** Native share sheet on phones; copies the link everywhere else. */
export function ShareButton({ title, url, variant = "inline", className }: ShareButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if ((err as DOMException).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(t.common.share, url);
    }
  }

  const icon = copied ? (
    <CheckIcon className="size-[18px] text-brand-700" strokeWidth={2.2} />
  ) : (
    <ShareIcon className="size-[18px]" />
  );

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={share}
        aria-label={copied ? t.common.linkCopied : t.common.share}
        title={t.common.share}
        className={cn("-m-1.5 grid size-12 shrink-0 place-items-center rounded-full", className)}
      >
        <span className="grid size-9 place-items-center rounded-full bg-white text-slate-800 shadow-raise transition-transform active:scale-90">
          {icon}
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? t.common.linkCopied : ""}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={share} className={cn(button.outline, "h-11 px-3.5 text-[14px]", className)}>
      {icon}
      <span aria-live="polite">{copied ? t.common.linkCopied : t.common.share}</span>
    </button>
  );
}
