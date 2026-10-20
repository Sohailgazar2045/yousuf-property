"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { TYPE_ICONS } from "@/components/property/typeIcons";
import { OptionList } from "@/components/ui/OptionList";
import { Popover } from "@/components/ui/Popover";
import { cn } from "@/lib/cn";
import {
  AREA_BANDS,
  BED_OPTIONS,
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
  isBudgetActive,
  summariseBudget,
  type AreaBand,
  type Filters,
} from "@/lib/filters";
import { interpolate } from "@/lib/i18n";
import { CITY_KEYS, LISTINGS, TYPE_KEYS, type CityKey, type Listing, type TypeKey } from "@/lib/listings";
import { button } from "@/lib/ui";
import { BudgetRange } from "./BudgetRange";

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function shortList(names: string[]) {
  return names.length <= 1 ? names.join("") : `${names[0]} +${names.length - 1}`;
}

/** How many results each option would give, with every other filter applied. */
function facet<K extends string>(draft: Filters, without: Partial<Filters>, keys: readonly K[], match: (l: Listing, k: K) => boolean) {
  const pool = applyFilters(LISTINGS, { ...draft, ...without });
  return new Map(keys.map((k) => [k, pool.filter((l) => match(l, k)).length]));
}

/** Portal-style filter row: one dropdown per dimension. */
export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { t } = useI18n();
  const active = activeFilterCount(filters) > 0;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <FilterDropdown
        label={t.filters.city}
        valueLabel={filters.cities.length ? shortList(filters.cities.map((c) => t.cities[c])) : null}
        filters={filters}
        onApply={onFiltersChange}
        clear={(d) => ({ ...d, cities: [] })}
        width={300}
      >
        {(draft, setDraft) => {
          const counts = facet(draft, { cities: [] }, CITY_KEYS, (l, k) => l.city === k);
          return (
            <OptionList
              multiple
              label={t.filters.city}
              selected={draft.cities}
              onSelect={(city: CityKey) => setDraft({ ...draft, cities: toggle(draft.cities, city) })}
              options={CITY_KEYS.map((city) => ({ value: city, label: t.cities[city], count: counts.get(city) }))}
            />
          );
        }}
      </FilterDropdown>

      <FilterDropdown
        label={t.filters.propertyType}
        valueLabel={filters.types.length ? shortList(filters.types.map((ty) => t.types[ty])) : null}
        filters={filters}
        onApply={onFiltersChange}
        clear={(d) => ({ ...d, types: [] })}
        width={320}
      >
        {(draft, setDraft) => {
          const counts = facet(draft, { types: [] }, TYPE_KEYS, (l, k) => l.type === k);
          return (
            <OptionList
              multiple
              label={t.filters.propertyType}
              selected={draft.types}
              onSelect={(type: TypeKey) => setDraft({ ...draft, types: toggle(draft.types, type) })}
              options={TYPE_KEYS.map((type) => ({ value: type, label: t.types[type], icon: TYPE_ICONS[type], count: counts.get(type) }))}
            />
          );
        }}
      </FilterDropdown>

      <FilterDropdown
        label={t.filters.budget}
        valueLabel={isBudgetActive(filters) ? summariseBudget(filters, t) : null}
        filters={filters}
        onApply={onFiltersChange}
        clear={(d) => ({ ...d, minLac: 0, maxLac: EMPTY_FILTERS.maxLac, noLimit: true })}
        width={380}
      >
        {(draft, setDraft) => (
          <div className="p-5">
            <p className="mb-3 text-[13px] text-slate-600">{t.filters.budgetUnit}</p>
            <BudgetRange
              minLac={draft.minLac}
              maxLac={draft.maxLac}
              noLimit={draft.noLimit}
              onChange={(patch) => setDraft({ ...draft, ...patch })}
            />
          </div>
        )}
      </FilterDropdown>

      <FilterDropdown
        label={t.filters.size}
        valueLabel={filters.area ? t.areaBands[filters.area] : null}
        filters={filters}
        onApply={onFiltersChange}
        clear={(d) => ({ ...d, area: null })}
        width={300}
      >
        {(draft, setDraft) => {
          const keys = AREA_BANDS.map((b) => b.key);
          const counts = facet(draft, { area: null }, keys, (l, k) => applyFilters([l], { ...EMPTY_FILTERS, area: k }).length > 0);
          return (
            <OptionList
              label={t.filters.size}
              selected={[draft.area ?? "any"]}
              onSelect={(value: AreaBand | "any") => setDraft({ ...draft, area: value === "any" ? null : value })}
              options={[
                { value: "any" as const, label: t.filters.anySize },
                ...AREA_BANDS.map((b) => ({ value: b.key, label: t.areaBands[b.key], count: counts.get(b.key) })),
              ]}
            />
          );
        }}
      </FilterDropdown>

      <FilterDropdown
        label={t.filters.bedrooms}
        valueLabel={filters.beds > 0 ? interpolate(t.filters.bedsPlus, { n: filters.beds }) : null}
        filters={filters}
        onApply={onFiltersChange}
        clear={(d) => ({ ...d, beds: 0 })}
        width={280}
      >
        {(draft, setDraft) => {
          const keys = BED_OPTIONS.map(String);
          const counts = facet(draft, { beds: 0 }, keys, (l, k) => (l.beds ?? 0) >= Number(k));
          return (
            <>
              <OptionList
                label={t.filters.bedrooms}
                selected={[draft.beds ? String(draft.beds) : "any"]}
                onSelect={(value: string) => setDraft({ ...draft, beds: value === "any" ? 0 : Number(value) })}
                options={[
                  { value: "any", label: t.filters.anyBeds },
                  ...keys.map((k) => ({ value: k, label: interpolate(t.filters.bedsPlus, { n: k }), count: counts.get(k) })),
                ]}
              />
              <p className="border-t border-slate-100 px-5 py-3 text-[12px] leading-relaxed text-slate-600">{t.filters.bedsHint}</p>
            </>
          );
        }}
      </FilterDropdown>

      {active && (
        <button
          type="button"
          onClick={() => onFiltersChange(EMPTY_FILTERS)}
          className="h-11 shrink-0 whitespace-nowrap px-2 text-[14px] font-semibold text-brand-800 underline-offset-4 hover:underline"
        >
          {t.search.clearAll}
        </button>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  /** What's selected, shown on the button; null when this filter is off. */
  valueLabel: string | null;
  filters: Filters;
  onApply: (filters: Filters) => void;
  clear: (draft: Filters) => Filters;
  width: number;
  children: (draft: Filters, setDraft: (next: Filters) => void) => ReactNode;
}

/** A filter button whose panel edits a draft, previews the result count, and commits on "Show N". */
function FilterDropdown({ label, valueLabel, filters, onApply, clear, width, children }: FilterDropdownProps) {
  const { t } = useI18n();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const panelId = useId();
  const matchCount = useMemo(() => applyFilters(LISTINGS, draft).length, [draft]);
  const isActive = valueLabel !== null;

  const openPanel = () => {
    if (open) return setOpen(false);
    setDraft(filters);
    setOpen(true);
  };

  const commit = () => {
    onApply(draft);
    setOpen(false);
    anchorRef.current?.focus();
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={openPanel}
        className={cn(
          "inline-flex h-11 max-w-[15rem] shrink-0 items-center gap-1.5 rounded-full border ps-4 pe-3 text-[14px] font-semibold transition-colors",
          isActive
            ? "border-brand-800 bg-brand-50 text-brand-900 hover:bg-brand-100"
            : "border-slate-300 bg-white text-slate-800 hover:border-slate-500",
          open && !isActive && "border-slate-900",
        )}
      >
        <span className="truncate">
          {isActive ? (
            <>
              <span className="sr-only">{label}: </span>
              {valueLabel}
            </>
          ) : (
            label
          )}
        </span>
        <ChevronDownIcon className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <Popover
        id={panelId}
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        title={label}
        width={width}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDraft(clear(draft))}
              className="h-11 px-1 text-[14px] font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
            >
              {t.filters.clear}
            </button>
            <button type="button" onClick={commit} className={cn(button.primary, "h-11 px-5 text-[14px]")}>
              {matchCount === 1 ? t.filters.showOne : interpolate(t.filters.showMany, { n: matchCount })}
            </button>
          </div>
        }
      >
        {children(draft, setDraft)}
      </Popover>
    </>
  );
}
