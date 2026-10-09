'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Printer, Share2 } from 'lucide-react';
import type { Invoice, Payment } from '@/lib/contracts';
import { money, quantity } from '@/lib/client';
import { documentPdf, downloadBlob, type DocumentLine } from '@/lib/browser-documents';
import { Button, FormError } from '../ui';

export function InvoiceActions({ invoice, businessName, payments }: { invoice: Invoice; businessName: string; payments?: Payment[] }) {
  const { t, i18n } = useTranslation(); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [ready, setReady] = useState<File | null>(null); const [note, setNote] = useState('');
  useEffect(() => { setReady(null); setNote(''); }, [invoice, businessName, i18n.language]);
  const labels = i18n.language === 'hi' ? { pdf: 'PDF डाउनलोड', share: 'PDF साझा करें', receipt: 'साधारण बिक्री रसीद · GST कर चालान नहीं', fallback: 'इस ब्राउज़र में फ़ाइल साझा करना उपलब्ध नहीं है। PDF डाउनलोड हो गई।' } : i18n.language === 'hinglish' ? { pdf: 'PDF download', share: 'PDF share karein', receipt: 'Saadharan sale receipt · GST tax invoice nahi', fallback: 'Is browser mein file share uplabdh nahi. PDF download ho gayi.' } : { pdf: 'Download PDF', share: 'Share PDF', receipt: 'Sales receipt · Not a GST tax invoice', fallback: 'File sharing is unavailable in this browser. Your PDF was downloaded.' };
  async function create() {
    const lines: DocumentLine[] = [{ text: invoice.customerName || t('walkIn'), emphasis: true }, { text: `${t('status')}: ${t(invoice.status)}` }];
    invoice.items.forEach(item => { lines.push({ text: `${item.name}${item.variation ? ` · ${item.variation}` : ''}`, value: money(item.totalPaise, i18n.language), emphasis: true }, { text: `${quantity(item.quantityMilli)} ${item.unit} × ${money(item.pricePaise, i18n.language)}` }); (item.attachments || []).forEach(photo => lines.push({ text: '', photoUrl: photo.url })); });
    lines.push({ text: t('subtotal'), value: money(invoice.subtotalPaise) }, { text: t('discount'), value: money(invoice.discountPaise) }, { text: t('total'), value: money(invoice.totalPaise), emphasis: true }, { text: t('received'), value: money(invoice.paidPaise) }, { text: t('due'), value: money(invoice.balancePaise), emphasis: true });
    (payments || invoice.payments || []).filter(p => p.invoiceId === invoice.id).forEach(p => lines.push({ text: `${new Date(p.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} · ${t(p.method)} · ${t(p.kind === 'refund' ? 'cancelled' : p.kind === 'repayment' ? 'olderDues' : 'sales')}`, value: money(p.amountPaise) }));
    lines.push({ text: labels.receipt });
    return documentPdf(businessName, `${invoice.number} · ${new Date(invoice.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, lines);
  }
  async function exportFile(share = false) {
    // Sharing the prepared file happens during a fresh click, preserving browser user activation.
    if (share && ready) { try { if (navigator.canShare?.({ files: [ready] })) await navigator.share({ files: [ready], title: invoice.number }); else { downloadBlob(ready, ready.name); setNote(labels.fallback); } } catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(t('loadError')); } return; }
    setBusy(true); setError(''); setNote('');
    try { const blob = await create(); const filename = `${invoice.number.replace(/[^\p{L}\p{N}._-]/gu, '-')}.pdf`; const file = new File([blob], filename, { type: 'application/pdf' });
      if (share && navigator.canShare?.({ files: [file] })) { setReady(file); setNote(i18n.language === 'hi' ? 'PDF तैयार है। साझा करने के लिए फिर बटन दबाएं।' : i18n.language === 'hinglish' ? 'PDF ready hai. Share button phir dabao.' : 'PDF is ready. Tap Share PDF to choose where to send it.'); }
      else { downloadBlob(blob, filename); if (share) setNote(labels.fallback); }
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(t('loadError')); } finally { setBusy(false); }
  }
  return <div className="invoice-file-actions"><div className="button-row"><Button variant="secondary" busy={busy} onClick={() => exportFile()}><Download size={17}/>{labels.pdf}</Button><Button variant="secondary" disabled={busy} onClick={() => window.print()}><Printer size={17}/>{t('print')}</Button><Button variant="secondary" disabled={busy} onClick={() => exportFile(true)}><Share2 size={17}/>{ready ? labels.share : i18n.language === 'hi' ? 'साझा करने के लिए PDF तैयार करें' : i18n.language === 'hinglish' ? 'Share ke liye PDF taiyar karo' : 'Prepare PDF to share'}</Button></div>{note && <p role="status" className="form-note">{note}</p>}<FormError message={error}/></div>;
}
