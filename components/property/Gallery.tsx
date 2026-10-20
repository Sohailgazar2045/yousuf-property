"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CameraIcon, XIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/cn";
import { interpolate, pick } from "@/lib/i18n";
import type { Listing } from "@/lib/listings";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { ImageSwiper } from "./ImageSwiper";
import { ListingPhoto } from "./ListingPhoto";

interface GalleryProps {
  listing: Listing;
  /** Badges shown on top of the gallery. */
  overlay?: ReactNode;
  /** Controls pinned to the top-end corner (save, share). */
  actions?: ReactNode;
}

/*
  The lead photo appears twice in the DOM (phone carousel, desktop mosaic), with
  only one visible per breakpoint. Giving both copies the same sizes and quality
  makes the browser pick the same srcset candidate, so it is downloaded once.
*/
const LEAD_SIZES = "(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw";

/** Grid placement for the thumbnails beside the lead photo, by how many there are. */
const THUMB_LAYOUT: Record<number, string[]> = {
  1: ["col-span-2 row-span-2"],
  2: ["col-span-2", "col-span-2"],
  3: ["", "", "col-span-2"],
  4: ["", "", "", ""],
};

/** Mosaic on desktop, swipe carousel on phones; either opens a full-screen viewer. */
export function Gallery({ listing, overlay, actions }: GalleryProps) {
  const { t, locale } = useI18n();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const title = pick(listing.title, locale);
  const photos = listing.photos;
  const thumbs = photos.slice(1, 5);
  const placement = THUMB_LAYOUT[thumbs.length] ?? [];

  return (
    <>
      {/* Phones and small tablets */}
      <div className="-mx-4 sm:mx-0 md:hidden">
        <ImageSwiper
          listing={listing}
          firstLoading="eager"
          sizes={LEAD_SIZES}
          quality={85}
          className="aspect-[4/3] sm:overflow-hidden sm:rounded-(--radius-card)"
          onSlideClick={setViewerIndex}
        >
          <div className="pointer-events-none absolute start-3 top-3 flex flex-wrap gap-1.5">{overlay}</div>
          <div className="absolute end-3 top-3 flex gap-2">{actions}</div>
        </ImageSwiper>
      </div>

      {/* Desktop mosaic */}
      <div
        className={cn(
          "relative hidden gap-2 overflow-hidden rounded-(--radius-card) md:grid",
          thumbs.length > 0 ? "aspect-[21/9] grid-cols-4 grid-rows-2" : "aspect-[21/9]",
        )}
      >
        <MosaicTile
          className={thumbs.length > 0 ? "col-span-2 row-span-2" : "h-full"}
          onClick={() => setViewerIndex(0)}
          label={interpolate(t.common.openPhoto, { caption: t.captions[photos[0].caption] })}
        >
          <ListingPhoto
            photo={photos[0]}
            alt={`${title}: ${t.captions[photos[0].caption]}`}
            sizes={LEAD_SIZES}
            loading="eager"
            quality={85}
          />
        </MosaicTile>
        {thumbs.map((photo, i) => (
          <MosaicTile
            key={`${photo.caption}-${i}`}
            className={placement[i]}
            onClick={() => setViewerIndex(i + 1)}
            label={interpolate(t.common.openPhoto, { caption: t.captions[photo.caption] })}
          >
            <ListingPhoto photo={photo} alt={`${title}: ${t.captions[photo.caption]}`} sizes="(min-width: 1280px) 620px, 50vw" quality={85} />
          </MosaicTile>
        ))}

        <div className="pointer-events-none absolute start-3 top-3 flex flex-wrap gap-1.5">{overlay}</div>
        <div className="absolute end-3 top-3 flex gap-2">{actions}</div>

        <button
          type="button"
          onClick={() => setViewerIndex(0)}
          className="absolute bottom-3 end-3 inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-[14px] font-semibold text-slate-900 shadow-raise transition-colors hover:bg-slate-50"
        >
          <CameraIcon className="size-4" />
          {interpolate(t.detail.showAllPhotos, { n: photos.length })}
        </button>
      </div>

      {viewerIndex !== null && (
        <PhotoViewer listing={listing} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>
  );
}

function MosaicTile({
  children,
  className,
  onClick,
  label,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("relative cursor-zoom-in overflow-hidden bg-slate-100 after:absolute after:inset-0 after:bg-slate-950/0 after:transition-colors hover:after:bg-slate-950/10", className)}
    >
      {children}
    </button>
  );
}

function PhotoViewer({ listing, startIndex, onClose }: { listing: Listing; startIndex: number; onClose: () => void }) {
  const { t, locale } = useI18n();
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = listing.photos.length;
  const photo = listing.photos[index];
  const title = pick(listing.title, locale);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + total) % total), [total]);

  // Modal behaviour: focus in, Tab trapped, page behind inert, focus back on close.
  useDialogFocus(true, dialogRef, { initialFocus: closeRef });

  // The parent passes a fresh onClose each render; read it through a ref so the
  // listeners below are attached once.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  // Horizontal swipe to change photo.
  const touchX = useRef<number | null>(null);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={interpolate(t.common.photosOf, { title })}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex animate-fade flex-col bg-slate-950 text-white outline-none"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-2 pt-safe sm:px-4">
        <p dir="ltr" aria-live="polite" className="px-2 text-[15px] font-bold tabular-nums text-white">
          {index + 1} / {total}
        </p>
        <p className="hidden truncate px-4 text-[15px] font-semibold sm:block">{title}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="grid size-12 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <XIcon className="size-6" />
        </button>
      </div>

      <div className="relative flex-1">
        <ListingPhoto
          key={index}
          photo={photo}
          alt={`${title}: ${t.captions[photo.caption]}`}
          sizes="100vw"
          fit="contain"
          quality={90}
          loading="eager"
          className="animate-fade bg-transparent"
        />
        {total > 1 && (
          <div dir="ltr" className="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-6">
            <ViewerArrow side="left" label={t.common.previousPhoto} onClick={() => go(-1)} />
            <ViewerArrow side="right" label={t.common.nextPhoto} onClick={() => go(1)} />
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-safe pt-3">
        <p className="text-center text-[14px] text-white/85">{t.captions[photo.caption]}</p>
        {total > 1 && (
          <ul dir="ltr" className="mx-auto mt-3 hidden max-w-full justify-center gap-2 overflow-x-auto pb-3 md:flex">
            {listing.photos.map((p, i) => (
              <li key={`${p.caption}-${i}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={interpolate(t.common.openPhoto, { caption: t.captions[p.caption] })}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "relative block h-14 w-20 overflow-hidden rounded-md transition-opacity",
                    i === index ? "opacity-100 ring-2 ring-white" : "opacity-55 hover:opacity-90",
                  )}
                >
                  <ListingPhoto photo={p} alt="" sizes="80px" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}

function ViewerArrow({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto grid size-12 place-items-center rounded-full bg-slate-950/60 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-slate-950/80"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={side === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}
