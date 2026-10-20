/*
  Fixed vocabularies shared by data, dictionaries and UI. Kept separate from
  lib/listings.ts so client components can import them without pulling the
  listings data into their bundle.
*/

export const CITY_KEYS = ["multan", "muzaffargarh", "bahawalpur", "lodhran", "khanewal"] as const;
export type CityKey = (typeof CITY_KEYS)[number];

export const TYPE_KEYS = ["residential-plot", "house", "commercial", "farmhouse", "agriculture-land"] as const;
export type TypeKey = (typeof TYPE_KEYS)[number];

export const STATUS_KEYS = ["available", "under-offer", "sold"] as const;
export type ListingStatus = (typeof STATUS_KEYS)[number];

/** Photo captions available to listings; each needs text in both dictionaries. */
export const CAPTION_KEYS = [
  "frontage",
  "boulevard",
  "park",
  "elevation",
  "drawing",
  "bedroom",
  "rooftop",
  "street",
  "shopfront",
  "mezzanine",
  "road",
  "lawn",
  "orchard",
  "lounge",
  "approach",
  "kitchen",
  "porch",
  "crop",
  "watercourse",
  "gate",
  "depth",
  "market",
  "basement",
  "bazaar",
  "tubewell",
  "pool",
  "veranda",
] as const;
export type CaptionKey = (typeof CAPTION_KEYS)[number];
