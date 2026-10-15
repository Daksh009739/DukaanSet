'use client';
import {useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
import Link from 'next/link';
import {QrCode,ArrowUpRight} from 'lucide-react';
import {api,money} from '@/lib/client';
import type {UpiCentre} from '@/lib/smart-upi';
import {useApp} from '../app-provider';
import styles from './smart-upi.module.css';
export function DashboardUpiSummary(){const app=useApp(),{t,i18n}=useTranslation('workspace'),[data,setData]=useState<UpiCentre|null>(null);useEffect(()=>{const controller=new AbortController();if(app.state!.configuration.permissions.payments)void api<UpiCentre>(`/businesses/${app.businessId}/smart-upi`,undefined,controller.signal).then(setData).catch(()=>{});return()=>controller.abort();},[app.businessId]);if(!data||!data.destinations.length&&!data.connections.length)return null;return <section className={styles.dashboardSummary}><span className={styles.softIcon}><QrCode size={23}/></span><div><b>{t('smartUpi.collected')}</b><strong>{money(data.summary.collectedPaise,i18n.language)}</strong>{data.summary.testMode&&<small>{t('smartUpi.testMode')}</small>}</div><p>{data.summary.successful} · {t('smartUpi.successfulCount')}<small>{data.summary.unmatched} · {t('smartUpi.unmatched')}</small></p><Link className={styles.textAction} href="/app/payments/upi">{t('smartUpi.viewPayments')}<ArrowUpRight size={17}/></Link></section>;}
