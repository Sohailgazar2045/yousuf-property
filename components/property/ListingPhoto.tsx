import Image from "next/image";
import { CameraIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { ListingPhoto as Photo } from "@/lib/listings";

/**
 * - "lazy": default, for anything that may start off-screen.
 * - "eager": in the first viewport; fetched immediately at high priority, no <link rel=preload>.
 * - "preload": the page's likely LCP image; also emits a preload link in <head>.
 */
export type PhotoLoading = "lazy" | "eager" | "preload";

interface ListingPhotoProps {
  photo: Photo;
  alt: string;
  sizes: string;
  loading?: PhotoLoading;
  fit?: "cover" | "contain";
  /** Must be one of next.config images.qualities. */
  quality?: 75 | 85 | 90;
  className?: string;
}

/** A listing photo, or a quiet neutral panel while the owner's photos are pending. */
export function ListingPhoto({ photo, alt, sizes, loading = "lazy", fit = "cover", quality = 75, className }: ListingPhotoProps) {
  if (photo.src) {
    return (
      <Image
        src={photo.src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        preload={loading === "preload"}
        loading={loading === "lazy" ? "lazy" : "eager"}
        fetchPriority={loading === "lazy" ? undefined : "high"}
        className={cn(fit === "cover" ? "object-cover" : "object-contain", className)}
      />
    );
  }

  return (
    <div className={cn("absolute inset-0 grid place-items-center bg-slate-100 text-slate-400", className)} role="img" aria-label={alt}>
      <CameraIcon className="size-8" />
    </div>
  );
}
