"use client";

import { useEffect, useId, useState } from "react";
import { SearchIcon, XIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

/** Society / area / reference search. Typing is debounced; Enter and clear apply immediately. */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const { t } = useI18n();
  const id = useId();
  const [text, setText] = useState(value);

  // Follow outside changes (e.g. "Clear all").
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onChange(text), 250);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onChange(text);
      }}
      className="relative"
    >
      <label htmlFor={id} className="sr-only">
        {t.search.searchLabel}
      </label>
      <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      <input
        id={id}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.search.searchPlaceholder}
        autoComplete="off"
        enterKeyHint="search"
        className="h-12 w-full rounded-(--radius-control) border border-slate-300 bg-white ps-11 pe-11 text-[16px] text-slate-900 outline-none transition-colors placeholder:text-slate-500 hover:border-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            onChange("");
          }}
          aria-label={t.search.clearSearch}
          className="absolute end-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </form>
  );
}
