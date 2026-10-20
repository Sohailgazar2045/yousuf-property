import type { Dictionary } from "@/dictionaries/en";
import { areaInMarla, formatLac, LAC } from "./format";
import { interpolate } from "./i18n";
import { CITY_KEYS, TYPE_KEYS, type CityKey, type TypeKey } from "./keys";
import type { Listing } from "./listings";

/** Where the slider rail ends. Typed values can go past it. */
export const BUDGET_CEILING_LAC = 1500;
export const BUDGET_STEP_LAC = 5;
export const BUDGET_MAX_INPUT_LAC = 99_999;

/** Size bands in Marla (20 Marla = 1 Kanal). Each band is (min, max]. */
export const AREA_BANDS = [
  { key: "upto5m", min: 0, max: 5 },
  { key: "5to10m", min: 5, max: 10 },
  { key: "10mto1k", min: 10, max: 20 },
  { key: "1to4k", min: 20, max: 80 },
  { key: "4kplus", min: 80, max: Infinity },
] as const;
export type AreaBand = (typeof AREA_BANDS)[number]["key"];

export const BED_OPTIONS = [1, 2, 3, 4, 5] as const;

export interface Filters {
  /** Empty means all of South Punjab. */
  cities: CityKey[];
  /** Empty means every type. */
  types: TypeKey[];
  minLac: number;
  maxLac: number;
  noLimit: boolean;
  /** Size band, or null for any size. */
  area: AreaBand | null;
  /** Minimum bedrooms; 0 means any (and keeps plots and land in the results). */
  beds: number;
  /** Free-text search over society, block, title and reference. */
  query: string;
}

export const EMPTY_FILTERS: Filters = {
  cities: [],
  types: [],
  minLac: 0,
  maxLac: 500,
  noLimit: true,
  area: null,
  beds: 0,
  query: "",
};

export const SORT_KEYS = ["recent", "price-asc", "price-desc", "size-desc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

function normalise(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[ً-ٟ]/g, "").replace(/\s+/g, " ").trim();
}

/** Every word of the query must appear somewhere in the listing's searchable text (either language). */
function matchesQuery(l: Listing, query: string) {
  const words = normalise(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalise(
    [l.id, l.title.en, l.title.ur, l.society.en, l.society.ur, l.block.en, l.block.ur, l.city].join(" "),
  );
  return words.every((w) => haystack.includes(w));
}

export function applyFilters(listings: Listing[], f: Filters) {
  const lo = (f.noLimit ? f.minLac : Math.min(f.minLac, f.maxLac)) * LAC;
  const hi = f.noLimit ? Infinity : Math.max(f.minLac, f.maxLac) * LAC;
  const band = f.area ? AREA_BANDS.find((b) => b.key === f.area) : undefined;

  return listings.filter((l) => {
    if (f.cities.length && !f.cities.includes(l.city)) return false;
    if (f.types.length && !f.types.includes(l.type)) return false;
    if (l.price < lo || l.price > hi) return false;
    if (band) {
      const marla = areaInMarla(l);
      if (marla <= band.min || marla > band.max) return false;
    }
    if (f.beds > 0 && (l.beds ?? 0) < f.beds) return false;
    if (f.query && !matchesQuery(l, f.query)) return false;
    return true;
  });
}

export function sortListings(listings: Listing[], key: SortKey) {
  const sorted = [...listings];
  if (key === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (key === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (key === "size-desc") sorted.sort((a, b) => areaInMarla(b) - areaInMarla(a));
  else sorted.sort((a, b) => b.listedOn.localeCompare(a.listedOn));
  // Sold stock stays visible as proof of activity, but never ahead of live listings.
  return sorted.sort((a, b) => Number(a.status === "sold") - Number(b.status === "sold"));
}

export function isBudgetActive(f: Filters) {
  return f.minLac > 0 || !f.noLimit;
}

export function activeFilterCount(f: Filters) {
  return (
    f.cities.length +
    f.types.length +
    (isBudgetActive(f) ? 1 : 0) +
    (f.area ? 1 : 0) +
    (f.beds > 0 ? 1 : 0) +
    (f.query.trim() ? 1 : 0)
  );
}

/* ---------- URL <-> filters ---------- */

type SearchParamsLike = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseLac(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), BUDGET_MAX_INPUT_LAC) : undefined;
}

export function parseSearchParams(params: SearchParamsLike): { filters: Filters; sort: SortKey } {
  const list = (key: string) => (first(params[key]) ?? "").split(",").filter(Boolean);
  const max = parseLac(first(params.max));
  const sortParam = first(params.sort);
  const areaParam = first(params.area);
  const beds = Number(first(params.beds));

  return {
    filters: {
      cities: list("city").filter((c): c is CityKey => (CITY_KEYS as readonly string[]).includes(c)),
      types: list("type").filter((t): t is TypeKey => (TYPE_KEYS as readonly string[]).includes(t)),
      minLac: parseLac(first(params.min)) ?? 0,
      maxLac: max ?? EMPTY_FILTERS.maxLac,
      noLimit: max === undefined,
      area: AREA_BANDS.some((b) => b.key === areaParam) ? (areaParam as AreaBand) : null,
      beds: (BED_OPTIONS as readonly number[]).includes(beds) ? beds : 0,
      query: (first(params.q) ?? "").slice(0, 80),
    },
    sort: (SORT_KEYS as readonly string[]).includes(sortParam ?? "") ? (sortParam as SortKey) : "recent",
  };
}

export function toQueryString(f: Filters, sort: SortKey = "recent") {
  const params = new URLSearchParams();
  if (f.query.trim()) params.set("q", f.query.trim());
  if (f.cities.length) params.set("city", f.cities.join(","));
  if (f.types.length) params.set("type", f.types.join(","));
  if (f.minLac > 0) params.set("min", String(f.minLac));
  if (!f.noLimit) params.set("max", String(f.maxLac));
  if (f.area) params.set("area", f.area);
  if (f.beds > 0) params.set("beds", String(f.beds));
  if (sort !== "recent") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/* ---------- Human summaries ---------- */

export function summariseCities(cities: CityKey[], t: Dictionary) {
  if (cities.length === 0 || cities.length === CITY_KEYS.length) return t.search.allSouthPunjab;
  const names = cities.map((c) => t.cities[c]);
  if (names.length <= 2) return names.join(t.common.listSeparator);
  return `${names[0]}${t.common.listSeparator}${names[1]} +${names.length - 2}`;
}

export function summariseBudget(f: Filters, t: Dictionary) {
  const hasMin = f.minLac > 0;
  if (f.noLimit) return hasMin ? interpolate(t.search.andAbove, { amount: formatLac(f.minLac, t.units) }) : t.search.anyBudget;
  if (!hasMin) return interpolate(t.search.under, { amount: formatLac(f.maxLac, t.units) });
  return `${formatLac(f.minLac, t.units)} – ${formatLac(f.maxLac, t.units)}`;
}

/** "Houses for sale in Multan", "Properties for sale in South Punjab", "ملتان میں برائے فروخت مکانات". */
export function searchTitle(f: Filters, t: Dictionary) {
  const what = f.types.length === 1 ? t.typesPlural[f.types[0]] : t.search.whatAll;
  const where =
    f.cities.length === 0 || f.cities.length === CITY_KEYS.length
      ? t.search.whereAll
      : f.cities.map((c) => t.cities[c]).join(t.common.listSeparator);
  return interpolate(t.search.titleTemplate, { what, where });
}
