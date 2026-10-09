'use client';
import {LocalizedUnit} from '@/components/localized-data';

import { createContext, useContext, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from './app-provider';
import { Button, Field, FormError, Select, Sheet } from './ui';
import { api, lineTotal, minorUnits, money, quantity } from '@/lib/client';
import type { Category } from '@/lib/contracts';
import type { VoiceCommand,VoiceIntent } from '@/lib/voice/os';
import { formVoiceContext,resolveContact,voiceQuantity } from '@/lib/voice/os';
import { osCopy } from '@/lib/voice/os-copy';
import { VoicePanel } from './voice/voice-panel';
import { useDemandWrite } from './demand/write-provider';

export type Action = 'product' | 'customer' | 'supplier' | 'payment' | 'stock' | 'expense' | 'purchase' | 'business';
type ActionData = { productId?: string; customerId?: string; voiceCommand?:VoiceCommand };
type PurchaseDraft = { productId: string; quantity: string; cost: string };
const Operations = createContext<(action: Action, data?: ActionData) => void>(() => {});
export const useOperations = () => useContext(Operations);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const [action, setAction] = useState<Action | null>(null);
  const [data, setData] = useState<ActionData>({});
  const [opening, setOpening] = useState(0);
  return <Operations.Provider value={(nextAction, nextData = {}) => {
    setData(nextData); setAction(nextAction); setOpening(value => value + 1);
  }}>
    {children}
    <OperationSheet key={[app.businessId, opening, action].join('-')} action={action} data={data} onClose={() => setAction(null)} />
  </Operations.Provider>;
}

function OperationSheet({ action, data, onClose }: { action: Action | null; data: ActionData; onClose: () => void }) {
  const { t } = useTranslation();
  const app = useApp();
  const write=useDemandWrite(),copy=osCopy(useTranslation().i18n.language);
  const [values,setValues]=useState<Record<string,string>>({});
  const [voiceBlocked,setVoiceBlocked]=useState(false),[voiceUsed,setVoiceUsed]=useState(Boolean(data.voiceCommand)),[allowDuplicate,setAllowDuplicate]=useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const voiceItemsApplied=useRef(false);
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [productId, setProductId] = useState(data.productId || app.state?.products[0]?.id || '');
  const [customerId, setCustomerId] = useState(data.customerId || '');
  const [reason, setReason] = useState<'receipt' | 'wastage' | 'correction'>('receipt');
  const [items, setItems] = useState<PurchaseDraft[]>([{ productId: app.state?.products[0]?.id || '', quantity: '1', cost: '' }]);
  const titles: Record<Action, string> = {
    product: 'addProduct', customer: 'addCustomer', supplier: 'addSupplier', payment: 'addPayment',
    stock: 'addStock', expense: 'addExpense', purchase: 'newPurchase', business: 'newBusiness',
  };
  if (!action || !app.state) return null;
  const state = app.state;
  const locked=busy||write.busy||Boolean(write.pending)||write.blocked;
  const updateValue=(name:string,value:string)=>setValues(previous=>({...previous,[name]:value}));
  const applyVoice=(command:VoiceCommand)=>{if(locked)return;setVoiceUsed(true);setValues(previous=>({...previous,...Object.fromEntries(command.changed.map(key=>[key,command.fields[key]]))}));if(command.changed.includes('customerId'))setCustomerId(command.fields.customerId);if(action==='purchase'&&(command.changedItems.length||command.removedProducts?.length)){const rows=command.items.filter(item=>item.productId&&voiceQuantity(item,state.products)!==null).map(item=>({productId:item.productId,quantity:String(voiceQuantity(item,state.products)!/1000),cost:item.priceBasis==='unit'?item.price:''}));if(rows.length||command.removedProducts?.length)setItems(rows);voiceItemsApplied.current=true;}setError('');};
  const duplicateContacts=action==='customer'||action==='supplier'?resolveContact(values.name||'',action==='customer'?state.customers:state.suppliers):[];
  const product = state.products.find(item => item.id === productId);
  const customer = state.customers.find(item => item.id === customerId);
  const creditCustomers = state.customers.filter(item => item.balancePaise > 0);
  const updateItem = (index: number, update: Partial<PurchaseDraft>) => setItems(previous => previous.map((item, i) => i === index ? { ...item, ...update } : item));
  let purchaseTotal = 0;
  try {
    purchaseTotal = items.reduce((sum, item) => {
      const fallback = state.products.find(p => p.id === item.productId)?.costPaise ?? 0;
      return sum + lineTotal(item.cost ? minorUnits(item.cost) : fallback, minorUnits(item.quantity, 3));
    }, 0);
  } catch { /* The server validates incomplete drafts when submitted. */ }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? '').trim();
    try {
      if(write.pending){await write.write(write.pending.path,write.pending.body);onClose();return;}
      if(voiceBlocked)throw new Error(copy.missing);
      if (action === 'business') {
        await api('/businesses', { name: value('businessName'), category: value('category') as Category, idempotencyKey });
        window.location.reload(); return;
      }
      let path: string;
      let body: unknown;
      if (action === 'product') {
        path = '/products';
        body = { name: value('name'), sku: value('sku'), unit: value('unit'), pricePaise: minorUnits(value('price')), costPaise: minorUnits(value('cost')), quantityMilli: minorUnits(value('quantity'), 3), minStockMilli: minorUnits(value('minStock'), 3), expiryDate: value('expiry') || null,variation:value('variation') };
      } else if (action === 'customer' || action === 'supplier') {
        path = action === 'customer' ? '/customers' : '/suppliers';
        body = { name: value('name'), phone: value('phone'),idempotencyKey,...voiceUsed&&!allowDuplicate?{rejectDuplicate:true}:{} };
      } else if (action === 'payment') {
        path = '/payments'; body = { customerId, amountPaise: minorUnits(value('amount')), method: value('method'), idempotencyKey };
      } else if (action === 'stock') {
        path = '/stock'; body = { productId, quantityMilli: minorUnits(value('quantity'), 3, reason === 'correction'), reason, idempotencyKey };
      } else if (action === 'expense') {
        path = '/expenses'; body = { description: value('description'), amountPaise: minorUnits(value('amount')), method: value('method'), idempotencyKey };
      } else {
        path = '/purchases';
        body = { supplierId: value('supplierId'), items: items.map(item => ({ productId: item.productId, quantityMilli: minorUnits(item.quantity, 3), costPaise: item.cost ? minorUnits(item.cost) : state.products.find(p => p.id === item.productId)?.costPaise ?? 0 })), paidPaise: minorUnits(value('paid')), idempotencyKey };
      }
      if(action==='product')await app.mutation(path,body);else await write.write(path,body as Record<string,unknown>);
      app.notify(t(action === 'payment' ? 'paymentSaved' : action === 'stock' ? 'stockSaved' : action === 'purchase' ? 'purchased' : 'saved'));
      onClose();
    } catch (failure) { setError(failure instanceof Error&&!(failure as {code?:string}).code?failure.message:app.errorText(failure)); }
    finally { submitting.current = false; setBusy(false); }
  };
  const unavailable = action === 'stock' && !state.products.length || action === 'payment' && !creditCustomers.length || action === 'purchase' && (!state.products.length || !state.suppliers.length);
  return <Sheet title={t(titles[action])} description={t(action === 'payment' ? 'paymentNote' : action === 'purchase' ? 'purchaseHint' : action === 'stock' ? 'stockHint' : 'onboardingHint')} open onOpenChange={open => { if (!open && !submitting.current) onClose(); }} wide={action === 'purchase'}>
    <form onSubmit={submit} className="operation-form">
      {['customer','supplier','payment','purchase','expense'].includes(action)&&<div className="sheet-body"><VoicePanel intent={action as VoiceIntent} seed={data.voiceCommand} onApply={applyVoice} disabled={locked} onBlockedChange={setVoiceBlocked} onCancel={onClose} getContext={command=>formVoiceContext(command,{...values,customerId},action==='purchase'&&voiceItemsApplied.current?items.map(row=>({productId:row.productId,quantity:row.quantity,price:row.cost||undefined})):[],state.products)}/></div>}
      <fieldset disabled={locked} style={{border:0,padding:0,margin:0,minWidth:0}}>
      <div className="sheet-body form-grid">
        {(action === 'product' || action === 'customer' || action === 'supplier') && <>
          <Field label={t(action === 'product' ? 'productName' : 'name')} name="name" required maxLength={100} autoFocus value={values.name||''} onChange={e=>updateValue('name',e.target.value)}/>
          {action !== 'product' && <Field label={t('phone')} name="phone" type="tel" maxLength={30} value={values.phone||''} onChange={e=>updateValue('phone',e.target.value)}/ >}
          {voiceUsed&&duplicateContacts.length>0&&<div className="voiceos-missing"><p>{copy.duplicateContact}</p>{action==='customer'&&duplicateContacts.map(id=><a className="text-link" href={'/app/customers/'+id} key={id}>{copy.existingContact}</a>)}<label><input type="checkbox" checked={allowDuplicate} onChange={e=>setAllowDuplicate(e.target.checked)}/> {copy.allowDuplicate}</label></div>}
        </>}
        {action === 'product' && <>
          <Field label={t('sku')} name="sku" maxLength={64} />
          {state.configuration.features.variants&&<Field label={t('v3:variant')} name="variation" maxLength={100}/>}
          <div className="field-pair"><Field label={t('price')} name="price" inputMode="decimal" required defaultValue="0" /><Field label={t('cost')} name="cost" inputMode="decimal" required defaultValue="0" /></div>
          <Select label={t('sellingUnit')} name="unit" defaultValue={state.business.category === 'vegetables' ? 'kg' : 'piece'}>
            <option value="piece">{t('pieces')}</option><option value="kg">{t('kilograms')}</option><option value="metre">{t('metres')}</option><option value="packet">{t('packets')}</option><option value="box">{t('boxes')}</option>
          </Select>
          <div className="field-pair"><Field label={t('qty')} name="quantity" inputMode="decimal" required defaultValue="0" /><Field label={t('minStock')} name="minStock" inputMode="decimal" required defaultValue="5" /></div>
          {state.configuration.features.expiryTracking && <Field label={t('expiry')} name="expiry" type="date" />}
          <p className="form-note">{t('quantityPrecision')}</p>
        </>}
        {action === 'payment' && <>
          <Select label={t('customer')} value={customerId} required onChange={event => setCustomerId(event.target.value)}>
            <option value="">{t('selectCustomer')}</option>{creditCustomers.map(item => <option key={item.id} value={item.id}>{item.name} · {money(item.balancePaise)}</option>)}
          </Select>
          {customer && <div className="inline-summary"><span>{t('balance')}</span><b>{money(customer.balancePaise)}</b></div>}
          <Field label={t('amount')} name="amount" inputMode="decimal" required value={values.amount||''} onChange={e=>updateValue('amount',e.target.value)}/><PaymentSelect value={values.method||'cash'} onChange={value=>updateValue('method',value)}/>
        </>}
        {action === 'stock' && <>
          <Select label={t('product')} value={productId} required onChange={event => setProductId(event.target.value)}>
            {!state.products.length && <option value="">{t('selectProduct')}</option>}{state.products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
          {product && <div className="inline-summary"><span>{t('stockQty')}</span><b>{quantity(product.quantityMilli)} <LocalizedUnit value={product.unit}/></b></div>}
          <Select label={t('reason')} value={reason} onChange={event => setReason(event.target.value as typeof reason)}><option value="receipt">{t('receipt')}</option>{state.configuration.features.wastageTracking&&<option value="wastage">{t('wastage')}</option>}<option value="correction">{t('correction')}</option></Select>
          <Field label={t('qty')} name="quantity" inputMode={reason === 'correction' ? 'text' : 'decimal'} required /><p className="form-note">{t('quantityPrecision')}</p>
        </>}
        {action === 'expense' && <><Field label={t('expenseDescription')} name="description" required maxLength={200} autoFocus value={values.description||''} onChange={e=>updateValue('description',e.target.value)}/><Field label={t('amount')} name="amount" required inputMode="decimal" value={values.amount||''} onChange={e=>updateValue('amount',e.target.value)}/><PaymentSelect value={values.method||'cash'} onChange={value=>updateValue('method',value)}/></>}
        {action === 'business' && <><Field label={t('businessName')} name="businessName" required maxLength={100} autoFocus /><CategorySelect /></>}
        {action === 'purchase' && <>
          <Select label={t('supplier')} name="supplierId" required value={values.supplierId||''} onChange={e=>updateValue('supplierId',e.target.value)}><option value="">{t('selectSupplier')}</option>{state.suppliers.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</Select>
          {items.map((item, index) => <div className="purchase-item" key={index}>
            <Select label={t('product')} value={item.productId} required onChange={event => updateItem(index, { productId: event.target.value, cost: '' })}>
              {!state.products.length && <option value="">{t('selectProduct')}</option>}{state.products.map(p => <option value={p.id} key={p.id} disabled={items.some((other, i) => i !== index && other.productId === p.id)}>{p.name}</option>)}
            </Select>
            <div className="field-pair"><Field label={t('buyQty')} value={item.quantity} inputMode="decimal" required onChange={event => updateItem(index, { quantity: event.target.value })} /><Field label={t('cost')} value={item.cost} required={voiceUsed&&!state.products.find(p=>p.id===item.productId)?.costPaise} placeholder={String((state.products.find(p => p.id === item.productId)?.costPaise ?? 0) / 100)} inputMode="decimal" onChange={event => updateItem(index, { cost: event.target.value })} /></div>
            {items.length > 1 && <Button type="button" variant="ghost" onClick={() => setItems(previous => previous.filter((_, i) => i !== index))}><Trash2 size={15} />{t('cancel')}</Button>}
          </div>)}
          <Button type="button" variant="secondary" disabled={items.length >= state.products.length || items.length >= 100} onClick={() => setItems(previous => [...previous, { productId: state.products.find(p => !previous.some(row => row.productId === p.id))?.id || '', quantity: '1', cost: '' }])}><Plus size={16} />{t('addItems')}</Button>
          <div className="inline-summary"><span>{t('purchaseTotal')}</span><b>{money(purchaseTotal)}</b></div>
          <Field label={t('supplierPayment')} name="paid" value={values.paid||'0'} onChange={e=>updateValue('paid',e.target.value)} inputMode="decimal" required /><p className="form-note">{t('cashPurchaseOnly')}</p><p className="form-note">{t('purchaseHint')}</p>
        </>}
        <FormError message={error} />
      </div>
      </fieldset>
      <div className="sheet-actions"><Button variant="secondary" type="button" disabled={busy} onClick={onClose}>{t('cancel')}</Button><Button busy={busy} type="submit" disabled={!app.online||unavailable||write.blocked||voiceBlocked||voiceUsed&&duplicateContacts.length>0&&!allowDuplicate}>{t(write.pending?'v3:retry':action === 'purchase' ? 'confirmPurchase' : 'save')}</Button></div>
    </form>
  </Sheet>;
}

export function PaymentSelect({value,onChange}:{value?:string;onChange?:(value:string)=>void}={}) {
  const { t } = useTranslation();
  return <Select label={t('paymentMethod')} name="method" value={value} onChange={e=>onChange?.(e.target.value)}><option value="cash">{t('cash')}</option><option value="upi">{t('upi')}</option></Select>;
}
export function CategorySelect() {
  const { t } = useTranslation();
  return <Select label={t('category')} name="category"><option value="grocery">{t('groceries')}</option><option value="hardware">{t('hardware')}</option><option value="vegetables">{t('vegetables')}</option><option value="mobile">{t('mobile')}</option><option value="clothing">{t('clothing')}</option><option value="general">{t('general')}</option></Select>;
}
