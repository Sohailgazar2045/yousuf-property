import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/I18nProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DIRECTION, isLocale, LOCALES } from "@/lib/i18n";
import { LISTINGS } from "@/lib/listings";
import { SITE, SITE_URL } from "@/lib/site";
import "../globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const naskh = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-naskh", display: "swap", preload: false });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-nastaliq", display: "swap", preload: false });


export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#004D40",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.defaultTitle, template: `%s | ${t.meta.siteName}` },
    description: t.meta.description,
    applicationName: t.meta.siteName,
    formatDetection: { telephone: false },
    appleWebApp: { title: t.meta.siteName, statusBarStyle: "default" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const organization = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE.name[lang],
    url: `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}/brand/logo-512.png`,
    image: `${SITE_URL}/brand/logo-512.png`,
    telephone: `+${SITE.phoneNumber}`,
    ...(SITE.email ? { email: SITE.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.office.street,
      addressLocality: SITE.office.town,
      addressRegion: `${SITE.office.district}, ${SITE.office.region}`,
      addressCountry: SITE.office.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.office.lat, longitude: SITE.office.lng },
    hasMap: SITE.office.mapsUrl,
    areaServed: ["Multan", "Muzaffargarh", "Bahawalpur", "Lodhran", "Khanewal"],
  };

  return (
    <html
      lang={lang}
      dir={DIRECTION[lang]}
      className={`${manrope.variable} ${naskh.variable} ${nastaliq.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={lang} t={t}>
          <SiteHeader listingIds={LISTINGS.map((l) => l.id)} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter locale={lang} />
        </I18nProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
        />
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
