"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, WhatsAppIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { SelectField } from "@/components/ui/SelectField";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { EMPTY_FILTERS, SORT_KEYS, applyFilters, searchTitle, sortListings, toQueryString, type Filters, type SortKey } from "@/lib/filters";
import { localePath } from "@/lib/i18n";
import { LISTINGS } from "@/lib/listings";
import { button, container } from "@/lib/ui";
import { requirementLink } from "@/lib/whatsapp";
import { FilterBar } from "./FilterBar";
import { SearchBox } from "./SearchBox";

interface PropertySearchProps {
  initialFilters: Filters;
  initialSort: SortKey;
}

export function PropertySearch({ initialFilters, initialSort }: PropertySearchProps) {
  const { t, locale } = useI18n();
  const pathname = usePathname();

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);

  // Every navigation to this page (a footer city link, the breadcrumb, even the
  // same URL again) delivers a fresh props object from the server; adopt it.
  // Local edits never change the props, so they're left alone.
  const [syncedFrom, setSyncedFrom] = useState(initialFilters);
  if (initialFilters !== syncedFrom) {
    setSyncedFrom(initialFilters);
    setFilters(initialFilters);
    setSort(initialSort);
  }

  const results = useMemo(() => sortListings(applyFilters(LISTINGS, filters), sort), [filters, sort]);

  // Keep the address bar in step so any search can be bookmarked or shared on WhatsApp.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.history.replaceState(null, "", `${pathname}${toQueryString(filters, sort)}`);
  }, [filters, sort, pathname]);

  const applyNext = useCallback((next: Filters) => {
    setFilters(next);
    if (window.scrollY > 240) window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setQuery = useCallback((query: string) => setFilters((f) => (f.query === query ? f : { ...f, query })), []);

  const resultLabel = `${results.length} ${results.length === 1 ? t.common.propertyOne : t.common.propertyMany}`;
  const hasResults = results.length > 0;

  const sortControl = (
    <SelectField
      variant="compact"
      align="end"
      label={t.search.sortBy}
      value={sort}
      onChange={setSort}
      options={SORT_KEYS.map((key) => ({ value: key, label: t.search.sort[key] }))}
    />
  );

  return (
    <>
      <PageHeader
        breadcrumbLabel={t.common.breadcrumb}
        breadcrumb={[{ href: localePath(locale), label: t.nav.home }, { label: t.nav.properties }]}
        title={searchTitle(filters, t)}
        aside={<SearchBox value={filters.query} onChange={setQuery} />}
      />

      <div className="sticky top-(--header-h) z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className={cn(container, "flex items-center gap-4 py-3")}>
          {/* Scrolls sideways on narrow screens; the fade hints that there is more. */}
          <div className="no-scrollbar -mx-4 min-w-0 flex-1 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_88%,transparent)] sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:[mask-image:none] rtl:[mask-image:linear-gradient(to_left,black_88%,transparent)] rtl:lg:[mask-image:none]">
            <FilterBar filters={filters} onFiltersChange={applyNext} />
          </div>
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <p className="text-[14px] font-semibold text-slate-700" aria-live="polite">
              {resultLabel}
            </p>
            {hasResults && sortControl}
          </div>
        </div>
      </div>

      <div className={cn(container, hasResults ? "pb-[calc(6rem+env(safe-area-inset-bottom))]" : "pb-16", "pt-5 lg:pb-20 lg:pt-8")}>
        <div className="mb-5 flex min-h-11 items-center justify-between gap-4 lg:hidden">
          <p className="text-[15px] font-semibold text-slate-800" aria-live="polite">
            {resultLabel}
          </p>
          {hasResults && sortControl}
        </div>

        {hasResults ? (
          <>
            <h2 className="sr-only">{resultLabel}</h2>
            <PropertyGrid key={toQueryString(filters, sort)} listings={results} aboveFold={2} animate />
          </>
        ) : (
          <div className="rounded-(--radius-card) border border-slate-200 px-6 py-14 text-center">
            <SearchIcon className="mx-auto size-8 text-slate-400" />
            <h2 className="mt-4 text-[18px] font-bold text-slate-900">{t.search.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">{t.search.emptyBody}</p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={cn(button.outline, "h-12 px-5 text-[14px]")}>
                {t.search.resetFilters}
              </button>
              <WhatsAppLink href={requirementLink(filters, t)} source="search-empty" className={cn(button.whatsapp, "h-12 px-5 text-[14px]")}>
                <WhatsAppIcon className="size-[18px]" />
                {t.search.sendRequirement}
              </WhatsAppLink>
            </div>
          </div>
        )}

        {hasResults && (
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-(--radius-card) bg-brand-50 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-[16px] font-bold text-brand-950">{t.home.ctaTitle}</p>
              <p className="mt-0.5 text-[14px] text-brand-900">{t.home.ctaBody}</p>
            </div>
            <WhatsAppLink href={requirementLink(filters, t)} source="search-footer" className={cn(button.whatsapp, "h-12 shrink-0 px-5 text-[14px]")}>
              <WhatsAppIcon className="size-[18px]" />
              {t.search.sendRequirement}
            </WhatsAppLink>
          </div>
        )}

        <p className="mt-6 text-[13px] leading-relaxed text-slate-600">{t.search.disclaimer}</p>
      </div>

      {/* Thumb-reach conversion bar on phones and tablets (the empty state has its own button). */}
      {hasResults && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pb-safe pt-3 lg:hidden">
          <div className="mx-auto max-w-xl">
            <WhatsAppLink href={requirementLink(filters, t)} source="search-bar" className={cn(button.whatsapp, "h-12 w-full text-[15px]")}>
              <WhatsAppIcon className="size-5" />
              {t.search.sendRequirement}
            </WhatsAppLink>
          </div>
        </div>
      )}
    </>
  );
}
