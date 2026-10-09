'use client';
import '@/lib/v2-i18n';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/lib/contracts';
import {unitText} from '@/lib/locale';
import { minorUnits } from '@/lib/client';
import { useApp } from '../app-provider';
import { Button, Field, FormError, Sheet } from '../ui';

export function ProductEditor({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t,i18n } = useTranslation(); const v = useTranslation('v2').t; const app = useApp();
  const [name, setName] = useState(product.name); const [sku, setSku] = useState(product.sku); const [price, setPrice] = useState(String(product.pricePaise / 100)); const [cost, setCost] = useState(String(product.costPaise / 100));
  const [minimum, setMinimum] = useState(String(product.minStockMilli / 1000)); const [expiry, setExpiry] = useState(product.expiryDate || ''); const [aliases, setAliases] = useState((product.aliases || []).join(', ')); const [barcode, setBarcode] = useState(product.barcode || ''); const [variation, setVariation] = useState(product.variation || ''); const [pack, setPack] = useState(product.packSize ? String(product.packSize) : '');
  const [displayNames,setDisplayNames]=useState(product.displayNames||{});
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (pack && (!/^\d+$/.test(pack) || Number(pack) <= 0)) throw new Error(v('packHint'));
      await app.mutation(`/products/${product.id}/edit`, { displayNames, name: name.trim(), sku: sku.trim(), unit: product.unit, pricePaise: minorUnits(price), costPaise: minorUnits(cost), minStockMilli: minorUnits(minimum, 3), expiryDate: expiry || null, aliases: [...new Set(aliases.split(',').map(s => s.trim()).filter(Boolean))], barcode: barcode.trim(), variation: variation.trim(), packSize: pack ? Number(pack) : null });
      app.notify(v('productSaved')); onClose();
    } catch (cause) { setError(cause instanceof Error && cause.message===v('packHint') ? v('packHint') : app.errorText(cause)); } finally { setBusy(false); }
  }
  return <Sheet open title={v('editProduct')} onOpenChange={value => { if (!value && !busy) onClose(); }}><form className="sheet-body form-stack" onSubmit={save}><Field label={t('productName')} value={name} required maxLength={100} onChange={e => setName(e.target.value)}/><Field label={t('sku')} value={sku} maxLength={64} onChange={e => setSku(e.target.value)}/><div className="form-grid"><Field label={t('price')} required inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)}/><Field label={t('cost')} required inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)}/></div><Field label={t('unit')} value={unitText(product.unit,i18n.language)} readOnly hint={v('immutableUnit')}/><Field label={t('minStock')} value={minimum} inputMode="decimal" required onChange={e => setMinimum(e.target.value)}/>{app.state!.configuration.features.expiryTracking&&<Field label={t('expiry')} type="date" value={expiry} onChange={e => setExpiry(e.target.value)}/>}<Field label={v('aliases')} value={aliases} maxLength={1000} hint={v('aliasesHint')} onChange={e => setAliases(e.target.value)}/>{app.state!.configuration.features.variants&&<Field label={v('variation')} value={variation} maxLength={100} onChange={e => setVariation(e.target.value)}/>}<Field label={v('barcode')} value={barcode} maxLength={80} onChange={e => setBarcode(e.target.value)}/>{app.state!.configuration.features.unitConversion&&<Field label={v('packSize')} value={pack} inputMode="numeric" hint={v('packHint')} onChange={e => setPack(e.target.value)}/>}<fieldset className="form-stack"><legend>{t('localizedNames')}</legend><p className="card-note">{t('localizedNamesHint')}</p>{(['en','hi','hinglish'] as const).map(language=><Field key={language} label={t(language==='en'?'displayNameEn':language==='hi'?'displayNameHi':'displayNameHinglish')} value={displayNames[language]||''} maxLength={100} onChange={event=>setDisplayNames({...displayNames,[language]:event.target.value})}/>)}</fieldset><FormError message={error}/><Button type="submit" busy={busy} disabled={!app.online}>{t('save')}</Button></form></Sheet>;
}
