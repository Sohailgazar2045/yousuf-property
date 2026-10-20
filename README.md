# Yousif Property Adviser

Property listings website for South Punjab (Multan, Muzaffargarh, Bahawalpur, Lodhran, Khanewal), in English and Urdu. Visitors browse and filter listings, then enquire on WhatsApp with the property details already written into the message.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. Listings are stored in a JSON file; there is no database yet.

## Pages

| URL | What it is |
| --- | --- |
| `/en`, `/ur` | Home: hero search, property types, featured listings, cities, how it works |
| `/en/properties` | Search with filters (city, type, budget in Lac/Crore, "no budget limit"), sorting, shareable URLs |
| `/en/properties/<listing>` | Listing detail: gallery, key facts, map, WhatsApp/call, share, similar listings |
| `/en/shortlist` | Saved listings (stored on the visitor's device), one WhatsApp message for all of them |
| `/en/about`, `/en/contact` | About page; contact page with a form that opens WhatsApp |

Visiting `/` or any URL without a language sends people to `/en` or `/ur` based on their browser language, or on the language they last picked.

## Running it

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also validates the JSON data)
npm run start      # serve the production build
npm run lint
npm run typecheck
```

## Editing content

### Business details: `data/site.json`

Phone number, WhatsApp number, address, office hours, email and social links. **Replace the placeholder numbers before going live.**

- `whatsappNumber` / `phoneNumber`: international format, no `+` or spaces, e.g. `923001234567`
- `phoneDisplay`: how the number is shown on the site, e.g. `0300 1234567`
- `email` and `social` links: leave as `""` to hide them

### Listings: `data/listings.json`

Each listing looks like this:

```json
{
  "id": "YPA-MLN-1042",
  "type": "residential-plot",
  "status": "available",
  "price": 32000000,
  "area": { "value": 1, "unit": "kanal" },
  "city": "multan",
  "society": { "en": "DHA Multan", "ur": "ڈی ایچ اے ملتان" },
  "block": { "en": "Sector Q", "ur": "سیکٹر Q" },
  "coordinates": { "lat": 30.247, "lng": 71.456 },
  "beds": 5,
  "baths": 6,
  "title": { "en": "...", "ur": "..." },
  "description": { "en": "...", "ur": "..." },
  "features": [{ "en": "Corner", "ur": "کارنر" }],
  "verified": true,
  "featured": true,
  "listedOn": "2026-10-18",
  "photos": [{ "caption": "frontage", "src": "/listings/ypa-mln-1042/1.jpg" }]
}
```

| Field | Allowed values |
| --- | --- |
| `id` | Unique, capitals/numbers/dashes. It's the reference buyers quote on WhatsApp and is part of the page URL. |
| `type` | `residential-plot`, `house`, `commercial`, `farmhouse`, `agriculture-land` |
| `status` | `available`, `under-offer`, `sold` |
| `price` | Full amount in rupees: 45 Lac = `4500000`, 3.2 Crore = `32000000` |
| `area.unit` | `marla` or `kanal`. Agricultural land shows acres automatically (8 Kanal = 1 Acre). |
| `city` | `multan`, `muzaffargarh`, `bahawalpur`, `lodhran`, `khanewal` |
| `coordinates` | Approximate location for the map. The site says it is approximate. |
| `beds`, `baths` | Optional; leave out for plots and land |
| `featured` | `true` puts it in "Featured properties" on the home page |
| `photos[].caption` | One of the caption keys in `dictionaries/en.ts` → `captions` (e.g. `frontage`, `lawn`, `kitchen`) |
| `photos[].src` | Optional. Put images in `public/listings/<id>/` and reference them as `/listings/<id>/1.jpg`. Without `src`, a neutral "no photo" panel is shown. Use 4:3 landscape photos, about 1600×1200. |

**Replacing a photo:** give the new file a new name (e.g. `1-v2.jpg`) and update its `src`, rather than overwriting the old file. Browsers and the image optimizer cache by file name, so an overwritten photo can keep showing the old picture for a few hours.

**About the current photos:** the sample listings, city tiles and hero images use free-licence stand-in photos from Unsplash (credits in `public/images/CREDITS.md`). Several house exteriors are architectural renders. Replace them with real photos of each property before launch. Buyers trust actual photos far more, and a listing must never show a property it isn't.

`npm run build` checks every listing and stops with a clear message (e.g. `data/listings.json → item 3 (YPA-MLN-1061): "city" must be one of …`) if something is wrong, so a typo can't reach the live site.

### Wording: `dictionaries/en.ts` and `dictionaries/ur.ts`

All interface text, page copy and the WhatsApp message templates. Both files must have the same keys; TypeScript reports anything missing from the Urdu file.

**Please review before launch:** the About page, the "Why buyers work with us" points and the office hours are written as sensible defaults. Make sure they match how the business actually works.

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, **Add New → Project**, import the repository. The defaults are correct.
3. After you connect a custom domain, add the environment variable `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.yousufproperty.pk`) and redeploy. Until then, the site uses its Vercel production address automatically.
4. Optional: enable **Analytics** in the Vercel project to see visits and WhatsApp/call taps, which are tracked as `WhatsApp click` and `Call click` events with the page section they came from.

To update listings later, edit the JSON, commit and push. Vercel rebuilds automatically.

## What's included for production

- English and Urdu with full right-to-left layout and Urdu fonts (Noto Naskh, Noto Nastaliq for headlines)
- SEO: per-page titles and descriptions, canonical and `hreflang` links, `sitemap.xml`, `robots.txt`, JSON-LD (real estate agent, listings, breadcrumbs)
- WhatsApp link previews: generated share images for the site and for every listing
- Security headers (HSTS, frame blocking, no MIME sniffing, referrer and permissions policies)
- Localized 404 and error pages
- Accessibility: keyboard and screen-reader support, focus trapping in the filter panel, 48px touch targets, skip link
- Phone-first layout with safe-area padding for notched phones
- Installable web app manifest and icons

## Project layout

```
app/[lang]/            pages (home, properties, detail, shortlist, about, contact)
app/                   sitemap, robots, manifest, icons
components/            UI (layout, property cards, search, forms)
data/                  listings.json, site.json  ← edit these
dictionaries/          en.ts, ur.ts              ← all text
lib/                   formatting, filters, WhatsApp links, SEO helpers
proxy.ts               language redirect
```

## Next phase

Listings are in a JSON file for now. Moving to a database with an admin panel only needs changes in `lib/listings.ts`; the pages read listings through that one module.
