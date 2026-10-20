"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackCall } from "@/lib/analytics";
import { TEL_HREF } from "@/lib/site";

interface CallLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  source: string;
  children: ReactNode;
}

export function CallLink({ source, onClick, children, ...rest }: CallLinkProps) {
  return (
    <a
      {...rest}
      href={TEL_HREF}
      onClick={(e) => {
        trackCall(source);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
