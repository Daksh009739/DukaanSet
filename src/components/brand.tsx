import Link from "next/link";

/** Change brand assets and copy here when an official identity is introduced. */
export const brand = {
  name: "DukaanSet",
  tagline: "Apni Dukaan, Sab Set.",
  description: "Your business. All in one place.",
  colors: { teal: "#103B36", mint: "#22C99D", amber: "#F5B942", background: "#F7FAF8" },
  assets: { symbol: "/brand/symbol.svg", horizontal: "/brand/logo.svg", dark: "/brand/logo-dark.svg", monochrome: "/brand/logo-mono.svg" },
} as const;

export function BrandSymbol({ className = "", title }: { className?: string; title?: string }) {
  return <svg className={`brand-symbol ${className}`} viewBox="0 0 48 48" fill="none" role={title ? "img" : undefined} aria-hidden={!title}>
    {title && <title>{title}</title>}
    <rect width="48" height="48" rx="14" fill="currentColor" />
    <path d="M13 21v13a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V21" stroke="var(--brand-symbol-detail, #F7FAF8)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="m15 13-4 8h26l-4-8H15Z" fill="var(--brand-symbol-detail, #F7FAF8)" />
    <path d="m19 27 4 4 7-8" stroke="var(--brand-symbol-accent, #22C99D)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function Logo({ compact = false, inverted = false, className = "", href = "/" }: { compact?: boolean; inverted?: boolean; className?: string; href?: string }) {
  return <Link href={href} className={`brand-logo ${inverted ? "brand-inverted" : ""} ${className}`} aria-label="DukaanSet home">
    <BrandSymbol />
    {!compact && <span>Dukaan<span className="brand-set">Set</span><span className="brand-dot">.</span></span>}
  </Link>;
}

export default Logo;
