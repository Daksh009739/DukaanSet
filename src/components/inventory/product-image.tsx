'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Apple, Shirt, Milk, Wheat, Wrench, Smartphone } from 'lucide-react';
import type { Product } from '@/lib/contracts';
import { productIdentity } from '@/lib/product-media';

/** Stored association only: rendering never searches an external provider. */
export function ProductImage({ product, size = 46, className = '' }: { product: Product; size?: number; className?: string }) {
  const [failed, setFailed] = useState(''), w = useTranslation('workspace').t, identity = productIdentity(product), url = product.media?.url;
  const Icon = identity.category === 'produce' ? Apple : identity.category === 'drink' ? Milk : identity.category === 'food' ? Wheat : identity.category === 'clothing' ? Shirt : identity.category === 'hardware' ? Wrench : identity.category === 'mobile' ? Smartphone : Package;
  return <span className={`product-image product-image-${identity.category} ${className}`} title={product.media?.attribution ? w('thumbnailCredit', { author: product.media.attribution, license: product.media.license }) : undefined} style={{ width: size, height: size }}>
    {url && failed !== url ? <img src={url} alt={product.name} width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(url)} /> : <Icon size={Math.round(size * .52)} strokeWidth={1.6} aria-hidden />}
  </span>;
}
