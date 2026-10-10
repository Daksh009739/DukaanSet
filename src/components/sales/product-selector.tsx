'use client';

import { Package, Plus, Search, Shirt } from 'lucide-react';
import type { Product, Category } from '@/lib/contracts';
import {useTranslation} from 'react-i18next';
import {unitText} from '@/lib/locale';
import {ProductName} from '../localized-data';
import { money, quantity } from '@/lib/client';
import { useState } from 'react';
import { useSalesCopy } from './sales-copy';
import { ProductImage } from '../inventory/product-image';
import { DemandButton } from '../demand/capture';

export function ProductThumbnail({ category, name, photo }: { category?: Category; name: string; photo?: string }) {
  return <span className={`sale-thumbnail ${category === 'clothing' ? 'sale-thumbnail-fashion' : ''}`}>
    {photo ? <img src={photo} alt={name} /> : category === 'clothing' ? <Shirt size={28} strokeWidth={1.5} aria-hidden /> : <Package size={26} strokeWidth={1.5} aria-hidden />}
  </span>;
}

export function ProductSelector({ products, category, selected, onAdd, disabled, frequentIds }: { products: Product[]; category: Category; selected: Record<string, string>; onAdd: (id: string) => void; disabled: boolean; frequentIds: string[] }) {
  const { t } = useSalesCopy();const {i18n}=useTranslation();
  const [search, setSearch] = useState('');
  const words = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = [...products].sort((a, b) => Number(frequentIds.includes(b.id)) - Number(frequentIds.includes(a.id))).filter(product => {
    const text = `${product.name} ${product.sku} ${product.variation} ${product.barcode} ${Object.values(product.displayNames||{}).join(' ')} ${(product.aliases || []).join(' ')}`.toLocaleLowerCase();
    return words.every(word => text.includes(word));
  });
  return <section className="sale-section sale-products" aria-labelledby="sale-product-heading">
    <div className="sale-section-heading"><div><span className="sale-section-number">01</span><h2 id="sale-product-heading">{t('selectProducts')}</h2></div><span className="sale-count">{products.length}</span></div>
    <p className="sale-section-hint">{t('productHint')}</p>
    <label className="sale-search"><Search size={19} aria-hidden /><span className="sr-only">{t('searchProducts')}</span><input type="search" aria-label={t('searchProducts')} value={search} placeholder={t('searchProducts')} onChange={event => setSearch(event.target.value)} /></label>
    <div className="sale-product-grid">
      {filtered.map(product => <div className="sale-product-option" key={product.id}><button type="button" className={`sale-product pick-product ${selected[product.id] ? 'sale-product-selected' : ''}`} onClick={() => onAdd(product.id)} disabled={disabled || product.quantityMilli <= 0}>
        <ProductImage product={product} size={56}/>
        <span className="sale-product-name"><b><ProductName product={product}/></b>{product.variation && <small>{product.variation}</small>}<small>{product.quantityMilli > 0 ? t('available', { count: quantity(product.quantityMilli), unit: unitText(product.unit,i18n.language) }) : t('outOfStock')}</small>{frequentIds.includes(product.id) && <span className="sale-frequent-label">{t('frequent')}</span>}</span>
        <span className="sale-product-bottom"><strong>{money(product.pricePaise)}</strong><span className="sale-product-add"><Plus size={18} aria-hidden /></span></span>
      </button>{product.quantityMilli<=0&&<DemandButton product={product} compact/>}</div>)}
    </div>
    {!filtered.length && <p className="sale-inline-empty">{t('noResults')}</p>}
    <div className="below-card"><DemandButton/></div>
  </section>;
}
