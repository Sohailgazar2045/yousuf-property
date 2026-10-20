import en, { type Dictionary } from "@/dictionaries/en";
import ur from "@/dictionaries/ur";
import type { Locale } from "./config";

export type { Dictionary };

/*
  Server-side access to the full dictionaries. Client components get the active
  locale's dictionary through <I18nProvider>, so neither dictionary is bundled
  into client JavaScript via the shared i18n helpers.
*/
const DICTIONARIES: Record<Locale, Dictionary> = { en, ur };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
