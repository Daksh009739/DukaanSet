'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import type { Category, Product, SaleAttachment } from '@/lib/contracts';
import { money, quantity } from '@/lib/client';
import { useTranslation } from 'react-i18next';
import { ProductThumbnail } from './product-selector';
import { useSalesCopy } from './sales-copy';
import { SalePhotoUploader } from './sale-photo-uploader';
import { isWholeQuantityUnit } from './sale-draft';
import { useApp } from '../app-provider';

export function SelectedSaleItem({ product, value, total, error, category, attachment, disabled, onValue, onIncrease, onDecrease, onRemove, onAttachment, onUploading }: {
  product: Product; value: string; total: number; error: string; category: Category; attachment?: SaleAttachment; disabled: boolean;
  onValue: (value: string) => void; onIncrease: () => void; onDecrease: () => void; onRemove: () => void;
  onAttachment: (attachment?: SaleAttachment) => void; onUploading: (uploading: boolean) => void;
}) {
  const { t } = useSalesCopy();
  const { t: common } = useTranslation();
  const app=useApp();
  const errorId = `sale-quantity-error-${product.id}`;
  return <article className={`sale-selected-item ${error ? 'sale-item-invalid' : ''}`}>
    <div className="sale-item-heading"><ProductThumbnail category={category} name={product.name} photo={attachment?.url} /><div><h3>{product.name}</h3>{product.variation && <p>{product.variation}</p>}<small>{money(product.pricePaise)} / {product.unit}</small></div><button type="button" className="icon-btn sale-remove" aria-label={`${t('remove')} ${product.name}`} onClick={onRemove} disabled={disabled}><Trash2 size={18} /></button></div>
    <div className="sale-item-controls"><div className="sale-quantity-control"><button type="button" aria-label={`${t('decrease')} ${product.name}`} onClick={onDecrease} disabled={disabled}><Minus size={17} /></button><input aria-label={`${common('qty')} ${product.name}`} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} inputMode={isWholeQuantityUnit(product.unit) ? 'numeric' : 'decimal'} value={value} onChange={event => onValue(event.target.value)} disabled={disabled} /><button type="button" aria-label={`${t('increase')} ${product.name}`} onClick={onIncrease} disabled={disabled}><Plus size={17} /></button></div><span className="sale-unit">{product.unit}</span><strong>{money(total)}</strong></div>
    {error && <p className="sale-field-error" id={errorId} role="alert">{t(error, { count: quantity(product.quantityMilli), unit: product.unit })}</p>}
    {app.state!.configuration.features.photoSales&&<SalePhotoUploader product={product} attachment={attachment} disabled={disabled} onAttachment={onAttachment} onUploading={onUploading} />}
  </article>;
}
