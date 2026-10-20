"use client";

import { useEffect, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface PopoverProps {
  /** DOM id for the panel, so the trigger can reference it with aria-controls. */
  id?: string;
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  /** Heading for the phone sheet and the accessible name of the panel. */
  title: string;
  /** Which edge of the anchor the panel lines up with (flips in RTL). */
  align?: "start" | "end";
  /** Panel width in px, or "anchor" to match the trigger (min 300px). */
  width?: number | "anchor";
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Anchored panel on tablet/desktop, bottom sheet on phones. Rendered into
 * <body> so it is never clipped by an overflow:hidden parent (e.g. the hero
 * search bar).
 */
export function Popover({ id, open, onClose, anchorRef, title, align = "start", width = 320, footer, children }: PopoverProps) {
  const { t } = useI18n();
  const isPhone = useMediaQuery("(max-width: 639px)");
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Keep the latest onClose without re-running the effects below on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Desktop positioning, written straight to style so scrolling doesn't re-render React.
  useLayoutEffect(() => {
    if (!open || isPhone) return;
    const panel = panelRef.current;
    if (!panel) return;

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const a = anchor.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const w = Math.min(width === "anchor" ? Math.max(a.width, 300) : width, vw - 16);
      const rtl = getComputedStyle(anchor).direction === "rtl";
      const alignRight = (align === "end") !== rtl;

      const left = Math.min(Math.max(8, alignRight ? a.right - w : a.left), vw - w - 8);
      const below = vh - a.bottom - 16;
      const above = a.top - 16;
      const natural = panel.scrollHeight;
      const openUp = natural > below && above > below;
      const maxHeight = Math.max(220, openUp ? above : below);

      panel.style.width = `${w}px`;
      panel.style.left = `${left}px`;
      panel.style.maxHeight = `${maxHeight}px`;
      panel.style.top = openUp ? `${Math.max(8, a.top - 8 - Math.min(natural, maxHeight))}px` : `${a.bottom + 8}px`;
      panel.style.transformOrigin = openUp ? "bottom" : "top";
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, isPhone, anchorRef, align, width]);

  // Phones: a true modal sheet (focus trapped, page inert, focus back to the trigger on close).
  useDialogFocus(open && isPhone, panelRef, { returnFocus: anchorRef });

  // Desktop: a lightweight popover. Focus moves in, Shift+Tab from the top returns to the trigger.
  useEffect(() => {
    if (!open || isPhone) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!panel) return;

    // Prefer the selected option, then an explicit autofocus target, then the first control.
    const first =
      panel.querySelector<HTMLElement>('[aria-selected="true"]') ??
      panel.querySelector<HTMLElement>("[data-autofocus]") ??
      panel.querySelector<HTMLElement>('[role="option"], input, button');
    first?.focus({ preventScroll: true });

    const onPanelKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !e.shiftKey) return;
      const firstFocusable = panel.querySelector<HTMLElement>('button:not([tabindex="-1"]), input, [tabindex="0"]');
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        anchor?.focus();
      }
    };
    panel.addEventListener("keydown", onPanelKeyDown);
    return () => panel.removeEventListener("keydown", onPanelKeyDown);
  }, [open, isPhone, anchorRef]);

  // Dismissal (both modes) and scroll lock on phones.
  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panel?.contains(target) || anchor?.contains(target)) return;
      onCloseRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onCloseRef.current();
      anchor?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    let previousOverflow: string | null = null;
    if (isPhone) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      if (previousOverflow !== null) document.body.style.overflow = previousOverflow;
    };
  }, [open, isPhone, anchorRef]);

  if (!open) return null;

  if (isPhone) {
    return createPortal(
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 animate-fade bg-slate-950/50" aria-hidden="true" />
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-sheet-in flex-col rounded-t-2xl bg-white"
        >
          <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 ps-5 pe-2">
            <h2 id={titleId} className="text-[17px] font-bold text-slate-900">
              {title}
            </h2>
            <button
              type="button"
              data-close
              onClick={onClose}
              aria-label={t.common.close}
              className="grid size-12 place-items-center rounded-md text-slate-700 hover:bg-slate-100"
            >
              <XIcon className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <div className="shrink-0 border-t border-slate-200 px-4 pb-safe pt-3">{footer}</div>}
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        // Tabbing out of the panel closes it, like a native menu.
        if (next && !panelRef.current?.contains(next) && !anchorRef.current?.contains(next)) onClose();
      }}
      className="fixed z-50 flex animate-pop-in flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel"
      style={{ top: -9999, left: -9999 }}
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="shrink-0 border-t border-slate-200 bg-white p-3">{footer}</div>}
    </div>,
    document.body,
  );
}
