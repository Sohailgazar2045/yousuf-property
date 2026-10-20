"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { CameraIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/cn";
import { interpolate, pick } from "@/lib/i18n";
import type { Listing } from "@/lib/listings";
import { ListingPhoto, type PhotoLoading } from "./ListingPhoto";

interface ImageSwiperProps {
  listing: Listing;
  /** Makes each slide a link (used on cards). */
  href?: string;
  className?: string;
  sizes?: string;
  /** Loading strategy for the first photo; the rest always load on demand. */
  firstLoading?: PhotoLoading;
  quality?: 75 | 85;
  /** Called with the slide index when a slide is tapped (used to open the full-screen viewer). */
  onSlideClick?: (index: number) => void;
  /** Overlays such as badges and the save button. */
  children?: ReactNode;
}

/**
 * Native scroll-snap carousel: real swipe physics on phones, arrow buttons on
 * desktop hover.
 */
export function ImageSwiper({
  listing,
  href,
  className,
  sizes = "(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw",
  firstLoading = "lazy",
  quality = 75,
  onSlideClick,
  children,
}: ImageSwiperProps) {
  const { t, locale } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // Only the visible slide and the next one are rendered as real images. Native
  // lazy-loading doesn’t hold back slides that are merely off to the side inside
  // a scroll track, so without this every card downloads every photo up front.
  const [reach, setReach] = useState(1);
  const total = listing.photos.length;
  const title = pick(listing.title, locale);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(next);
    if (next + 1 > reach) setReach(next + 1);
  }

  function goTo(i: number) {
    if (i + 1 > reach) setReach(i + 1);
    trackRef.current?.scrollTo({ left: i * trackRef.current.clientWidth, behavior: "smooth" });
  }

  return (
    <div className={cn("group/swiper relative overflow-hidden bg-slate-100", className ?? "aspect-[4/3]")}>
      {/* Kept LTR so scroll maths stays simple; photo order carries no reading direction. */}
      <div
        ref={trackRef}
        dir="ltr"
        onScroll={handleScroll}
        role="group"
        aria-roledescription="carousel"
        aria-label={interpolate(t.common.photosOf, { title })}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {listing.photos.map((photo, i) => {
          const caption = t.captions[photo.caption];
          const image =
            i <= reach ? (
              <ListingPhoto
                photo={photo}
                alt={`${title}: ${caption}`}
                sizes={sizes}
                quality={quality}
                loading={i === 0 ? firstLoading : "lazy"}
              />
            ) : null;
          // On cards the slides are decorative links (the title is the real link), so they carry no slide semantics.
          const slideProps = href
            ? {}
            : {
                role: "group",
                "aria-roledescription": "slide",
                "aria-label": interpolate(t.common.slideOf, { n: i + 1, total, caption }),
              };
          return (
            <div key={`${photo.caption}-${i}`} {...slideProps} className="relative h-full w-full shrink-0 snap-center">
              {href ? (
                <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
                  {image}
                </Link>
              ) : onSlideClick ? (
                <button
                  type="button"
                  onClick={() => onSlideClick(i)}
                  className="absolute inset-0 cursor-zoom-in"
                  aria-label={interpolate(t.common.openPhoto, { caption })}
                >
                  {image}
                </button>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <span
          dir="ltr"
          className="pointer-events-none absolute bottom-2.5 end-2.5 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-1 text-[12px] font-semibold tabular-nums text-white"
        >
          <CameraIcon className="size-3.5" />
          {index + 1}/{total}
        </span>
      )}

      {total > 1 && (
        <>
          <SwipeArrow side="left" label={t.common.previousPhoto} hidden={index === 0} onClick={() => goTo(index - 1)} />
          <SwipeArrow side="right" label={t.common.nextPhoto} hidden={index === total - 1} onClick={() => goTo(index + 1)} />
        </>
      )}

      {children}
    </div>
  );
}

function SwipeArrow({
  side,
  label,
  hidden,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  hidden: boolean;
  onClick: () => void;
}) {
  // The track is LTR, so these are physical directions and must not mirror.
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={hidden ? -1 : 0}
      aria-label={label}
      className={cn(
        "absolute top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-900 shadow-raise transition-opacity md:grid",
        "opacity-0 focus-visible:opacity-100 group-hover/swiper:opacity-100",
        side === "left" ? "left-2.5" : "right-2.5",
        hidden && "pointer-events-none !opacity-0",
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={side === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}
