"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { TYPE_ICONS } from "@/components/property/typeIcons";
import { BudgetRange } from "@/components/search/BudgetRange";
import { Popover } from "@/components/ui/Popover";
import { SelectField } from "@/components/ui/SelectField";
import { cn } from "@/lib/cn";
import { EMPTY_FILTERS, isBudgetActive, summariseBudget, toQueryString, type Filters } from "@/lib/filters";
import { localePath } from "@/lib/i18n";
import { CITY_KEYS, TYPE_KEYS, type CityKey, type TypeKey } from "@/lib/keys";
import { button } from "@/lib/ui";


type Budget = Pick<Filters, "minLac" | "maxLac" | "noLimit">;
const ANY_BUDGET: Budget = { minLac: 0, maxLac: EMPTY_FILTERS.maxLac, noLimit: true };

interface HeroSearchProps {
  /** Listing counts per city and type, computed on the server. */
  cityCounts: Partial<Record<CityKey, number>>;
  typeCounts: Partial<Record<TypeKey, number>>;
  total: number;
}

export function HeroSearch({ cityCounts, typeCounts, total }: HeroSearchProps) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [city, setCity] = useState<CityKey | "all">("all");
  const [type, setType] = useState<TypeKey | "all">("all");
  const [budget, setBudget] = useState<Budget>(ANY_BUDGET);

  function submit(e: FormEvent) {
    e.preventDefault();
    const filters: Filters = {
      ...EMPTY_FILTERS,
      ...budget,
      cities: city === "all" ? [] : [city],
      types: type === "all" ? [] : [type],
    };
    router.push(`${localePath(locale, "/properties")}${toQueryString(filters)}`);
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className="grid gap-px overflow-hidden rounded-xl bg-slate-200 shadow-panel md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <SelectField
        label={t.home.searchCities}
        value={city}
        onChange={setCity}
        options={[
          { value: "all", label: t.search.allSouthPunjab, count: total },
          ...CITY_KEYS.map((key) => ({ value: key, label: t.cities[key], count: cityCounts[key] ?? 0 })),
        ]}
      />
      <SelectField
        label={t.home.searchType}
        value={type}
        onChange={setType}
        options={[
          { value: "all", label: t.home.anyType, count: total },
          ...TYPE_KEYS.map((key) => ({ value: key, label: t.types[key], icon: TYPE_ICONS[key], count: typeCounts[key] ?? 0 })),
        ]}
      />
      <BudgetField value={budget} onChange={setBudget} />
      <div className="bg-white p-2 md:col-span-2 lg:col-span-1">
        <button type="submit" className={cn(button.primary, "h-14 w-full px-8 text-[16px] lg:h-full")}>
          <SearchIcon className="size-5" strokeWidth={2.2} />
          {t.home.searchButton}
        </button>
      </div>
    </form>
  );
}

/** Budget as a dropdown panel: quick ranges, slider, exact Lac inputs and the no-limit switch. */
function BudgetField({ value, onChange }: { value: Budget; onChange: (b: Budget) => void }) {
  const { t } = useI18n();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const panelId = useId();
  const asFilters = { ...EMPTY_FILTERS, ...value };

  const done = () => {
    onChange(draft);
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
        onClick={() => {
          if (open) return setOpen(false);
          setDraft(value);
          setOpen(true);
        }}
        className="group relative flex w-full flex-col items-start bg-white px-4 py-3 text-start transition-colors hover:bg-slate-50 aria-expanded:bg-slate-50"
      >
        <span className="text-[12px] font-semibold text-slate-600">{t.home.searchBudget}</span>
        <span className="mt-0.5 block w-full truncate pe-6 text-[16px] font-semibold text-slate-900">
          {isBudgetActive(asFilters) ? summariseBudget(asFilters, t) : t.home.anyBudget}
        </span>
        <ChevronDownIcon className="absolute bottom-4 end-4 size-4 text-slate-500 transition-transform duration-200 group-aria-expanded:rotate-180" />
      </button>

      <Popover
        id={panelId}
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        title={t.home.searchBudget}
        width={380}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDraft(ANY_BUDGET)}
              className="h-11 px-1 text-[14px] font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
            >
              {t.filters.clear}
            </button>
            <button type="button" onClick={done} className={cn(button.primary, "h-11 px-6 text-[14px]")}>
              {t.filters.done}
            </button>
          </div>
        }
      >
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-[13px] text-slate-600">{t.filters.budgetUnit}</p>
          <BudgetRange
            minLac={draft.minLac}
            maxLac={draft.maxLac}
            noLimit={draft.noLimit}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          />
        </div>
      </Popover>
    </>
  );
}
