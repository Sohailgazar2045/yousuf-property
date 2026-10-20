import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localePath, plural, type Locale } from "@/lib/i18n";
import { CITY_KEYS, countBy } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";
import { button, container, heading } from "@/lib/ui";
import { generalLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/about", title: t.about.metaTitle, description: t.about.metaDescription });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = getDictionary(locale);
  const byCity = countBy((l) => l.city);
  const [lead, ...rest] = t.about.intro;

  return (
    <>
      <section className="relative isolate -mt-(--header-h) overflow-hidden">
        <Image src="/images/hero/about.jpg" alt="" fill preload fetchPriority="high" quality={75} sizes="100vw" className="hero-image -z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-slate-950/25" />
        <div className={cn(container, "flex min-h-[400px] flex-col justify-end pb-10 pt-32 sm:min-h-[460px]")}>
          <p className="text-[15px] font-semibold text-white/85">{t.about.eyebrow}</p>
          <h1
            className={cn(
              "mt-2 max-w-3xl text-[2rem] font-extrabold text-white sm:text-[2.75rem]",
              locale === "ur" ? "font-nastaliq !font-bold !leading-[1.85]" : "leading-[1.1] tracking-[-0.02em]",
            )}
          >
            {t.about.title}
          </h1>
        </div>
      </section>

      <section className={cn(container, "grid gap-8 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20")}>
        <p className="text-[20px] font-semibold leading-relaxed text-slate-900 sm:text-[22px]">{lead}</p>
        <div className="space-y-4 text-[16px] leading-[1.7] text-slate-700">
          {rest.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14 lg:py-20">
        <div className={container}>
          <h2 className={heading.section}>{t.about.valuesTitle}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {t.about.values.map((value) => (
              <div key={value.title} className="border-t-2 border-brand-800 pt-5">
                <h3 className="text-[17px] font-bold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn(container, "grid gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20")}>
        <div>
          <h2 className={heading.section}>{t.about.areasTitle}</h2>
          <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {CITY_KEYS.map((city) => (
              <li key={city}>
                <Link
                  href={`${localePath(locale, "/properties")}?city=${city}`}
                  className="flex h-14 items-center justify-between gap-4 px-1 transition-colors hover:bg-slate-50"
                >
                  <span className="text-[16px] font-semibold text-slate-900">{t.cities[city]}</span>
                  <span className="flex items-center gap-2 text-[14px] text-slate-600">
                    {plural(byCity[city] ?? 0, t.home.listingsOne, t.home.listingsMany)}
                    <ChevronRightIcon className="size-4 text-slate-400" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center rounded-(--radius-card) bg-brand-800 p-7 text-white sm:p-9">
          <h2 className="text-[22px] font-bold leading-snug sm:text-[26px]">{t.about.ctaTitle}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-brand-100">{t.about.ctaBody}</p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <WhatsAppLink href={generalLink(t)} source="about-cta" className={cn(button.whatsapp, "h-12 px-5 text-[15px]")}>
              <WhatsAppIcon className="size-5" />
              {t.about.ctaButton}
            </WhatsAppLink>
            <CallLink source="about-cta" className={cn(button.onDark, "h-12 px-5 text-[15px]")}>
              <PhoneIcon className="size-5" />
              {t.common.call}
            </CallLink>
          </div>
        </div>
      </section>
    </>
  );
}
