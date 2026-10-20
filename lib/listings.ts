import raw from "@/data/listings.json";
import type { Localized } from "./i18n/config";
import { CAPTION_KEYS, CITY_KEYS, STATUS_KEYS, TYPE_KEYS, type CaptionKey, type CityKey, type ListingStatus, type TypeKey } from "./keys";

export { CAPTION_KEYS, CITY_KEYS, STATUS_KEYS, TYPE_KEYS };
export type { CaptionKey, CityKey, ListingStatus, TypeKey };

export type AreaUnit = "marla" | "kanal";

export interface ListingPhoto {
  caption: CaptionKey;
  /** Path under /public (e.g. "/listings/ypa-mln-1042/1.jpg"). Omit to show the placeholder. */
  src?: string;
}

export interface Listing {
  id: string;
  slug: string;
  type: TypeKey;
  status: ListingStatus;
  /** Demand in PKR. */
  price: number;
  area: { value: number; unit: AreaUnit };
  city: CityKey;
  society: Localized;
  block: Localized;
  coordinates: { lat: number; lng: number };
  beds?: number;
  baths?: number;
  title: Localized;
  description: Localized;
  features: Localized[];
  verified: boolean;
  featured: boolean;
  /** ISO date, YYYY-MM-DD. */
  listedOn: string;
  photos: ListingPhoto[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/*
  data/listings.json is edited by hand, so check it properly. A broken entry
  fails the build with a message pointing at the exact listing, instead of a
  half-rendered page in production.
*/
function parseListings(input: unknown): Listing[] {
  if (!Array.isArray(input)) throw new Error("data/listings.json must be an array of listings.");

  const seen = new Set<string>();

  return input.map((item, index) => {
    const where = `data/listings.json → item ${index + 1}${item?.id ? ` (${item.id})` : ""}`;
    const fail = (problem: string): never => {
      throw new Error(`${where}: ${problem}`);
    };
    const isLocalized = (v: unknown): v is Localized =>
      typeof v === "object" && v !== null && typeof (v as Localized).en === "string" && typeof (v as Localized).ur === "string";

    if (typeof item !== "object" || item === null) fail("must be an object");
    if (typeof item.id !== "string" || !/^[A-Z0-9-]+$/.test(item.id)) fail('"id" must look like "YPA-MLN-1042"');
    if (seen.has(item.id)) fail(`duplicate id "${item.id}"`);
    seen.add(item.id);

    if (!TYPE_KEYS.includes(item.type)) fail(`"type" must be one of ${TYPE_KEYS.join(", ")}`);
    if (!STATUS_KEYS.includes(item.status)) fail(`"status" must be one of ${STATUS_KEYS.join(", ")}`);
    if (!CITY_KEYS.includes(item.city)) fail(`"city" must be one of ${CITY_KEYS.join(", ")}`);
    if (typeof item.price !== "number" || item.price <= 0) fail('"price" must be a positive number in PKR');
    if (typeof item.area?.value !== "number" || item.area.value <= 0 || !["marla", "kanal"].includes(item.area?.unit))
      fail('"area" must be { "value": number, "unit": "marla" | "kanal" }');
    if (typeof item.coordinates?.lat !== "number" || typeof item.coordinates?.lng !== "number")
      fail('"coordinates" must be { "lat": number, "lng": number }');
    for (const field of ["title", "description", "society", "block"] as const) {
      if (!isLocalized(item[field])) fail(`"${field}" must have both "en" and "ur" text`);
    }
    if (!Array.isArray(item.features) || !item.features.every(isLocalized))
      fail('"features" must be a list of { "en", "ur" } items');
    for (const field of ["beds", "baths"] as const) {
      if (item[field] !== undefined && (!Number.isInteger(item[field]) || item[field] < 0 || item[field] > 50))
        fail(`"${field}" must be a whole number (or left out for plots and land)`);
    }
    if (typeof item.verified !== "boolean") fail('"verified" must be true or false');
    if (typeof item.featured !== "boolean") fail('"featured" must be true or false');
    if (typeof item.listedOn !== "string" || Number.isNaN(Date.parse(item.listedOn)))
      fail('"listedOn" must be a date like "2026-10-18"');
    if (!Array.isArray(item.photos) || item.photos.length === 0) fail('"photos" needs at least one entry');
    for (const photo of item.photos) {
      if (!(CAPTION_KEYS as readonly string[]).includes(photo?.caption))
        fail(`photo caption "${photo?.caption}" is not defined in dictionaries (captions)`);
      if (photo.src !== undefined && (typeof photo.src !== "string" || !photo.src.startsWith("/")))
        fail('photo "src" must be a path starting with "/", e.g. "/listings/ypa-mln-1042/1.jpg"');
    }

    return { ...item, slug: `${item.id.toLowerCase()}-${slugify(item.title.en)}` } as Listing;
  });
}

export const LISTINGS: Listing[] = parseListings(raw);

export function getListingBySlug(slug: string) {
  return LISTINGS.find((l) => l.slug === slug);
}

export function getListingsByIds(ids: string[]) {
  return ids.map((id) => LISTINGS.find((l) => l.id === id)).filter((l): l is Listing => Boolean(l));
}

export function getFeaturedListings(limit = 6) {
  return LISTINGS.filter((l) => l.featured && l.status !== "sold").slice(0, limit);
}

/** Same type in any city first, then anything else in the same city. */
export function getSimilarListings(listing: Listing, limit = 3) {
  const others = LISTINGS.filter((l) => l.id !== listing.id && l.status !== "sold");
  const score = (l: Listing) => (l.type === listing.type ? 2 : 0) + (l.city === listing.city ? 1 : 0);
  return others
    .map((l) => ({ l, s: score(l) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || Math.abs(a.l.price - listing.price) - Math.abs(b.l.price - listing.price))
    .slice(0, limit)
    .map(({ l }) => l);
}

export function countBy<K extends string>(key: (l: Listing) => K) {
  const counts = {} as Partial<Record<K, number>>;
  for (const l of LISTINGS) counts[key(l)] = (counts[key(l)] ?? 0) + 1;
  return counts;
}
