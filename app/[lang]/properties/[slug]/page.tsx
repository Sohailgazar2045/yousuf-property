import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  AreaIcon,
  BathIcon,
  BedIcon,
  CheckIcon,
  ChevronRightIcon,
  HouseIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { LogoMark } from "@/components/layout/Logo";
import { Gallery } from "@/components/property/Gallery";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { SaveButton } from "@/components/property/SaveButton";
import { ShareButton } from "@/components/property/ShareButton";
import { StatusBadge } from "@/components/property/StatusBadge";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { formatArea, formatDate, formatPrice, formatUnitRate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { interpolate, isLocale, LOCALES, localePath, pick, type Locale } from "@/lib/i18n";
import { getListingBySlug, getSimilarListings, LISTINGS } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { SITE, SITE_URL } from "@/lib/site";
import { button, container, heading } from "@/lib/ui";
import { listingEnquiryLink, listingLocation, listingUrl } from "@/lib/whatsapp";


export function generateStaticParams() {
  return LOCALES.flatMap((lang) => LISTINGS.map((l) => ({ lang, slug: l.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const listing = getListingBySlug(slug);
  if (!isLocale(lang) || !listing) return {};
  const t = getDictionary(lang);

  const title = `${pick(listing.title, lang)} – ${formatPrice(listing.price, t.units, lang)}`;
  const description = `${listingLocation(listing, t, lang)}${t.common.sentenceEnd} ${pick(listing.description, lang)}`.slice(0, 300);
  return pageMetadata({ locale: lang, path: `/properties/${slug}`, title, description, ownImage: true });
}

export default async function PropertyPage({ params }: PageProps<"/[lang]/properties/[slug]">) {
  const { lang, slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) notFound();

  const locale = lang as Locale;
  const t = getDictionary(locale);
  const title = pick(listing.title, locale);
  const unitRate = formatUnitRate(listing, t.units);
  const enquiryHref = listingEnquiryLink(listing, t, locale);
  const similar = getSimilarListings(listing, 3);
  const url = listingUrl(listing, locale);
  const { lat, lng } = listing.coordinates;

  const keySpecs: Array<{ icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; value: string }> = [
    { icon: HouseIcon, label: t.detail.type, value: t.types[listing.type] },
    { icon: AreaIcon, label: t.detail.size, value: formatArea(listing, t.units) },
    ...(listing.beds !== undefined ? [{ icon: BedIcon, label: t.detail.bedrooms, value: String(listing.beds) }] : []),
    ...(listing.baths !== undefined ? [{ icon: BathIcon, label: t.detail.bathrooms, value: String(listing.baths) }] : []),
  ];

  // Only facts not already shown in the price block and spec row above.
  const facts: Array<[string, string]> = [
    ...(unitRate ? [[t.detail.rate, unitRate] as [string, string]] : []),
    [t.detail.city, t.cities[listing.city]],
    [t.detail.society, pick(listing.society, locale)],
    [t.detail.block, pick(listing.block, locale)],
    [t.detail.status, t.status[listing.status]],
    [t.detail.listed, formatDate(listing.listedOn, locale)],
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: title,
      description: pick(listing.description, locale),
      url,
      datePosted: listing.listedOn,
      inLanguage: locale,
      image: listing.photos.filter((p) => p.src).map((p) => `${SITE_URL}${p.src}`),
      offers: {
        "@type": "Offer",
        price: listing.price,
        priceCurrency: "PKR",
        availability: {
          available: "https://schema.org/InStock",
          "under-offer": "https://schema.org/LimitedAvailability",
          sold: "https://schema.org/SoldOut",
        }[listing.status],
      },
      contentLocation: {
        "@type": "Place",
        name: listingLocation(listing, t, locale),
        geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.nav.home, item: `${SITE_URL}/${locale}` },
        { "@type": "ListItem", position: 2, name: t.nav.properties, item: `${SITE_URL}/${locale}/properties` },
        {
          "@type": "ListItem",
          position: 3,
          name: t.cities[listing.city],
          item: `${SITE_URL}/${locale}/properties?city=${listing.city}`,
        },
        { "@type": "ListItem", position: 4, name: title, item: url },
      ],
    },
  ];

  const breadcrumbs = [
    { href: localePath(locale), label: t.nav.home },
    { href: localePath(locale, "/properties"), label: t.nav.properties },
    { href: `${localePath(locale, "/properties")}?city=${listing.city}`, label: t.cities[listing.city] },
  ];

  return (
    <article className={cn("pb-[calc(5.5rem+env(safe-area-inset-bottom))]", similar.length > 0 ? "lg:pb-0" : "lg:pb-20")}>
      <div className={cn(container, "pt-3 sm:pt-5")}>
        <nav aria-label={t.common.breadcrumb}>
          <ol className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[13px] text-slate-600">
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <Link href={crumb.href} className="inline-flex min-h-10 items-center hover:text-slate-900 hover:underline">
                  {crumb.label}
                </Link>
                <ChevronRightIcon className="size-3.5 text-slate-400" />
              </li>
            ))}
            <li aria-current="page" className="truncate font-medium text-slate-800">
              {title}
            </li>
          </ol>
        </nav>

        <div className="mt-1 sm:mt-2">
          <Gallery
            listing={listing}
            overlay={
              <>
                {listing.verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white py-1 ps-1.5 pe-2 text-[12px] font-bold text-brand-800 shadow-raise">
                    <ShieldCheckIcon className="size-3.5" strokeWidth={2.2} />
                    {t.common.verified}
                  </span>
                )}
                <StatusBadge status={listing.status} />
              </>
            }
            actions={
              <>
                <ShareButton variant="overlay" title={title} url={url} />
                <SaveButton listingId={listing.id} />
              </>
            }
          />
        </div>
      </div>

      <div className={cn(container, "mt-6 grid gap-10 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14")}>
        <div className="min-w-0">
          <header>
            <p className="text-[13px] font-semibold text-brand-700">{t.types[listing.type]}</p>
            <h1 className="mt-1 text-[24px] font-bold leading-snug tracking-[-0.01em] text-slate-900 sm:text-[30px]">{title}</h1>
            <p className="mt-1.5 flex items-start gap-1.5 text-[15px] text-slate-600">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-slate-500" />
              {listingLocation(listing, t, locale)}
            </p>
            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-[30px] font-extrabold leading-none tracking-[-0.015em] text-slate-900 sm:text-[34px]">
                {formatPrice(listing.price, t.units, locale)}
              </p>
              {unitRate && <p className="text-[15px] text-slate-600">{unitRate}</p>}
            </div>
          </header>

          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-slate-200 py-5 sm:flex sm:flex-wrap sm:gap-x-12">
            {keySpecs.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="size-6 text-slate-500" />
                <div>
                  <p className="text-[12px] text-slate-600">{label}</p>
                  <p className="text-[15px] font-bold text-slate-900">{value}</p>
                </div>
              </li>
            ))}
          </ul>

          <section className="mt-10" aria-labelledby="about-heading">
            <h2 id="about-heading" className={heading.block}>
              {t.detail.description}
            </h2>
            <p className="mt-3 max-w-[68ch] text-[16px] leading-[1.7] text-slate-700">{pick(listing.description, locale)}</p>
          </section>

          {listing.features.length > 0 && (
            <section className="mt-10" aria-labelledby="features-heading">
              <h2 id="features-heading" className={heading.block}>
                {t.detail.features}
              </h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {listing.features.map((f) => (
                  <li key={f.en} className="flex items-center gap-2.5 text-[15px] text-slate-800">
                    <CheckIcon className="size-[18px] shrink-0 text-brand-700" strokeWidth={2.4} />
                    {pick(f, locale)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-10" aria-labelledby="facts-heading">
            <h2 id="facts-heading" className={heading.block}>
              {t.detail.overview}
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 rounded-(--radius-card) bg-slate-50 p-5 sm:grid-cols-3">
              {facts.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[13px] text-slate-600">{label}</dt>
                  <dd className="mt-0.5 text-[15px] font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-10" aria-labelledby="map-heading">
            <h2 id="map-heading" className={heading.block}>
              {t.detail.map}
            </h2>
            <MapEmbed
              title={interpolate(t.detail.mapTitle, { title })}
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&hl=${locale}&output=embed`}
              className="mt-4 aspect-[16/10] sm:aspect-[16/7]"
            />
            <p className="mt-2 text-[13px] text-slate-600">{t.detail.approximate}</p>
          </section>

          <aside className="mt-10 rounded-(--radius-card) border border-amber-300/70 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-amber-950">
              <ShieldCheckIcon className="size-5 text-amber-800" />
              {t.detail.safetyTitle}
            </h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-amber-950/85">{t.detail.safetyBody}</p>
          </aside>
        </div>

        {/* Contact panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] rounded-(--radius-card) border border-slate-200 bg-white p-6 shadow-raise">
            <p className="text-[13px] text-slate-600">{t.detail.demand}</p>
            <p className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.015em] text-slate-900">
              {formatPrice(listing.price, t.units, locale)}
            </p>
            <p className="mt-2 text-[13px] text-slate-600">
              {t.detail.reference}{" "}
              <span dir="ltr" className="font-semibold text-slate-900">
                {listing.id}
              </span>
            </p>
            <div className="my-5 h-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <LogoMark tile className="size-14 border border-slate-200" />
              <div>
                <p className="text-[16px] font-bold text-slate-900">{SITE.name[locale]}</p>
                <p className="text-[13px] text-slate-600">{t.detail.advisorRole}</p>
              </div>
            </div>
            <p className="mt-5 text-[14px] leading-relaxed text-slate-700">{t.detail.askBody}</p>
            <div className="mt-5 space-y-2">
              <WhatsAppLink href={enquiryHref} source="detail-aside" listingRef={listing.id} className={cn(button.whatsapp, "h-12 w-full text-[15px]")}>
                <WhatsAppIcon className="size-5" />
                {t.common.enquireWhatsApp}
              </WhatsAppLink>
              <CallLink source="detail-aside" className={cn(button.outline, "h-12 w-full text-[15px]")}>
                <PhoneIcon className="size-5 text-brand-800" />
                <span dir="ltr">{SITE.phoneDisplay}</span>
              </CallLink>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-slate-200 bg-slate-50 py-14" aria-labelledby="similar-heading">
          <div className={container}>
            <div className="flex items-end justify-between gap-4">
              <h2 id="similar-heading" className={heading.section}>
                {t.detail.similar}
              </h2>
              <Link
                href={localePath(locale, "/properties")}
                className="shrink-0 text-[15px] font-semibold text-brand-800 underline-offset-4 hover:underline"
              >
                {t.detail.backToResults}
              </Link>
            </div>
            <PropertyGrid listings={similar} className="mt-7" />
          </div>
        </section>
      )}

      {/* Phone enquiry bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pb-safe pt-3 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-extrabold leading-tight text-slate-900">{formatPrice(listing.price, t.units, locale)}</p>
            <p dir="ltr" className="truncate text-[12px] text-slate-600 rtl:text-end">
              {listing.id}
            </p>
          </div>
          <CallLink source="detail-bar" aria-label={t.common.callAdvisor} className={cn(button.outline, "size-12 shrink-0")}>
            <PhoneIcon className="size-5 text-brand-800" />
          </CallLink>
          <WhatsAppLink href={enquiryHref} source="detail-bar" listingRef={listing.id} className={cn(button.whatsapp, "h-12 shrink-0 px-4 text-[15px]")}>
            <WhatsAppIcon className="size-5" />
            {t.common.whatsapp}
          </WhatsAppLink>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}
