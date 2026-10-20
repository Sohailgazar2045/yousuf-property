import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import en from "@/dictionaries/en";
import { formatArea, formatPrice } from "@/lib/format";
import { getListingBySlug } from "@/lib/listings";

export const alt = "Property listing on Yousif Property Adviser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview WhatsApp shows when someone shares a listing link. English text only (see the site-wide image). */
export default async function ListingImage({ params }: { params: Promise<{ slug: string }> }) {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/logo-512.png"))).toString("base64")}`;
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  const title = listing?.title.en ?? "Property for sale";
  const price = listing ? formatPrice(listing.price, en.units, "en") : "";
  const facts = listing
    ? [en.types[listing.type], formatArea(listing, en.units), `${listing.society.en}, ${en.cities[listing.city]}`]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #faf8f4 0%, #e7e0d0 100%)",
          color: "#0f172a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- OG images render <img>, not next/image */}
              <img src={logo} width={48} height={48} alt="" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#00352c" }}>Yousif Property Adviser</div>
          </div>
          {listing?.verified && (
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "#004d40",
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Verified
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 30, color: "#00594b", fontWeight: 700 }}>{price}</div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {facts.map((fact) => (
              <div
                key={fact}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 14,
                  background: "#ffffff",
                  fontSize: 24,
                  color: "#334155",
                }}
              >
                {fact}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 22, color: "#64748b" }}>{listing ? `Ref ${listing.id}` : ""}</div>
      </div>
    ),
    size,
  );
}
