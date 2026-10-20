"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { TYPE_ICONS } from "@/components/property/typeIcons";
import { SelectField } from "@/components/ui/SelectField";
import { trackWhatsApp } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { interpolate } from "@/lib/i18n";
import { CITY_KEYS, TYPE_KEYS } from "@/lib/keys";
import { button } from "@/lib/ui";
import { whatsAppLink } from "@/lib/whatsapp";

/** Accepts 03001234567, 0300-1234567, +92 300 1234567, 923001234567. */
const PK_MOBILE = /^(?:\+?92|0)3\d{9}$/;

interface Values {
  name: string;
  phone: string;
  interest: string;
  city: string;
  budget: string;
  message: string;
}

const INITIAL: Values = { name: "", phone: "", interest: "", city: "", budget: "", message: "" };

export function ContactForm() {
  const { t } = useI18n();
  const id = useId();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  const set = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate() {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = t.contact.required;
    if (!PK_MOBILE.test(values.phone.replace(/[\s-]/g, ""))) next.phone = t.contact.invalidPhone;
    setErrors(next);
    return next;
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    const firstInvalid = (Object.keys(found) as Array<keyof Values>)[0];
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid}`)?.focus();
      return;
    }

    const message = interpolate(t.whatsapp.contact, {
      name: values.name.trim(),
      phone: values.phone.trim(),
      interest: values.interest ? t.types[values.interest as keyof typeof t.types] : t.whatsapp.notSpecified,
      city: values.city ? t.cities[values.city as keyof typeof t.cities] : t.whatsapp.notSpecified,
      budget: values.budget ? t.budget.presets[values.budget as keyof typeof t.budget.presets] : t.whatsapp.notSpecified,
      message: values.message.trim(),
    }).trim();

    trackWhatsApp("contact-form");
    window.open(whatsAppLink(message), "_blank", "noopener,noreferrer");
  }

  const inputClass = (invalid?: boolean) =>
    cn(
      "h-12 w-full rounded-(--radius-control) border bg-white px-3.5 text-[16px] text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:ring-1",
      invalid ? "border-rose-500 focus:ring-rose-500" : "border-slate-300 hover:border-slate-400 focus:border-brand-700 focus:ring-brand-700",
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-name`} label={t.contact.name} error={errors.name}>
          <input
            id={`${id}-name`}
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            placeholder={t.contact.namePlaceholder}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={inputClass(Boolean(errors.name))}
          />
        </Field>
        <Field id={`${id}-phone`} label={t.contact.phone} error={errors.phone}>
          <input
            id={`${id}-phone`}
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
            autoComplete="tel"
            placeholder={t.contact.phonePlaceholder}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
            className={cn(inputClass(Boolean(errors.phone)), "rtl:text-end")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-interest`} label={t.contact.interest} optional={t.contact.optional}>
          <SelectField
            variant="input"
            id={`${id}-interest`}
            label={t.contact.interest}
            value={values.interest}
            onChange={set("interest")}
            options={[
              { value: "", label: t.contact.any },
              ...TYPE_KEYS.map((type) => ({ value: type, label: t.types[type], icon: TYPE_ICONS[type] })),
            ]}
          />
        </Field>
        <Field id={`${id}-city`} label={t.contact.city} optional={t.contact.optional}>
          <SelectField
            variant="input"
            id={`${id}-city`}
            label={t.contact.city}
            value={values.city}
            onChange={set("city")}
            options={[{ value: "", label: t.contact.any }, ...CITY_KEYS.map((city) => ({ value: city, label: t.cities[city] }))]}
          />
        </Field>
      </div>

      <Field id={`${id}-budget`} label={t.contact.budget} optional={t.contact.optional}>
        <SelectField
          variant="input"
          id={`${id}-budget`}
          label={t.contact.budget}
          value={values.budget}
          onChange={set("budget")}
          options={[
            { value: "", label: t.contact.any },
            ...(Object.keys(t.budget.presets) as Array<keyof typeof t.budget.presets>).map((key) => ({
              value: key,
              label: t.budget.presets[key],
            })),
          ]}
        />
      </Field>

      <Field id={`${id}-message`} label={t.contact.message} optional={t.contact.optional}>
        <textarea
          id={`${id}-message`}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          rows={4}
          placeholder={t.contact.messagePlaceholder}
          className={cn(inputClass(), "h-auto resize-y py-3 leading-relaxed")}
        />
      </Field>

      <button type="submit" className={cn(button.whatsapp, "h-12 w-full text-[16px]")}>
        <WhatsAppIcon className="size-5" />
        {t.contact.submit}
      </button>
      <p className="text-[13px] text-slate-600">{t.contact.note}</p>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-slate-800">
        {label}
        {optional && <span className="text-[13px] font-normal text-slate-500">({optional})</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

