import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import {
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { TYPE_ICONS } from "@/components/property/typeIcons";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localePath, plural, type Locale } from "@/lib/i18n";
import { CITY_KEYS, countBy, getFeaturedListings, LISTINGS, TYPE_KEYS } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { button, container, heading } from "@/lib/ui";
import { generalLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "", title: t.home.metaTitle, absoluteTitle: true });
}

const TRUST_ICONS = [ShieldCheckIcon, MapPinIcon, WhatsAppIcon];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = getDictionary(locale);

  const byCity = countBy((l) => l.city);
  const byType = countBy((l) => l.type);
  const featured = getFeaturedListings(6);
  const propertiesHref = localePath(locale, "/properties");

  return (
    <>
      {/* Hero */}
      <section className="relative isolate -mt-(--header-h) overflow-hidden">
        <Image
          src="/images/hero/home.jpg"
          alt=""
          fill
          preload
          fetchPriority="high"
          quality={85}
          sizes="100vw"
          className="hero-image -z-10 object-cover"
        />
        {/* Two layers: a floor for the search bar, and on wide screens a side shade behind the headline so the photo stays bright on the right. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-slate-950/15 lg:via-slate-950/10 lg:to-transparent" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-slate-950/70 via-slate-950/25 to-transparent lg:block rtl:bg-gradient-to-l" />
        <div className={cn(container, "flex min-h-[560px] flex-col justify-end pb-8 pt-28 sm:min-h-[600px] lg:min-h-[640px] lg:pb-12")}>
          <h1
            className={cn(
              "max-w-3xl text-[2.25rem] font-extrabold text-white sm:text-5xl lg:text-[3.5rem]",
              locale === "ur" ? "font-nastaliq !font-bold !leading-[1.85]" : "leading-[1.06] tracking-[-0.025em]",
            )}
          >
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/90 sm:text-[18px]">{t.home.heroBody}</p>
          <div className="mt-8">
            <HeroSearch cityCounts={byCity} typeCounts={byType} total={LISTINGS.length} />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200">
        <ul className={cn(container, "grid gap-5 py-7 sm:grid-cols-3 sm:gap-8")}>
          {t.home.trust.map((item, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <li key={item.title} className="flex gap-3.5">
                <Icon className="mt-0.5 size-6 shrink-0 text-brand-800" />
                <div>
                  <p className="text-[15px] font-bold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className={cn(container, "py-14 lg:py-20")}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className={heading.section}>{t.home.featuredTitle}</h2>
              <p className="mt-1 text-[15px] text-slate-600">{t.home.featuredBody}</p>
            </div>
            <Link
              href={propertiesHref}
              className="hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-brand-800 underline-offset-4 hover:underline sm:inline-flex"
            >
              {t.common.viewAll}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <PropertyGrid listings={featured} className="mt-7" />
          <Link href={propertiesHref} className={cn(button.outline, "mt-6 h-12 w-full text-[15px] sm:hidden")}>
            {t.common.viewAll}
          </Link>
        </section>
      )}

      {/* Cities */}
      <section className="bg-slate-50 py-14 lg:py-20">
        <div className={container}>
          <h2 className={heading.section}>{t.home.byCityTitle}</h2>
          <p className="mt-1 text-[15px] text-slate-600">{t.home.byCityBody}</p>
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
            {CITY_KEYS.map((city, i) => (
              <li key={city} className={cn(i === 0 && "col-span-2 lg:row-span-2")}>
                <Link
                  href={`${propertiesHref}?city=${city}`}
                  className={cn(
                    "group relative block h-full overflow-hidden rounded-(--radius-card) bg-slate-200",
                    i === 0 ? "aspect-[16/10] lg:aspect-auto" : "aspect-[4/3]",
                  )}
                >
                  <Image
                    src={`/images/cities/${city}.jpg`}
                    alt=""
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    quality={85}
                    className="object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 via-45% to-transparent transition-colors group-hover:bg-slate-950/15" />
                  <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 text-white">
                    <span>
                      <span className={cn("block font-bold", i === 0 ? "text-[24px]" : "text-[18px]")}>{t.cities[city]}</span>
                      <span className="text-[13px] text-white/85">
                        {plural(byCity[city] ?? 0, t.home.listingsOne, t.home.listingsMany)}
                      </span>
                    </span>
                    <ArrowRightIcon className="mb-1 size-5 shrink-0 opacity-80" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Property types: a compact index, not a feature grid */}
      <section className={cn(container, "py-14 lg:py-20")}>
        <h2 className={heading.section}>{t.home.byTypeTitle}</h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {TYPE_KEYS.map((type) => {
            const Icon = TYPE_ICONS[type];
            return (
              <li key={type}>
                <Link
                  href={`${propertiesHref}?type=${type}`}
                  className="inline-flex h-14 items-center gap-3 rounded-full border border-slate-300 bg-white ps-4 pe-5 transition-colors hover:border-brand-800 hover:bg-brand-50"
                >
                  <Icon className="size-6 text-brand-800" />
                  <span className="text-[15px] font-semibold text-slate-900">{t.types[type]}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-bold tabular-nums text-slate-700">
                    {byType[type] ?? 0}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Advisor */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className={cn(container, "grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-card) bg-slate-200">
            <Image src="/listings/ypa-mln-1057/2.jpg" alt="" fill quality={85} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className={heading.section}>{t.home.whyTitle}</h2>
            <ul className="mt-6 space-y-5">
              {t.home.why.map((item) => (
                <li key={item.title} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-800 text-white">
                    <CheckIcon className="size-3.5" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-[16px] font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 max-w-prose text-[15px] leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <WhatsAppLink href={generalLink(t)} source="home-advisor" className={cn(button.whatsapp, "h-12 px-5 text-[15px]")}>
                <WhatsAppIcon className="size-5" />
                {t.nav.talkToAdvisor}
              </WhatsAppLink>
              <CallLink source="home-advisor" className={cn(button.outline, "h-12 px-5 text-[15px]")}>
                <PhoneIcon className="size-5 text-brand-800" />
                {t.common.call}
              </CallLink>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
