"use client";

import { track } from "@vercel/analytics";

/** Every WhatsApp tap is a lead, so record where it came from. */
export function trackWhatsApp(source: string, ref?: string) {
  try {
    track("WhatsApp click", ref ? { source, ref } : { source });
  } catch {
    /* analytics must never break a conversion */
  }
}

export function trackCall(source: string) {
  try {
    track("Call click", { source });
  } catch {
    /* ignore */
  }
}
