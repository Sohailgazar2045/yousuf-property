"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/cn";
import { localePath } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Tone = "dark" | "light";

/** The "Y" mark. "light" swaps the black letter for white, for photos and dark surfaces. */
export function LogoMark({ className, tone = "dark", tile = false }: { className?: string; tone?: Tone; tile?: boolean }) {
  const image = (
    <Image
      src={tone === "light" ? "/brand/logo-mark-light@2x.png" : "/brand/logo-mark@2x.png"}
      alt=""
      // Displayed at 40–44px tall; these dimensions give a crisp 1x/2x srcset instead of a 1080px download.
      width={48}
      height={46}
      loading="eager"
      className={tile ? "h-full w-auto" : cn("w-auto", className)}
    />
  );

  if (!tile) return image;

  return (
    <span className={cn("grid shrink-0 place-items-center rounded-lg bg-white p-1.5", className)} aria-hidden="true">
      {image}
    </span>
  );
}

/** Mark plus a two-line wordmark: the name, and the trade underneath. */
export function Logo({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  const { locale } = useI18n();
  const [first, ...rest] = SITE.name[locale].split(" ");

  return (
    <Link
      href={localePath(locale)}
      className={cn("group flex min-w-0 shrink-0 items-center gap-2.5 rounded-md", className)}
    >
      <LogoMark tone={tone} className="h-10 shrink-0 transition-[height] duration-300 lg:h-11" />
      <span className="flex min-w-0 flex-col justify-center">
        <span
          className={cn(
            "truncate text-[19px] font-extrabold leading-none tracking-[-0.015em] transition-colors duration-300",
            tone === "dark" ? "text-slate-950" : "text-white",
          )}
        >
          {first}
        </span>
        <span
          className={cn(
            "mt-1 truncate text-[10.5px] font-bold uppercase leading-none tracking-[0.2em] transition-colors duration-300",
            locale === "ur" && "mt-1.5 text-[12px] font-semibold",
            tone === "dark" ? "text-brand-800" : "text-white/80",
          )}
        >
          {rest.join(" ")}
        </span>
      </span>
    </Link>
  );
}
