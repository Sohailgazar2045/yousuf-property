"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Options {
  /** Element to focus first; defaults to the selected option, then the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Where focus goes on close; defaults to whatever was focused when the dialog opened. */
  returnFocus?: RefObject<HTMLElement | null>;
}

/**
 * Modal focus handling: moves focus in, keeps Tab inside, makes the rest of the
 * page inert (so screen readers and Tab can't reach it), and gives focus back
 * on close. The dialog must live in its own top-level element under <body>
 * (a portal or a fixed overlay), so everything else can be made inert.
 */
export function useDialogFocus(open: boolean, dialogRef: RefObject<HTMLElement | null>, options: Options = {}) {
  const { initialFocus, returnFocus } = options;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Resolved now: the trigger exists while the dialog is open.
    const returnTo = returnFocus?.current ?? (document.activeElement as HTMLElement | null);
    const root = Array.from(document.body.children).find((el) => el.contains(dialog));
    const madeInert = Array.from(document.body.children).filter(
      (el) => el !== root && !el.hasAttribute("inert") && el.tagName !== "SCRIPT",
    );
    madeInert.forEach((el) => el.setAttribute("inert", ""));

    const target =
      initialFocus?.current ??
      dialog.querySelector<HTMLElement>('[aria-selected="true"]') ??
      dialog.querySelector<HTMLElement>(FOCUSABLE) ??
      dialog;
    target.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKeyDown);

    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      madeInert.forEach((el) => el.removeAttribute("inert"));
      returnTo?.focus?.({ preventScroll: true });
    };
    // Refs are stable; re-running only when the dialog opens or closes is intended.
  }, [open, dialogRef, initialFocus, returnFocus]);
}
