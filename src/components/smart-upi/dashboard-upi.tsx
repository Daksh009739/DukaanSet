'use client';
import {useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
import Link from 'next/link';
import {QrCode,ArrowUpRight,Copy,Check,Download,RefreshCw} from 'lucide-react';
import {api,money} from '@/lib/client';
import type {UpiCentre} from '@/lib/smart-upi';
import {useApp} from '../app-provider';
import styles from './smart-upi.module.css';
import displayStyles from './dashboard-payment.module.css';
type Display={destination:{upiId:string;payee:string;qrDataUrl:string;state:'saved'}|null};
export function DashboardUpiSummary(){
 const app=useApp(),{t,i18n}=useTranslation('workspace'),[loaded,setLoaded]=useState<{business:string;data:UpiCentre;display:Display}|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0),[copied,setCopied]=useState(false);
 const allowed=app.state!.configuration.permissions.payments,business=app.businessId;
 useEffect(()=>{const controller=new AbortController();setError(false);setCopied(false);if(allowed)void Promise.all([api<UpiCentre>(`/businesses/${business}/smart-upi`,undefined,controller.signal),api<Display>(`/businesses/${business}/smart-upi/display`,undefined,controller.signal)]).then(([data,display])=>{if(!controller.signal.aborted)setLoaded({business,data,display});}).catch(()=>{if(!controller.signal.aborted){setLoaded(null);setError(true);}});return()=>controller.abort();},[business,allowed,app.state,retry]);
 if(!allowed)return null;
 if(error)return <div className={displayStyles.retry} role="status">{t('paymentDisplay.loadFailed')}<button type="button" onClick={()=>setRetry(value=>value+1)}><RefreshCw size={15}/>{t('paymentDisplay.retry')}</button></div>;
 const current=loaded?.business===business?loaded:null;if(!current)return null;const {data,display}=current,destination=display.destination;
 if(!destination&&!data.connections.length)return null;
 return <section className={displayStyles.panel} data-testid="dashboard-payment-display" aria-label={t('paymentDisplay.title')}>
 {destination&&<div className={displayStyles.destination}><div className={displayStyles.identity}><span className={displayStyles.icon} aria-hidden><QrCode size={23}/></span><div><span className={displayStyles.eyebrow}>{t('paymentDisplay.title')}</span><h2>{t('paymentDisplay.yourQr')}</h2></div><span className={displayStyles.saved}>{t('smartUpi.saved')}</span></div><div className={displayStyles.qrLayout}><div className={displayStyles.qr}><img src={destination.qrDataUrl} width={160} height={160} alt={t('paymentDisplay.qrAlt',{payee:destination.payee})}/></div><div className={displayStyles.details}><span>{t('paymentDisplay.payee')}</span><strong>{destination.payee}</strong><span>{t('paymentDisplay.upiId')}</span><div className={displayStyles.upiId}><code>{destination.upiId}</code><button type="button" aria-label={t('paymentDisplay.copy')} onClick={()=>{void navigator.clipboard?.writeText(destination.upiId).then(()=>setCopied(true)).catch(()=>setCopied(false));}}>{copied?<Check size={17}/>:<Copy size={17}/>}</button></div><small role="status">{copied?t('paymentDisplay.copied'):t('paymentDisplay.scanHint')}</small><div className={displayStyles.actions}><a href={destination.qrDataUrl} download="DukaanSet-UPI-QR.png"><Download size={15}/>{t('paymentDisplay.download')}</a><Link href="/app/payments/upi">{t('paymentDisplay.manage')}<ArrowUpRight size={15}/></Link></div></div></div><p className={displayStyles.notice}>{t('paymentDisplay.destinationNote')}</p></div>}
 <div className={`${styles.dashboardSummary} ${displayStyles.summary}`}><span className={styles.softIcon} aria-hidden><QrCode size={23}/></span><div><b>{t('smartUpi.collected')}</b><strong>{money(data.summary.collectedPaise,i18n.language)}</strong>{data.summary.testMode&&<small>{t('smartUpi.testMode')}</small>}</div><p>{data.summary.successful} · {t('smartUpi.successfulCount')}<small>{data.summary.unmatched} · {t('smartUpi.unmatched')}</small></p><Link className={styles.textAction} href="/app/payments/upi">{t('smartUpi.viewPayments')}<ArrowUpRight size={17}/></Link></div>
 </section>;
}
