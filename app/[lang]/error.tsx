"use client";

import { useEffect } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { cn } from "@/lib/cn";
import { button, container } from "@/lib/ui";
import { generalLink } from "@/lib/whatsapp";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    // The digest matches the server log entry for this failure.
    console.error(error.digest ?? "", error);
  }, [error]);

  return (
    <div className={cn(container, "py-20 lg:py-28")}>
      <h1 className="text-[28px] font-extrabold tracking-[-0.015em] text-slate-900 sm:text-[34px]">{t.errors.errorTitle}</h1>
      <p className="mt-3 max-w-md text-[16px] leading-relaxed text-slate-600">{t.errors.errorBody}</p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={reset} className={cn(button.primary, "h-12 px-6 text-[15px]")}>
          {t.errors.retry}
        </button>
        <WhatsAppLink href={generalLink(t)} source="error-page" className={cn(button.whatsapp, "h-12 px-6 text-[15px]")}>
          <WhatsAppIcon className="size-[18px]" />
          {t.common.whatsapp}
        </WhatsAppLink>
      </div>
    </div>
  );
}
