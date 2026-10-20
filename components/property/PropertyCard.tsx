"use client";

import Link from "next/link";
import { AreaIcon, BathIcon, BedIcon, MapPinIcon, PhoneIcon, ShieldCheckIcon, WhatsAppIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { formatArea, formatDate, formatPrice, formatUnitRate } from "@/lib/format";
import { interpolate, localePath, pick } from "@/lib/i18n";
import type { Listing } from "@/lib/listings";
import { button } from "@/lib/ui";
import { listingEnquiryLink } from "@/lib/whatsapp";
import { ImageSwiper } from "./ImageSwiper";
import type { PhotoLoading } from "./ListingPhoto";
import { SaveButton } from "./SaveButton";
import { StatusBadge } from "./StatusBadge";

interface PropertyCardProps {
  listing: Listing;
  /** Loading strategy for the card’s first photo; only above-the-fold cards should use "preload". */
  firstLoading?: PhotoLoading;
}

export function PropertyCard({ listing, firstLoading }: PropertyCardProps) {
  const { t, locale } = useI18n();
  const href = localePath(locale, `/properties/${listing.slug}`);
  const unitRate = formatUnitRate(listing, t.units);
  const title = pick(listing.title, locale);

  const specs = [
    { icon: AreaIcon, label: formatArea(listing, t.units) },
    ...(listing.beds !== undefined ? [{ icon: BedIcon, label: interpolate(t.common.beds, { n: listing.beds }) }] : []),
    ...(listing.baths !== undefined ? [{ icon: BathIcon, label: interpolate(t.common.baths, { n: listing.baths }) }] : []),
  ];

  return (
    <article
      className={cn(
        "group/card flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-raise",
        listing.status === "sold" && "opacity-70",
      )}
    >
      <ImageSwiper listing={listing} href={href} firstLoading={firstLoading}>
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {listing.verified && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white py-1 ps-1.5 pe-2 text-[12px] font-bold text-brand-800 shadow-raise">
                <ShieldCheckIcon className="size-3.5" strokeWidth={2.2} />
                {t.common.verified}
              </span>
            )}
            <StatusBadge status={listing.status} />
          </div>
          <SaveButton listingId={listing.id} className="pointer-events-auto" />
        </div>
      </ImageSwiper>

      {/* The title link stretches over this block only, so the photo stays swipeable and the buttons stay tappable. */}
      <div className="relative flex flex-1 flex-col px-4 pb-3.5 pt-3.5">
        <p className="text-[13px] font-semibold text-brand-700">{t.types[listing.type]}</p>

        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="text-[20px] font-extrabold leading-tight tracking-[-0.01em] text-slate-900">
            {formatPrice(listing.price, t.units, locale)}
          </p>
          {unitRate && <p className="shrink-0 text-[13px] text-slate-600">{unitRate}</p>}
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800">
          <Link
            href={href}
            className="transition-colors after:absolute after:inset-0 after:rounded-sm group-hover/card:text-brand-800 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-brand-700"
          >
            {title}
          </Link>
        </h3>

        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[14px] text-slate-600">
          <MapPinIcon className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">
            {pick(listing.society, locale)}
            {t.common.listSeparator}
            {t.cities[listing.city]}
          </span>
        </p>

        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-slate-700">
          {specs.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-4 text-slate-500" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-2.5">
        <p className="min-w-0 truncate text-[12px] text-slate-500">
          {interpolate(t.common.listedOn, { date: formatDate(listing.listedOn, locale) })}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <CallLink
            source="card"
            aria-label={t.common.callAdvisor}
            title={t.common.callAdvisor}
            className={cn(button.outline, "relative size-11 after:absolute after:-inset-0.5")}
          >
            <PhoneIcon className="size-[18px] text-brand-800" />
          </CallLink>
          <WhatsAppLink
            href={listingEnquiryLink(listing, t, locale)}
            source="card"
            listingRef={listing.id}
            className={cn(button.whatsappOutline, "relative h-11 px-3.5 text-[14px] after:absolute after:-inset-0.5")}
          >
            <WhatsAppIcon className="size-[18px]" />
            {t.common.whatsapp}
          </WhatsAppLink>
        </div>
      </div>
    </article>
  );
}
