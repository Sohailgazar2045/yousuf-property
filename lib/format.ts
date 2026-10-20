import type { Dictionary } from "@/dictionaries/en";
import type { Locale } from "./i18n/config";
import type { Listing } from "./listings";

type Units = Dictionary["units"];

export const LAC = 100_000;
export const CRORE = 10_000_000;

const MARLA_PER_KANAL = 20;
const KANAL_PER_ACRE = 8;

function trim(value: number, decimals: number) {
  return Number(value.toFixed(decimals)).toString();
}

/** 4_500_000 → "45 Lac", 32_000_000 → "3.2 Crore" (or لاکھ / کروڑ). */
export function formatPKR(amount: number, units: Units, decimals = 2) {
  if (amount >= CRORE) return `${trim(amount / CRORE, decimals)} ${units.crore}`;
  if (amount >= LAC) return `${trim(amount / LAC, decimals)} ${units.lac}`;
  return new Intl.NumberFormat("en-IN").format(amount);
}

/** With currency, placed the way each language reads it: "PKR 3.2 Crore" / "3.2 کروڑ روپے". */
export function formatPrice(amount: number, units: Units, locale: Locale) {
  const value = formatPKR(amount, units);
  return locale === "ur" ? `${value} ${units.currency}` : `${units.currency} ${value}`;
}

/** Full figure with South Asian grouping: Rs 45,00,000. */
export function formatRupees(amount: number, units: Units, locale: Locale) {
  const value = new Intl.NumberFormat("en-IN").format(amount);
  return locale === "ur" ? `${value} ${units.rupees}` : `${units.rupees} ${value}`;
}

export function formatLac(lac: number, units: Units) {
  return lac === 0 ? "0" : formatPKR(lac * LAC, units);
}

function toKanal(area: Listing["area"]) {
  return area.unit === "kanal" ? area.value : area.value / MARLA_PER_KANAL;
}

/** Size in Marla, for filtering and sorting across units. */
export function areaInMarla(listing: Pick<Listing, "area">) {
  return toKanal(listing.area) * MARLA_PER_KANAL;
}

export function formatArea(listing: Listing, units: Units) {
  const base = `${listing.area.value} ${units[listing.area.unit]}`;
  if (listing.type !== "agriculture-land") return base;
  return `${base} · ${trim(toKanal(listing.area) / KANAL_PER_ACRE, 1)} ${units.acre}`;
}

/** Plots and land trade on rate rather than lump sum, so surface it. */
export function formatUnitRate(listing: Listing, units: Units): string | null {
  if (listing.type === "agriculture-land") {
    const acres = toKanal(listing.area) / KANAL_PER_ACRE;
    return `${formatPKR(listing.price / acres, units, 1)} / ${units.acre}`;
  }
  if (listing.type === "residential-plot" || listing.type === "commercial") {
    const marla = toKanal(listing.area) * MARLA_PER_KANAL;
    return `${formatPKR(listing.price / marla, units, 1)} / ${units.marla}`;
  }
  return null;
}

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ur: ["جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون", "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"],
};

/**
 * "18 Oct 2026" / "18 اکتوبر 2026". Formatted by hand: ICU data differs between
 * Node and browsers (e.g. "Sep" vs "Sept"), which would cause hydration mismatches
 * and inconsistent cards.
 */
export function formatDate(iso: string, locale: Locale) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[locale][month - 1]} ${year}`;
}
