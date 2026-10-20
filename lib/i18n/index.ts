import type { Locale, Localized } from "./config";

export type { Dictionary } from "@/dictionaries/en";
export * from "./config";

export function pick(value: Localized, locale: Locale) {
  return value[locale] || value.en;
}

/** "Show {n} properties" + { n: 4 } → "Show 4 properties". */
export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : interpolate(many, { n });
}

export function localePath(locale: Locale, path = "") {
  return `/${locale}${path === "/" ? "" : path}`;
}
