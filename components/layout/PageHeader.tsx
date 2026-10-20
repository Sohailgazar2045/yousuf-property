import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { container, heading } from "@/lib/ui";

interface Crumb {
  href?: string;
  label: string;
}

interface PageHeaderProps {
  breadcrumb: Crumb[];
  breadcrumbLabel: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-hand slot on wide screens (e.g. a search box); stacks below on phones. */
  aside?: ReactNode;
}

/** The one header treatment shared by every utility page (search, shortlist, contact, 404). */
export function PageHeader({ breadcrumb, breadcrumbLabel, title, subtitle, aside }: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className={cn(container, "py-6 lg:py-8")}>
        <nav aria-label={breadcrumbLabel}>
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-600">
            {breadcrumb.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon className="size-3.5 text-slate-400" aria-hidden="true" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-slate-900 hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-slate-800">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0">
            <h1 className={heading.page}>{title}</h1>
            {subtitle && <p className="mt-1.5 max-w-2xl text-[16px] leading-relaxed text-slate-600">{subtitle}</p>}
          </div>
          {aside && <div className="w-full shrink-0 lg:w-[22rem]">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
