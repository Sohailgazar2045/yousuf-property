import type { Metadata } from "next";
import { PropertySearch } from "@/components/search/PropertySearch";
import { parseSearchParams } from "@/lib/filters";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/properties">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/properties", title: t.search.metaTitle, description: t.search.metaDescription });
}

export default async function PropertiesPage({ searchParams }: PageProps<"/[lang]/properties">) {
  const { filters, sort } = parseSearchParams(await searchParams);
  return <PropertySearch initialFilters={filters} initialSort={sort} />;
}
