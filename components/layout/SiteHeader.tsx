"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon, ClockIcon, HeartIcon, MapPinIcon, MenuIcon, PhoneIcon, WhatsAppIcon, XIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { LOCALE_COOKIE, LOCALES, localePath, otherLocale, type Locale } from "@/lib/i18n";
import { useShortlist } from "@/lib/shortlist";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { SITE } from "@/lib/site";
import { button, container } from "@/lib/ui";
import { generalLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const NAV = [
  { key: "home", path: "" },
  { key: "properties", path: "/properties" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
] as const;

const LANGUAGE_LABEL: Record<Locale, string> = { en: "EN", ur: "اردو" };

function switchLocaleHref(pathname: string, to: Locale) {
  return pathname.replace(/^\/(en|ur)(?=\/|$)/, `/${to}`);
}

/** Pages that open with a full-bleed photo; the header floats over it until you scroll. */
function hasHeroPhoto(pathname: string) {
  return /^\/(en|ur)(\/about)?\/?$/.test(pathname);
}

/** IDs of listings that still exist, so stale saved IDs aren’t counted. Passed from the server layout. */
export function SiteHeader({ listingIds }: { listingIds: string[] }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  useDialogFocus(menuOpen, menuRef, { initialFocus: menuCloseRef, returnFocus: menuButtonRef });
  const { ids } = useShortlist();
  const savedCount = ids.filter((id) => listingIds.includes(id)).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu whenever the route changes.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const overPhoto = hasHeroPhoto(pathname) && !scrolled;

  const isActive = (path: string) =>
    path === "" ? pathname === localePath(locale) : pathname.startsWith(localePath(locale, path));

  const goToLocale = (to: Locale) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (to === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
    window.location.assign(switchLocaleHref(pathname, to) + window.location.search);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-brand-800 px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t.nav.skipToContent}
      </a>

      {/* Utility bar: who we are, where, and how to reach us. Desktop only; it scrolls away. */}
      <aside aria-label={t.footer.contact} className="hidden bg-brand-950 pt-safe text-[13px] text-white/80 lg:block">
        <div className={cn(container, "flex h-10 items-center justify-between gap-6")}>
          <ul className="flex min-w-0 items-center gap-6">
            <li className="flex min-w-0 items-center gap-1.5">
              <MapPinIcon className="size-4 shrink-0 text-white/60" />
              <a href={SITE.office.mapsUrl} target="_blank" rel="noopener noreferrer" className="truncate transition-colors hover:text-white">
                {SITE.addressShort[locale]}
              </a>
            </li>
            <li className="flex items-center gap-1.5 max-xl:hidden">
              <ClockIcon className="size-4 shrink-0 text-white/60" />
              {SITE.hours[locale]}
            </li>
          </ul>
          <div className="flex shrink-0 items-center gap-5">
            <CallLink source="topbar" className="flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-brand-200">
              <PhoneIcon className="size-4 text-white/60" />
              <span dir="ltr">{SITE.phoneDisplay}</span>
            </CallLink>
            <WhatsAppLink href={generalLink(t)} source="topbar" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <WhatsAppIcon className="size-4 text-whatsapp" />
              {t.common.whatsapp}
            </WhatsAppLink>
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />
            <div className="flex items-center rounded-md bg-white/10 p-0.5" role="group" aria-label={t.nav.language}>
              {LOCALES.map((l) => (
                <a
                  key={l}
                  href={switchLocaleHref(pathname, l)}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === locale ? "true" : undefined}
                  onClick={goToLocale(l)}
                  className={cn(
                    "rounded px-2.5 py-0.5 text-[12px] font-bold transition-colors",
                    l === "ur" && locale === "ur" && "font-urdu text-[13px] font-semibold",
                    l === locale ? "bg-white text-brand-950" : "text-white/75 hover:text-white",
                  )}
                >
                  {LANGUAGE_LABEL[l]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 max-lg:pt-safe",
          overPhoto
            ? "border-transparent bg-transparent"
            : cn("border-slate-200 bg-white", scrolled && "shadow-[0_6px_16px_-12px_oklch(0.2_0.02_179/0.35)]"),
        )}
      >
        {/* Keeps the white header text readable over bright parts of the photo. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-slate-950/55 to-transparent transition-opacity duration-300",
            overPhoto ? "opacity-100" : "opacity-0",
          )}
        />

        <div className={cn(container, "flex h-16 items-center gap-4 lg:h-[4.5rem]")}>
          <Logo tone={overPhoto ? "light" : "dark"} />

          <nav aria-label={t.nav.primary} className="mx-auto hidden h-full lg:block">
            <ul className="flex h-full items-center gap-1">
              {NAV.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.key} className="h-full">
                    <Link
                      href={localePath(locale, item.path)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-full items-center px-4 text-[15px] font-semibold transition-colors",
                        "after:absolute after:inset-x-4 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition-opacity",
                        overPhoto
                          ? cn("text-white/90 hover:text-white after:bg-white", active ? "text-white after:opacity-100" : "after:opacity-0")
                          : cn(
                              "after:bg-brand-800",
                              active ? "text-brand-800 after:opacity-100" : "text-slate-700 after:opacity-0 hover:text-slate-950",
                            ),
                      )}
                    >
                      {t.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
            <Link
              href={localePath(locale, "/shortlist")}
              aria-label={`${t.nav.shortlist} (${savedCount})`}
              title={t.nav.shortlist}
              aria-current={isActive("/shortlist") ? "page" : undefined}
              className={cn(
                "relative grid size-11 place-items-center rounded-full transition-colors",
                overPhoto ? "text-white hover:bg-white/15" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <HeartIcon className={cn("size-[22px]", savedCount > 0 && "fill-rose-500 text-rose-500")} />
              {savedCount > 0 && (
                <span
                  key={savedCount}
                  className="absolute -end-0.5 -top-0.5 grid h-[18px] min-w-[18px] animate-pop place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white"
                >
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Phones and tablets: compact language switch (desktop has it in the utility bar). */}
            <a
              href={switchLocaleHref(pathname, otherLocale(locale))}
              hrefLang={otherLocale(locale)}
              lang={otherLocale(locale)}
              onClick={goToLocale(otherLocale(locale))}
              title={t.nav.switchLanguageLabel}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-3 text-[13px] font-bold transition-colors lg:hidden",
                overPhoto ? "border-white/40 text-white hover:bg-white/15" : "border-slate-300 text-slate-800 hover:bg-slate-50",
              )}
            >
              {LANGUAGE_LABEL[otherLocale(locale)]}
            </a>

            <WhatsAppLink
              href={generalLink(t)}
              source="header"
              className={cn(button.whatsapp, "ms-2 h-11 px-4 text-[14px] max-lg:hidden")}
            >
              <WhatsAppIcon className="size-[18px]" />
              {t.nav.talkToAdvisor}
            </WhatsAppLink>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={cn(
                "relative grid size-11 place-items-center rounded-full transition-colors lg:hidden",
                overPhoto ? "text-white hover:bg-white/15" : "text-slate-900 hover:bg-slate-100",
              )}
            >
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", !menuOpen && "pointer-events-none")} inert={!menuOpen}>
        <div
          onClick={() => setMenuOpen(false)}
          className={cn("absolute inset-0 bg-slate-950/50 transition-opacity duration-300", menuOpen ? "opacity-100" : "opacity-0")}
        />
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.primary}
          className={cn(
            "absolute inset-y-0 end-0 flex w-[min(22rem,90vw)] flex-col bg-white pt-safe transition-transform duration-500 ease-out",
            menuOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 ps-5 pe-2">
            <Logo />
            <button
              ref={menuCloseRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t.nav.closeMenu}
              className="grid size-12 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-slate-200 border-b border-slate-200">
              {[...NAV, { key: "shortlist", path: "/shortlist" } as const].map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.key}>
                    <Link
                      href={localePath(locale, item.path)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-14 items-center justify-between px-5 text-[16px] font-semibold transition-colors",
                        active ? "bg-brand-50 text-brand-800" : "text-slate-800 hover:bg-slate-50",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        {t.nav[item.key]}
                        {item.key === "shortlist" && savedCount > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                            {savedCount}
                          </span>
                        )}
                      </span>
                      <ChevronRightIcon className="size-4 text-slate-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 px-5 py-5 text-[14px] text-slate-600">
              <p className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-slate-500" />
                {SITE.address[locale]}
              </p>
              <p className="flex items-start gap-2.5">
                <ClockIcon className="mt-0.5 size-4 shrink-0 text-slate-500" />
                {SITE.hours[locale]}
              </p>
            </div>
          </nav>

          <div className="space-y-2 border-t border-slate-200 p-4 pb-safe">
            <WhatsAppLink href={generalLink(t)} source="mobile-menu" className={cn(button.whatsapp, "h-12 w-full text-[15px]")}>
              <WhatsAppIcon className="size-5" />
              {t.nav.talkToAdvisor}
            </WhatsAppLink>
            <CallLink source="mobile-menu" className={cn(button.outline, "h-12 w-full text-[15px]")}>
              <PhoneIcon className="size-5 text-brand-800" />
              <span dir="ltr">{SITE.phoneDisplay}</span>
            </CallLink>
          </div>
        </div>
      </div>
    </>
  );
}
