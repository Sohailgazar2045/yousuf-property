import site from "@/data/site.json";
import type { Localized } from "./i18n";

export interface SiteInfo {
  name: Localized;
  /** International format without "+", e.g. 923001234567. */
  whatsappNumber: string;
  phoneNumber: string;
  phoneDisplay: string;
  email: string;
  address: Localized;
  /** Town and district, for compact spots like the header bar. */
  addressShort: Localized;
  office: {
    street: string;
    town: string;
    district: string;
    region: string;
    country: string;
    lat: number;
    lng: number;
    /** The business's Google Maps listing, used for "Get directions". */
    mapsUrl: string;
  };
  hours: Localized;
  social: Partial<Record<"facebook" | "instagram" | "youtube" | "tiktok", string>>;
}

function parseSite(input: typeof site): SiteInfo {
  for (const key of ["whatsappNumber", "phoneNumber"] as const) {
    if (!/^92\d{10}$/.test(input[key])) {
      throw new Error(`data/site.json: "${key}" must be a Pakistani number like 923001234567 (no + or spaces).`);
    }
  }
  return input;
}

export const SITE = parseSite(site);

/*
  Absolute origin for canonical URLs, the sitemap and links inside WhatsApp
  messages. Only NEXT_PUBLIC_ variables are read, so server and browser always
  agree. A Vercel deployment that can't resolve its URL fails the build instead
  of quietly publishing localhost links.
*/
const resolvedUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : "");

if (!resolvedUrl && process.env.VERCEL) {
  throw new Error("Set NEXT_PUBLIC_SITE_URL (e.g. https://www.example.com) in the Vercel project settings.");
}

export const SITE_URL = (resolvedUrl || "http://localhost:3000").replace(/\/+$/, "");

export const TEL_HREF = `tel:+${SITE.phoneNumber}`;

/** Embeddable map centred on the office pin. */
export function officeMapEmbed(locale: string) {
  return `https://maps.google.com/maps?q=${SITE.office.lat},${SITE.office.lng}&z=16&hl=${locale}&output=embed`;
}

export const SOCIAL_LINKS = Object.entries(SITE.social).filter(([, url]) => Boolean(url)) as Array<
  [keyof SiteInfo["social"], string]
>;
