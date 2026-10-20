"use client";

import { useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { OptionList, type Option } from "./OptionList";
import { Popover } from "./Popover";

interface SelectFieldProps<V extends string> {
  label: string;
  value: V;
  options: Option<V>[];
  onChange: (value: V) => void;
  /**
   * - "field": labelled block for the hero search bar.
   * - "input": looks like a form input; pair with an external <label htmlFor={id}>.
   * - "compact": inline pill button (e.g. sort).
   */
  variant?: "field" | "input" | "compact";
  /** DOM id of the trigger button, for an external label. */
  id?: string;
  align?: "start" | "end";
  className?: string;
}

/** A single-choice dropdown that replaces the native <select>. */
export function SelectField<V extends string>({
  label,
  value,
  options,
  onChange,
  variant = "field",
  id,
  align = "start",
  className,
}: SelectFieldProps<V>) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];
  const Icon = current.icon;

  const choose = (next: V) => {
    onChange(next);
    setOpen(false);
    anchorRef.current?.focus();
  };

  const triggerClass = {
    field:
      "group relative flex w-full flex-col items-start bg-white px-4 py-3 text-start transition-colors hover:bg-slate-50 aria-expanded:bg-slate-50",
    input:
      "group relative flex h-12 w-full items-center rounded-(--radius-control) border border-slate-300 bg-white ps-3.5 pe-10 text-start text-[16px] text-slate-900 transition-colors hover:border-slate-400 aria-expanded:border-brand-700 aria-expanded:ring-1 aria-expanded:ring-brand-700",
    compact:
      "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white ps-4 pe-3 text-[14px] font-semibold text-slate-800 transition-colors hover:border-slate-500 aria-expanded:border-slate-900",
  }[variant];

  return (
    <>
      <button
        ref={anchorRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClass, className)}
      >
        {variant === "field" && (
          <>
            <span className="text-[13px] font-semibold text-slate-600">{label}</span>
            <span className="mt-0.5 flex w-full items-center gap-2 pe-6 text-[16px] font-semibold text-slate-900">
              {Icon && <Icon className="size-[18px] shrink-0 text-brand-800" />}
              <span className="truncate">{current.label}</span>
            </span>
            <ChevronDownIcon className="absolute bottom-4 end-4 size-4 text-slate-500 transition-transform duration-200 group-aria-expanded:rotate-180" />
          </>
        )}
        {variant === "input" && (
          <>
            <span className="truncate">{current.label}</span>
            <ChevronDownIcon className="absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 transition-transform duration-200 group-aria-expanded:rotate-180" />
          </>
        )}
        {variant === "compact" && (
          <>
            <span className="sr-only">{label}: </span>
            {current.label}
            <ChevronDownIcon className={cn("size-4 text-slate-600 transition-transform duration-200", open && "rotate-180")} />
          </>
        )}
      </button>

      <Popover
        id={panelId}
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        title={label}
        align={align}
        width={variant === "compact" ? 260 : "anchor"}
      >
        <OptionList label={label} options={options} selected={[value]} onSelect={choose} />
      </Popover>
    </>
  );
}
