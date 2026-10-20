import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/*
  Pages are statically generated, so the policy can't use per-request nonces;
  Next's inline bootstrap scripts need 'unsafe-inline'. Everything else is
  locked to this origin, plus Google Maps (iframes) and Vercel Analytics.
*/
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://vitals.vercel-insights.com${isDev ? " ws: wss:" : ""}`,
  "frame-src https://maps.google.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Add "; preload" only once the final domain and all its subdomains are on HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 for cards and thumbnails, 85 for the listing gallery, 90 for the full-screen photo viewer.
    qualities: [75, 85, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    // Default optimizer cache (4 hours): photos in /public keep their file names when
    // replaced, so a long cache would keep serving the old picture.
  },
  experimental: {
    // Inline the (small) stylesheet so phones don't wait on a render-blocking CSS request.
    inlineCss: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
