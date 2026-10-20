"use client";

import Link from "next/link";
import { useMemo } from "react";
import { HeartIcon, TrashIcon, WhatsAppIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { localePath, plural } from "@/lib/i18n";
import { getListingsByIds } from "@/lib/listings";
import { useShortlist } from "@/lib/shortlist";
import { button } from "@/lib/ui";
import { shortlistLink } from "@/lib/whatsapp";

export function ShortlistView() {
  const { t, locale } = useI18n();
  const { ids, ready, clear } = useShortlist();
  // Saved IDs can outlive listings that were removed from the JSON; skip those.
  const listings = useMemo(() => getListingsByIds(ids), [ids]);

  if (!ready) {
    return (
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label={t.shortlist.title}>
        {[0, 1, 2].map((i) => (
          <li key={i} className="overflow-hidden rounded-(--radius-card) border border-slate-200">
            <div className="aspect-[4/3] animate-pulse bg-slate-100" />
            <div className="space-y-2.5 p-4">
              <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-3/5 animate-pulse rounded bg-slate-100" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-(--radius-card) border border-slate-200 px-6 py-16 text-center">
        <HeartIcon className="mx-auto size-8 text-slate-400" />
        <h2 className="mt-4 text-[18px] font-bold text-slate-900">{t.shortlist.emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-slate-600">{t.shortlist.emptyBody}</p>
        <Link href={localePath(locale, "/properties")} className={cn(button.primary, "mt-6 h-12 px-6 text-[15px]")}>
          {t.shortlist.browse}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-[16px] font-semibold text-slate-900">{plural(listings.length, t.shortlist.countOne, t.shortlist.countMany)}</p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t.shortlist.confirmClear)) clear();
            }}
            className="inline-flex min-h-10 items-center gap-1.5 text-[14px] font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
          >
            <TrashIcon className="size-4" />
            {t.shortlist.clear}
          </button>
        </div>
        <WhatsAppLink
          href={shortlistLink(listings, t, locale)}
          source="shortlist"
          className={cn(button.whatsapp, "h-12 shrink-0 px-5 text-[14px] max-sm:hidden")}
        >
          <WhatsAppIcon className="size-5" />
          {t.shortlist.enquireAll}
        </WhatsAppLink>
      </div>

      <h2 className="sr-only">{plural(listings.length, t.shortlist.countOne, t.shortlist.countMany)}</h2>
      <PropertyGrid listings={listings} className="mt-6" />

      {/* Phones: the one action that matters, in thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pb-safe pt-3 sm:hidden">
        <WhatsAppLink href={shortlistLink(listings, t, locale)} source="shortlist-bar" className={cn(button.whatsapp, "h-12 w-full text-[15px]")}>
          <WhatsAppIcon className="size-5" />
          {t.shortlist.enquireAll}
        </WhatsAppLink>
      </div>
    </>
  );
}
