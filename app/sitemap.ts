import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { LISTINGS } from "@/lib/listings";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = ["", "/properties", "/about", "/contact"];

function entry(path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]));
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const newest = LISTINGS.reduce((max, l) => (l.listedOn > max ? l.listedOn : max), "1970-01-01");
  const siteUpdated = new Date(newest);

  return [
    ...STATIC_PATHS.flatMap((path) => entry(path, siteUpdated, path === "" ? 1 : 0.8)),
    ...LISTINGS.flatMap((l) => entry(`/properties/${l.slug}`, new Date(l.listedOn), 0.7)),
  ];
}
