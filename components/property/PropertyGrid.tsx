import { cn } from "@/lib/cn";
import type { Listing } from "@/lib/listings";
import { PropertyCard } from "./PropertyCard";

interface PropertyGridProps {
  listings: Listing[];
  /** Stagger the entrance; used where results change in response to filters. */
  animate?: boolean;
  /** How many leading cards are in the first viewport (their first photo is preloaded). */
  aboveFold?: number;
  className?: string;
}

export function PropertyGrid({ listings, animate, aboveFold = 0, className }: PropertyGridProps) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {listings.map((listing, i) => (
        <li
          key={listing.id}
          className={animate ? "animate-rise" : undefined}
          style={animate ? { animationDelay: `${Math.min(i, 8) * 40}ms` } : undefined}
        >
          <PropertyCard listing={listing} firstLoading={i < aboveFold ? "preload" : "lazy"} />
        </li>
      ))}
    </ul>
  );
}
