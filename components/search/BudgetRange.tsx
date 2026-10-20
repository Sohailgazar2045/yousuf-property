"use client";

import { useId } from "react";
import { useI18n } from "@/components/I18nProvider";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import { BUDGET_CEILING_LAC, BUDGET_MAX_INPUT_LAC, BUDGET_STEP_LAC, type Filters } from "@/lib/filters";
import { LAC, formatLac, formatRupees } from "@/lib/format";

type BudgetPatch = Partial<Pick<Filters, "minLac" | "maxLac" | "noLimit">>;

interface BudgetRangeProps {
  minLac: number;
  maxLac: number;
  noLimit: boolean;
  onChange: (patch: BudgetPatch) => void;
}

const PRESETS = [
  { key: "under50", min: 0, max: 50 },
  { key: "50to100", min: 50, max: 100 },
  { key: "100to300", min: 100, max: 300 },
  { key: "300plus", min: 300, max: null },
] as const;

const toPercent = (lac: number) => (Math.min(lac, BUDGET_CEILING_LAC) / BUDGET_CEILING_LAC) * 100;

export function BudgetRange({ minLac, maxLac, noLimit, onChange }: BudgetRangeProps) {
  const { t, locale } = useI18n();
  const minId = useId();
  const maxId = useId();

  // Once the min handle is parked near the far end it would sit under the max
  // handle and become ungrabbable, so lift it.
  const minOnTop = minLac > BUDGET_CEILING_LAC * 0.9;

  function handleMinSlide(value: number) {
    onChange({ minLac: noLimit ? value : Math.max(0, Math.min(value, maxLac - BUDGET_STEP_LAC)) });
  }

  function handleMaxSlide(value: number) {
    onChange({ maxLac: Math.max(value, minLac + BUDGET_STEP_LAC) });
  }

  function normaliseOnBlur() {
    if (!noLimit && minLac > maxLac) onChange({ minLac: maxLac, maxLac: minLac });
  }

  function toggleNoLimit() {
    onChange(noLimit ? { noLimit: false, maxLac: Math.max(maxLac, minLac + BUDGET_STEP_LAC) } : { noLimit: true });
  }

  const hint = (value: number) =>
    value >= 100 ? `= ${formatLac(value, t.units)}` : value > 0 ? formatRupees(value * LAC, t.units, locale) : " ";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => {
          const selected = preset.min === minLac && (preset.max === null ? noLimit : !noLimit && preset.max === maxLac);
          return (
            <Pill
              key={preset.key}
              selected={selected}
              onClick={() => onChange({ minLac: preset.min, maxLac: preset.max ?? maxLac, noLimit: preset.max === null })}
            >
              {t.budget.presets[preset.key]}
            </Pill>
          );
        })}
      </div>

      {/* Mirrors in Urdu: native range inputs follow the page direction, and the fill uses logical insets. */}
      <div className="relative h-10">
        <div className="absolute inset-x-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200">
          <div
            className="absolute inset-y-0 rounded-full bg-brand-700"
            style={{ insetInlineStart: `${toPercent(minLac)}%`, insetInlineEnd: noLimit ? "0%" : `${100 - toPercent(maxLac)}%` }}
          />
        </div>
        {noLimit && (
          // The open end of the range, where the max handle would be.
          <span
            aria-hidden="true"
            className="absolute end-0 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full border-2 border-brand-700 bg-white text-brand-800"
          >
            <svg viewBox="0 0 32 16" className="h-2 w-3.5" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round">
              <path d="M16 8c-2.6-3.6-4.8-5.5-7.5-5.5a5.5 5.5 0 0 0 0 11c2.7 0 4.9-1.9 7.5-5.5s4.8-5.5 7.5-5.5a5.5 5.5 0 0 1 0 11c-2.7 0-4.9-1.9-7.5-5.5z" />
            </svg>
          </span>
        )}
        <input
          type="range"
          aria-label={t.budget.minAria}
          aria-valuetext={formatLac(minLac, t.units)}
          min={0}
          max={BUDGET_CEILING_LAC}
          step={BUDGET_STEP_LAC}
          value={Math.min(minLac, BUDGET_CEILING_LAC)}
          onChange={(e) => handleMinSlide(Number(e.target.value))}
          className={cn("range-dual", minOnTop ? "z-20" : "z-10")}
        />
        {!noLimit && (
          <input
            type="range"
            aria-label={t.budget.maxAria}
            aria-valuetext={formatLac(maxLac, t.units)}
            min={0}
            max={BUDGET_CEILING_LAC}
            step={BUDGET_STEP_LAC}
            value={Math.min(maxLac, BUDGET_CEILING_LAC)}
            onChange={(e) => handleMaxSlide(Number(e.target.value))}
            className="range-dual z-10"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={minId} className="mb-1 block text-[13px] font-semibold text-slate-700">
            {t.budget.min}
          </label>
          <LacInput id={minId} value={minLac} placeholder="0" unit={t.units.lac} onChange={(v) => onChange({ minLac: v })} onBlur={normaliseOnBlur} />
          <p dir="auto" className="mt-1 truncate text-start text-[12px] tabular-nums text-slate-500">
            {hint(minLac)}
          </p>
        </div>

        {noLimit ? (
          <div>
            <span className="mb-1 block text-[13px] font-semibold text-slate-500">{t.budget.max}</span>
            <div
              role="img"
              aria-label={t.budget.noMaxAria}
              className="flex h-12 cursor-not-allowed select-none items-center justify-between rounded-(--radius-control) border border-dashed border-slate-300 bg-slate-50 px-3"
            >
              {/* Drawn rather than typed: the font doesn't ship a ∞ glyph. */}
              <svg viewBox="0 0 32 16" className="h-3.5 w-7 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
                <path d="M16 8c-2.6-3.6-4.8-5.5-7.5-5.5a5.5 5.5 0 0 0 0 11c2.7 0 4.9-1.9 7.5-5.5s4.8-5.5 7.5-5.5a5.5 5.5 0 0 1 0 11c-2.7 0-4.9-1.9-7.5-5.5z" />
              </svg>
              <span className="text-[12px] font-medium text-slate-500">{t.budget.noCap}</span>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">{t.budget.toggleOffHint}</p>
          </div>
        ) : (
          <div>
            <label htmlFor={maxId} className="mb-1 block text-[13px] font-semibold text-slate-700">
              {t.budget.max}
            </label>
            <LacInput id={maxId} value={maxLac} placeholder="500" unit={t.units.lac} onChange={(v) => onChange({ maxLac: v })} onBlur={normaliseOnBlur} />
            <p dir="auto" className="mt-1 truncate text-start text-[12px] tabular-nums text-slate-500">
              {hint(maxLac)}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={noLimit}
        onClick={toggleNoLimit}
        className="flex min-h-12 w-full items-center justify-between gap-4 text-start"
      >
        <span>
          <span className="block text-[14px] font-semibold text-slate-800">{t.budget.noLimit}</span>
          <span className="block text-[12px] text-slate-500">{t.budget.noLimitHint}</span>
        </span>
        <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200", noLimit ? "bg-brand-800" : "bg-slate-300")}>
          <span
            className={cn(
              "absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_oklch(0.2_0.02_179/0.3)] transition-transform duration-200 ease-out",
              noLimit && "translate-x-4 rtl:-translate-x-4",
            )}
          />
        </span>
      </button>
    </div>
  );
}

interface LacInputProps {
  id: string;
  value: number;
  placeholder: string;
  unit: string;
  onChange: (lac: number) => void;
  onBlur: () => void;
}

function LacInput({ id, value, placeholder, unit, onChange, onBlur }: LacInputProps) {
  return (
    <div className="flex h-12 items-center rounded-(--radius-control) border border-slate-300 bg-white px-3 transition-colors focus-within:border-brand-700 focus-within:ring-1 focus-within:ring-brand-700">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        dir="ltr"
        autoComplete="off"
        placeholder={placeholder}
        value={value === 0 ? "" : String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits ? Math.min(Number(digits), BUDGET_MAX_INPUT_LAC) : 0);
        }}
        onBlur={onBlur}
        className="w-full min-w-0 bg-transparent text-start text-[15px] font-semibold tabular-nums text-slate-900 outline-none placeholder:text-slate-500 rtl:text-end"
      />
      <span className="ps-2 text-[13px] font-medium text-slate-500">{unit}</span>
    </div>
  );
}
