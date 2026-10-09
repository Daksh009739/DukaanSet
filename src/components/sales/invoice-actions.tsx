'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Printer, Share2 } from 'lucide-react';
import type { Invoice, Payment } from '@/lib/contracts';
import {dateText,unitText,renderSystemMessage} from '@/lib/locale';
import { money, quantity } from '@/lib/client';
import { documentPdf, downloadBlob, type DocumentLine } from '@/lib/browser-documents';
import { Button, FormError } from '../ui';

export function InvoiceActions({ invoice, businessName, payments }: { invoice: Invoice; businessName: string; payments?: Payment[] }) {
  const { t, i18n } = useTranslation(); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [ready, setReady] = useState<File | null>(null); const [note, setNote] = useState('');
  const operation=useRef(0);
  useEffect(() => { operation.current++; setReady(null); setNote(''); setBusy(false); return ()=>{operation.current++;}; }, [invoice, businessName, i18n.language]);
  const labels={pdf:t('pdfDownload'),share:t('pdfShare'),receipt:t('pdfReceipt'),fallback:t('pdfFallback')};
  async function create() {
    const lines: DocumentLine[] = [{text:t('invoiceTitle'),emphasis:true},{ text: t('customer')+': '+(invoice.customerName || t('walkIn')), emphasis: true }, { text: `${t('status')}: ${t(invoice.status)}` }];
    invoice.items.forEach(item => { lines.push({ text: `${t('product')}: ${item.name}${item.variation ? ` · ${item.variation}` : ''}`, value: money(item.totalPaise, i18n.language), emphasis: true }, { text: `${t('qty')}: ${quantity(item.quantityMilli)} ${unitText(item.unit,i18n.language,item.quantityMilli/1000)} · ${t('price')}: ${money(item.pricePaise, i18n.language)}` }); (item.attachments || []).forEach(photo => lines.push({ text: '', photoUrl: photo.url })); });
    lines.push({ text: t('subtotal'), value: money(invoice.subtotalPaise) }, { text: t('discount'), value: money(invoice.discountPaise) }, { text: t('total'), value: money(invoice.totalPaise), emphasis: true }, { text: t('received'), value: money(invoice.paidPaise) }, { text: t('due'), value: money(invoice.balancePaise), emphasis: true });
    (payments || invoice.payments || []).filter(p => p.invoiceId === invoice.id).forEach(p => lines.push({ text: `${dateText(p.date,i18n.language)} · ${t(p.method)} · ${t(p.kind === 'refund' ? 'cancelled' : p.kind === 'repayment' ? 'olderDues' : 'sales')}`, value: money(p.amountPaise) }));
    lines.push({ text: labels.receipt });
    return documentPdf(businessName, `${t('billNumber')}: ${invoice.number} · ${t('date')}: ${dateText(invoice.date,i18n.language,{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'})}`, lines);
  }
  async function exportFile(share = false) {
    // Sharing the prepared file happens during a fresh click, preserving browser user activation.
    if (share && ready) { try { if (navigator.canShare?.({ files: [ready] })) await navigator.share({ files: [ready], title: invoice.number }); else { downloadBlob(ready, ready.name); setNote(labels.fallback); } } catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(t('loadError')); } return; }
    const request=++operation.current;setBusy(true); setError(''); setNote('');
    try { const blob = await create(); if(request!==operation.current)return;const filename = `${invoice.number.replace(/[^\p{L}\p{N}._-]/gu, '-')}.pdf`; const file = new File([blob], filename, { type: 'application/pdf' });
      if (share && navigator.canShare?.({ files: [file] })) { setReady(file); setNote(t('pdfReady')); }
      else { downloadBlob(blob, filename); if (share) setNote(labels.fallback); }
    } catch (cause) { if (request===operation.current&&!(cause instanceof DOMException && cause.name === 'AbortError')) setError(t('loadError')); } finally { if(request===operation.current)setBusy(false); }
  }
  return <div className="invoice-file-actions"><div className="button-row"><Button variant="secondary" busy={busy} onClick={() => exportFile()}><Download size={17}/>{labels.pdf}</Button><Button variant="secondary" disabled={busy} onClick={() => window.print()}><Printer size={17}/>{t('print')}</Button><Button variant="secondary" disabled={busy} onClick={() => exportFile(true)}><Share2 size={17}/>{ready ? labels.share : t('pdfPrepare')}</Button></div>{note && <p role="status" className="form-note">{renderSystemMessage(note,i18n.language)}</p>}<FormError message={error}/></div>;
}
