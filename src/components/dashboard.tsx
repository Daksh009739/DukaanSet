'use client';
import {LocalizedDate} from '@/components/localized-data';
import Link from 'next/link';
import '@/lib/v2-i18n';
import { useTranslation } from 'react-i18next';
import {ReceiptText,ChevronRight,Check,Clock3} from 'lucide-react';
import {useApp} from './app-provider';
import {money} from '@/lib/client';
import {ProductImage} from './inventory/product-image';
import {PremiumDashboard} from './premium-dashboard';
import type { Invoice } from '@/lib/contracts';

export function PageHeading({title,subtitle,action}: {title:string;subtitle?:string;action?:React.ReactNode}) {return <div className="page-heading"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>;}
export function Status({invoice}: {invoice:Invoice}) {const {t}=useTranslation();return <span className={`badge badge-${invoice.status}`}>{invoice.status==='paid'?<Check size={12}/>:invoice.status==='cancelled'?null:<Clock3 size={12}/>} {t(invoice.status)}</span>;}
export function InvoiceList({invoices}: {invoices:Invoice[]}) {
  const {t}=useTranslation();const {session,state}=useApp();
  return <div className="invoice-list"><div className="list-columns"><span>{t('billNumber')} / {t('customer')}</span><span>{t('date')}</span><span>{t('total')}</span><span>{t('status')}</span></div>{invoices.map(invoice=><Link href={`/app/sales/${invoice.id}`} className="invoice-row" key={invoice.id}><div className="invoice-person"><span className="invoice-icon"><ReceiptText size={18}/></span><div><b>{invoice.customerName||t('walkIn')}</b><small>{invoice.number}</small><span className="invoice-product-preview">{invoice.items.slice(0,3).map(item=>{const product=state?.products.find(p=>p.id===item.productId);return product?<ProductImage key={item.productId} product={product} size={25}/>:null;})}</span></div></div><time><LocalizedDate value={invoice.date} options={{day:'numeric',month:'short',timeZone:'Asia/Kolkata'}}/></time><b className="amount">{money(invoice.totalPaise,session?.user.language)}</b><Status invoice={invoice}/><ChevronRight className="mobile-only" size={15}/></Link>)}</div>;
}
export function Dashboard() {return <PremiumDashboard/>;}
