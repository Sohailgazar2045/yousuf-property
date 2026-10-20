import type { Metadata } from "next";
import { ShortlistView } from "@/components/shortlist/ShortlistView";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localePath, type Locale } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo";
import { container } from "@/lib/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/shortlist">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    ...pageMetadata({ locale: lang, path: "/shortlist", title: t.shortlist.metaTitle, description: t.shortlist.metaDescription }),
    // Personal, device-specific page: nothing for search engines here.
    robots: { index: false, follow: true },
  };
}

export default async function ShortlistPage({ params }: PageProps<"/[lang]/shortlist">) {
  const { lang } = await params;
  const t = getDictionary(lang as Locale);

  return (
    <>
      <PageHeader
        breadcrumbLabel={t.common.breadcrumb}
        breadcrumb={[{ href: localePath(lang as Locale), label: t.nav.home }, { label: t.nav.shortlist }]}
        title={t.shortlist.title}
        subtitle={t.shortlist.intro}
      />
      <div className={cn(container, "py-8 pb-28 sm:pb-24")}>
        <ShortlistView />
      </div>
    </>
  );
}
