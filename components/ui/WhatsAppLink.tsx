"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackWhatsApp } from "@/lib/analytics";

interface WhatsAppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> {
  href: string;
  /** Where on the site the tap came from, for lead attribution. */
  source: string;
  listingRef?: string;
  children: ReactNode;
}

export function WhatsAppLink({ href, source, listingRef, onClick, children, ...rest }: WhatsAppLinkProps) {
  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        trackWhatsApp(source, listingRef);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
