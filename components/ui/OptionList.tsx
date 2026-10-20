"use client";

import type { ComponentType, KeyboardEvent, SVGProps } from "react";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export interface Option<V extends string> {
  value: V;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Result count shown at the end of the row. */
  count?: number;
}

interface OptionListProps<V extends string> {
  options: Option<V>[];
  selected: V[];
  multiple?: boolean;
  onSelect: (value: V) => void;
  label: string;
}

/** Listbox with arrow-key navigation. Multi-select rows show checkboxes; single-select rows a tick. */
export function OptionList<V extends string>({ options, selected, multiple, onSelect, label }: OptionListProps<V>) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'));
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : e.key === "ArrowDown" ? Math.min(current + 1, items.length - 1) : Math.max(current - 1, 0);
    items[next]?.focus();
  }

  return (
    <div role="listbox" aria-label={label} aria-multiselectable={multiple || undefined} onKeyDown={onKeyDown} className="py-1.5">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const unavailable = option.count === 0 && !isSelected;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-disabled={unavailable || undefined}
            tabIndex={isSelected || (!selected.length && option === options[0]) ? 0 : -1}
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex min-h-12 w-full items-center gap-3 px-5 text-start text-[15px] outline-none transition-colors sm:min-h-11 sm:px-4",
              "hover:bg-slate-50 focus-visible:bg-slate-100",
              !multiple && isSelected && "bg-brand-50 hover:bg-brand-50",
            )}
          >
            {multiple && (
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-[5px] border transition-colors",
                  isSelected ? "border-brand-800 bg-brand-800 text-white" : "border-slate-400 bg-white",
                )}
              >
                {isSelected && <CheckIcon className="size-3.5" strokeWidth={3} />}
              </span>
            )}
            {Icon && <Icon className={cn("size-5 shrink-0", isSelected ? "text-brand-800" : "text-slate-500")} />}
            <span
              className={cn(
                "flex-1 truncate",
                isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-800",
                unavailable && "text-slate-500",
              )}
            >
              {option.label}
            </span>
            {option.count !== undefined && (
              <span className="text-[13px] tabular-nums text-slate-500">{option.count}</span>
            )}
            {!multiple && (
              <CheckIcon className={cn("size-[18px] shrink-0 text-brand-800", !isSelected && "invisible")} strokeWidth={2.4} />
            )}
          </button>
        );
      })}
    </div>
  );
}
