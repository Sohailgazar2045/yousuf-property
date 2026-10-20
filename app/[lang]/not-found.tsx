"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SearchIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { cn } from "@/lib/cn";
import { DIRECTION, localePath } from "@/lib/i18n";
import { getFeaturedListings } from "@/lib/listings";
import { button, container, heading } from "@/lib/ui";

export default function NotFound() {
  const { t, locale } = useI18n();
  const suggestions = getFeaturedListings(3);

  // Next serves 404s through its error document, which has no lang/dir; restore them.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = DIRECTION[locale];
  }, [locale]);

  return (
    <>
      <div className="border-b border-slate-200">
        <div className={cn(container, "py-16 lg:py-20")}>
          <p className="text-[15px] font-semibold text-brand-800">404</p>
          <h1 className={cn(heading.page, "mt-2")}>{t.errors.notFoundTitle}</h1>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-slate-600">{t.errors.notFoundBody}</p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Link href={localePath(locale, "/properties")} className={cn(button.primary, "h-12 px-6 text-[15px]")}>
              <SearchIcon className="size-[18px]" />
              {t.errors.browse}
            </Link>
            <Link href={localePath(locale)} className={cn(button.outline, "h-12 px-6 text-[15px]")}>
              {t.errors.goHome}
            </Link>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className={cn(container, "py-14")} aria-labelledby="suggestions-heading">
          <h2 id="suggestions-heading" className={heading.section}>
            {t.home.featuredTitle}
          </h2>
          <PropertyGrid listings={suggestions} className="mt-6" />
        </section>
      )}
    </>
  );
}
