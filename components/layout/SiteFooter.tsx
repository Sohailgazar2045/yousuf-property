import Link from "next/link";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { localePath, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CITY_KEYS } from "@/lib/keys";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import { button, container } from "@/lib/ui";
import { generalLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const SOCIAL_LABELS = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok" };

const linkClass = "inline-flex min-h-9 items-center text-[14px] text-brand-100/85 transition-colors hover:text-white";
const rowClass = "flex items-start gap-2.5 py-1.5 text-[14px] leading-relaxed text-brand-100/85";
const iconClass = "mt-[3px] size-4 shrink-0 text-brand-200/70";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  const explore = [
    { href: localePath(locale, "/properties"), label: t.nav.properties },
    { href: localePath(locale, "/shortlist"), label: t.nav.shortlist },
    { href: localePath(locale, "/about"), label: t.nav.about },
    { href: localePath(locale, "/contact"), label: t.nav.contact },
  ];

  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className={cn(container, "grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-12")}>
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-brand-100/80">{t.footer.blurb}</p>
          <WhatsAppLink href={generalLink(t)} source="footer-cta" className={cn(button.whatsapp, "mt-6 h-11 px-4 text-[14px]")}>
            <WhatsAppIcon className="size-[18px]" />
            {t.nav.talkToAdvisor}
          </WhatsAppLink>
          {SOCIAL_LINKS.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {SOCIAL_LINKS.map(([network, url]) => (
                <li key={network}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {SOCIAL_LABELS[network]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterColumn title={t.footer.explore}>
          {explore.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={t.footer.cities}>
          {CITY_KEYS.map((city) => (
            <li key={city}>
              <Link href={`${localePath(locale, "/properties")}?city=${city}`} className={linkClass}>
                {t.cities[city]}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={t.footer.contact}>
          <li>
            <CallLink source="footer" className={cn(rowClass, "font-semibold text-white transition-colors hover:text-brand-200")}>
              <PhoneIcon className={iconClass} />
              <span dir="ltr">{SITE.phoneDisplay}</span>
            </CallLink>
          </li>
          <li>
            <WhatsAppLink href={generalLink(t)} source="footer" className={cn(rowClass, "transition-colors hover:text-white")}>
              <WhatsAppIcon className={iconClass} />
              {t.common.whatsapp}
            </WhatsAppLink>
          </li>
          {SITE.email && (
            <li>
              <a href={`mailto:${SITE.email}`} className={cn(rowClass, "transition-colors hover:text-white")}>
                <MailIcon className={iconClass} />
                {SITE.email}
              </a>
            </li>
          )}
          <li>
            <a
              href={SITE.office.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(rowClass, "transition-colors hover:text-white")}
            >
              <MapPinIcon className={iconClass} />
              {SITE.address[locale]}
            </a>
          </li>
          <li className={rowClass}>
            <ClockIcon className={iconClass} />
            {SITE.hours[locale]}
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div
          className={cn(
            container,
            "flex flex-col gap-3 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[13px] text-brand-100/70 md:flex-row md:justify-between md:gap-10",
          )}
        >
          <p className="shrink-0">
            © {year} {SITE.name[locale]}. {t.footer.rights}
          </p>
          <p className="max-w-2xl md:text-end">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[14px] font-bold text-white">{title}</h2>
      <ul className="mt-3">{children}</ul>
    </div>
  );
}
