import type { Dictionary } from "@/dictionaries/en";
import { formatArea, formatPrice } from "./format";
import { summariseBudget, type Filters } from "./filters";
import { interpolate, pick, type Locale } from "./i18n";
import type { Listing } from "./listings";
import { SITE, SITE_URL } from "./site";

export function whatsAppLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function listingUrl(listing: Listing, locale: Locale) {
  return `${SITE_URL}/${locale}/properties/${listing.slug}`;
}

export function listingLocation(listing: Listing, t: Dictionary, locale: Locale) {
  return [pick(listing.society, locale), pick(listing.block, locale), t.cities[listing.city]].join(
    t.common.listSeparator,
  );
}

export function listingEnquiryLink(listing: Listing, t: Dictionary, locale: Locale) {
  return whatsAppLink(
    interpolate(t.whatsapp.listing, {
      title: pick(listing.title, locale),
      location: listingLocation(listing, t, locale),
      size: formatArea(listing, t.units),
      price: formatPrice(listing.price, t.units, locale),
      ref: listing.id,
      url: listingUrl(listing, locale),
    }),
  );
}

export function requirementLink(f: Filters, t: Dictionary) {
  return whatsAppLink(
    interpolate(t.whatsapp.requirement, {
      cities: f.cities.length ? f.cities.map((c) => t.cities[c]).join(t.common.listSeparator) : t.whatsapp.anywhere,
      types: f.types.length ? f.types.map((ty) => t.types[ty]).join(t.common.listSeparator) : t.whatsapp.anyType,
      budget: summariseBudget(f, t),
    }),
  );
}

export function shortlistLink(listings: Listing[], t: Dictionary, locale: Locale) {
  const items = listings
    .map((l, i) => `${i + 1}. ${pick(l.title, locale)} (${formatPrice(l.price, t.units, locale)})\n   ${t.common.ref}: ${l.id}`)
    .join("\n");
  return whatsAppLink(interpolate(t.whatsapp.shortlist, { items }));
}

export function generalLink(t: Dictionary) {
  return whatsAppLink(t.whatsapp.general);
}
