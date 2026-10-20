import type { Metadata } from "next";
import { getDictionary } from "./i18n/dictionaries";
import { LOCALES, OG_LOCALE, type Locale } from "./i18n";
import { SITE_URL } from "./site";

interface PageMetaInput {
  locale: Locale;
  /** Path after the locale, starting with "/" (use "" for the home page). */
  path: string;
  title?: string;
  description?: string;
  /** Use the title as-is instead of appending the site name. */
  absoluteTitle?: boolean;
  /** Set when the route has its own opengraph-image (listing pages), so it isn’t overridden. */
  ownImage?: boolean;
}

export function pageMetadata({ locale, path, title, description, absoluteTitle, ownImage }: PageMetaInput): Metadata {
  const t = getDictionary(locale);
  const url = `${SITE_URL}/${locale}${path}`;
  const resolvedTitle = title ?? t.meta.defaultTitle;
  const resolvedDescription = description ?? t.meta.description;
  // A page-level openGraph object replaces the parent’s, which would drop the site image; set it explicitly.
  const images = ownImage ? undefined : [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: t.meta.ogAlt }];

  return {
    title: absoluteTitle || !title ? { absolute: resolvedTitle } : resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])),
        "x-default": `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: t.meta.siteName,
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(images && { images }),
    },
  };
}
