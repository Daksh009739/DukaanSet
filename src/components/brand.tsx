'use client';
import Link from "next/link";
import {useTranslation} from 'react-i18next';

/** User-supplied storefront identity, shared by public and authenticated screens. */
export const brand = {
  name: "DukaanSet",
  colors: { teal: "#103B36", mint: "#22C99D", amber: "#F5B942", background: "#F7FAF8" },
  assets: { symbol: "/brand/storefront-symbol.png", horizontal: "/brand/storefront-logo.webp", dark: "/brand/storefront-logo-dark.webp", monochrome: "/brand/logo-mono.svg" },
} as const;

export function BrandSymbol({ className = "", title }: { className?: string; title?: string }) {
  return <img className={`brand-symbol ${className}`} src={brand.assets.symbol} width={512} height={512} alt={title || ''} aria-hidden={!title}/>;
}

export function Logo({ compact = false, inverted = false, className = "", href = "/" }: { compact?: boolean; inverted?: boolean; className?: string; href?: string }) {
  const {t}=useTranslation();return <Link href={href} className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${inverted ? "brand-inverted" : ""} ${className}`} aria-label={t('brandHome')}>
    <BrandSymbol />
    {!compact && <span className="brand-wordmark"><img src={inverted ? brand.assets.dark : brand.assets.horizontal} width={1000} height={187} alt=""/></span>}
  </Link>;
}

export default Logo;
