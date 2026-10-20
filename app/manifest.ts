import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yousif Property Adviser",
    short_name: "Yousif Property",
    description: "Plots, houses, commercial property, farmhouses and agricultural land across South Punjab.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#004d40",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
