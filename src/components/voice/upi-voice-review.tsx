'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useTranslation} from 'react-i18next';
import {ArrowUpRight} from 'lucide-react';
import type {UpiVoiceResult} from '@/lib/voice/smart-upi';
import {Button} from '../ui';
import {TransactionDrawer} from '../smart-upi/smart-upi';
import type {UpiTransaction} from '@/lib/smart-upi';
import {api} from '@/lib/client';
import {useApp} from '../app-provider';
import {useVoiceOS} from './voice-os-provider';
export function UpiVoiceReview({result,query}:{result:UpiVoiceResult|null;query:string}){const app=useApp(),voice=useVoiceOS(),{t}=useTranslation('workspace'),[transaction,setTransaction]=useState<UpiTransaction|null>(null),[busy,setBusy]=useState(false);return <div className="button-row">{result?.review&&<Button variant="secondary" busy={busy} onClick={async()=>{setBusy(true);try{const t=await api<UpiTransaction>(`/businesses/${app.businessId}/smart-upi/transaction/${result.review!.transactionId}`);voice.beginVoiceSetup();setTransaction(t);}catch(cause){app.notify(app.errorText(cause));}finally{setBusy(false);}}}>{t('smartUpi.reconcile')}</Button>}<Link className="text-link" href={'/app/payments/upi?voice='+encodeURIComponent(query)}>{t('smartUpi.viewPayments')}<ArrowUpRight size={16}/></Link>{transaction&&<TransactionDrawer value={transaction} initialDraft={result?.review} onChanged={()=>{void app.refresh();void api<UpiTransaction>(`/businesses/${app.businessId}/smart-upi/transaction/${transaction.id}`).then(setTransaction);}} onClose={()=>{setTransaction(null);voice.resumeAfterVoiceSetup();}}/>}</div>;}
