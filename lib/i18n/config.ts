export const LOCALES = ["en", "ur"] as const;
export type Locale = (typeof LOCALES)[number];

/** A string in every supported language. */
export type Localized = Record<Locale, string>;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const DIRECTION: Record<Locale, "ltr" | "rtl"> = { en: "ltr", ur: "rtl" };

/** Urdu keeps Western digits, which is what people in Pakistan actually type. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-PK", ur: "ur-PK-u-nu-latn" };

export const OG_LOCALE: Record<Locale, string> = { en: "en_PK", ur: "ur_PK" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "ur" : "en";
}
