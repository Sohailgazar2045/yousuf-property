"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapPinIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

interface MapEmbedProps {
  src: string;
  title: string;
  className?: string;
  /** Overlaid on the map's bottom edge (e.g. an "Open in Google Maps" link). */
  action?: ReactNode;
}

/**
 * Google Maps iframe that is only created when it is about to scroll into view.
 * The embed pulls ~1 MB of scripts and fonts; most visitors never scroll to it.
 */
export function MapEmbed({ src, title, className, action }: MapEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-(--radius-card) border border-slate-200 bg-slate-100", className)}>
      {visible ? (
        <iframe title={title} src={src} className="absolute inset-0 size-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-slate-400" aria-hidden="true">
          <MapPinIcon className="size-8" />
        </div>
      )}
      {action && <div className="absolute bottom-3 start-3">{action}</div>}
    </div>
  );
}
