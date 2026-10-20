import type { Metadata } from "next";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ArrowRightIcon, ClockIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { CallLink } from "@/components/ui/CallLink";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { SITE, officeMapEmbed } from "@/lib/site";
import { button, container, heading } from "@/lib/ui";
import { generalLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/contact", title: t.contact.metaTitle, description: t.contact.metaDescription });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader
        breadcrumbLabel={t.common.breadcrumb}
        breadcrumb={[{ href: localePath(locale), label: t.nav.home }, { label: t.nav.contact }]}
        title={t.contact.title}
        subtitle={t.contact.intro}
      />

      <div className={cn(container, "grid gap-12 py-10 lg:grid-cols-[1fr_1.25fr] lg:gap-20 lg:py-14")}>
        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className={heading.section}>
            {t.contact.detailsTitle}
          </h2>
          <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
            <li>
              <WhatsAppLink href={generalLink(t)} source="contact-list" className="group block">
                <Row icon={WhatsAppIcon} iconClass="text-[#128C4B]" title={t.contact.whatsappTitle}>
                  <span className="font-semibold text-brand-800 group-hover:underline">{t.contact.whatsappBody}</span>
                </Row>
              </WhatsAppLink>
            </li>
            <li>
              <CallLink source="contact-list" className="group block">
                <Row icon={PhoneIcon} title={t.contact.callTitle}>
                  <span dir="ltr" className="font-semibold text-brand-800 group-hover:underline">
                    {SITE.phoneDisplay}
                  </span>
                </Row>
              </CallLink>
            </li>
            {SITE.email && (
              <li>
                <a href={`mailto:${SITE.email}`} className="group block">
                  <Row icon={MailIcon} title={t.contact.emailTitle}>
                    <span className="font-semibold text-brand-800 group-hover:underline">{SITE.email}</span>
                  </Row>
                </a>
              </li>
            )}
            <li>
              <Row icon={MapPinIcon} title={t.contact.officeTitle}>
                <span className="block">{SITE.address[locale]}</span>
                <a
                  href={SITE.office.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex min-h-10 items-center gap-1 font-semibold text-brand-800 underline-offset-4 hover:underline"
                >
                  {t.contact.directions}
                  <ArrowRightIcon className="size-4" />
                </a>
              </Row>
            </li>
            <li>
              <Row icon={ClockIcon} title={t.contact.hoursTitle}>
                {SITE.hours[locale]}
              </Row>
            </li>
          </ul>

        </section>

        <section aria-labelledby="form-heading">
          <h2 id="form-heading" className={heading.section}>
            {t.contact.formTitle}
          </h2>
          <p className="mt-1.5 text-[15px] text-slate-600">{t.contact.formBody}</p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </section>
      </div>

      <div className={cn(container, "pb-20")}>
        <MapEmbed
          title={t.contact.mapTitle}
          src={officeMapEmbed(locale)}
          className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/8]"
          action={
            <a
              href={SITE.office.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(button.outline, "h-11 px-4 text-[14px] shadow-raise")}
            >
              <MapPinIcon className="size-[18px] text-brand-800" />
              {t.contact.openInMaps}
            </a>
          }
        />
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClass?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-5">
      <Icon className={cn("mt-0.5 size-6 shrink-0 text-brand-800", iconClass)} />
      <div className="text-[15px] text-slate-700">
        <p className="text-[14px] text-slate-600">{title}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
