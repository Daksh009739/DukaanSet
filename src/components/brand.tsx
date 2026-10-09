'use client';
import Link from "next/link";
import {useTranslation} from 'react-i18next';

/** Original connected storefront mark; keep the paths aligned with /brand/symbol.svg. */
export const brand = {
  name: "DukaanSet",
  colors: { teal: "#103B36", mint: "#22C99D", amber: "#F5B942", background: "#F7FAF8" },
  assets: { symbol: "/brand/symbol.svg", horizontal: "/brand/logo.svg", dark: "/brand/logo-dark.svg", monochrome: "/brand/logo-mono.svg" },
} as const;

export function BrandSymbol({ className = "", title }: { className?: string; title?: string }) {
  return <svg className={`brand-symbol ${className}`} viewBox="0 0 48 48" fill="none" role={title ? "img" : undefined} aria-hidden={!title}>
    {title && <title>{title}</title>}
    <rect width="48" height="48" rx="13" fill="currentColor" />
    <path d="m11 19 6-7h14l6 7H11Z" stroke="var(--brand-symbol-detail, #F7FAF8)" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M14 24v11h12c6 0 9-4 9-9v-2" stroke="var(--brand-symbol-detail, #F7FAF8)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m20 26 5 5 10-11" stroke="var(--brand-symbol-accent, #22C99D)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function Logo({ compact = false, inverted = false, className = "", href = "/" }: { compact?: boolean; inverted?: boolean; className?: string; href?: string }) {
  const {t}=useTranslation();return <Link href={href} className={`brand-logo ${inverted ? "brand-inverted" : ""} ${className}`} aria-label={t('brandHome')}>
    <BrandSymbol />
    {!compact && <span>Dukaan<span className="brand-set">Set</span><span className="brand-dot">.</span></span>}
  </Link>;
}

export default Logo;
