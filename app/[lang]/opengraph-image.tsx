import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Yousif Property Adviser – plots, houses and land across South Punjab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin text only: the built-in OG renderer has no Urdu font, and link previews
// in WhatsApp are small enough that the brand mark carries the recognition.
export default async function OpengraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/logo-512.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #00221c 0%, #004d40 100%)",
          color: "#faf8f4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- OG images render <img>, not next/image */}
              <img src={logo} width={62} height={62} alt="" />
            </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>Yousif Property Adviser</div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#a9d3c9" }}>SOUTH PUNJAB</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            Plots, homes and land across South Punjab
          </div>
          <div style={{ fontSize: 28, color: "#d5eae5" }}>Multan · Muzaffargarh · Bahawalpur · Lodhran · Khanewal</div>
        </div>
      </div>
    ),
    size,
  );
}
