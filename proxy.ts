import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  // Accept-Language looks like "en-US;q=0.5,ur-PK;q=0.9"; rank by q, then take the first we support.
  const ranked = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part, order) => {
      const [tag, ...params] = part.trim().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { code: tag.toLowerCase().split("-")[0], q: Number.isFinite(q) ? q : 0, order };
    })
    .sort((a, b) => b.q - a.q || a.order - b.order);
  for (const { code, q } of ranked) {
    if (q > 0 && isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

/** Every page lives under /en or /ur; send bare URLs to the visitor's language. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, metadata files and anything with a file extension.
  matcher: [
    "/((?!_next|api|favicon.ico|icon|apple-icon|manifest.webmanifest|robots.txt|sitemap.xml|listings/|.*\\.[\\w]+$).*)",
  ],
};
