/*
  Shared control recipes. WhatsApp green is reserved for anything that opens a
  chat; brand emerald is for navigation and committing choices.
*/
const base =
  "inline-flex items-center justify-center gap-2 rounded-(--radius-control) font-semibold transition-colors duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const button = {
  whatsapp: `${base} bg-whatsapp text-whatsapp-ink hover:bg-whatsapp-hover focus-visible:outline-whatsapp`,
  /** Quieter chat button for dense lists (cards): green signal, not a green block. */
  whatsappOutline: `${base} border border-whatsapp bg-white text-slate-900 hover:bg-whatsapp hover:text-whatsapp-ink focus-visible:outline-whatsapp [&>svg]:text-[#13a34a] hover:[&>svg]:text-whatsapp-ink`,
  primary: `${base} bg-brand-800 text-white hover:bg-brand-900 focus-visible:outline-brand-700`,
  outline: `${base} border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-brand-700`,
  onDark: `${base} bg-white text-brand-900 hover:bg-brand-50 focus-visible:outline-white`,
};

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

/** Page-level heading sizes, so every page shares one type scale. */
export const heading = {
  page: "text-[1.75rem] font-bold leading-tight tracking-[-0.015em] text-slate-900 sm:text-[2.125rem]",
  section: "text-[1.375rem] font-bold leading-snug tracking-[-0.01em] text-slate-900 sm:text-[1.625rem]",
  block: "text-lg font-bold text-slate-900",
};
