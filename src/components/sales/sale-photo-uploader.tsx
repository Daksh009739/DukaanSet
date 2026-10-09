'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Check, ImagePlus, RefreshCw, X } from 'lucide-react';
import type { Product, SaleAttachment } from '@/lib/contracts';
import { RequestError } from '@/lib/client';
import { useApp } from '../app-provider';
import { useSalesCopy } from './sales-copy';
import { restoreAttachment } from './sale-draft';

const photoLimit = 2 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

async function preparePhoto(file: File): Promise<Blob> {
  if (!allowedTypes.includes(file.type)) throw new Error('photoInvalid');
  if (file.size > 20 * 1024 * 1024) throw new Error('photoTooLarge');
  const bitmap = await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40_000_000) throw new Error('photoTooLarge');
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('photoUploadFailed');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.7, 0.5]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= photoLimit) return blob;
    }
    throw new Error('photoTooLarge');
  } finally { bitmap.close(); }
}

export async function removePendingPhoto(businessId: string, id: string) {
  const response = await fetch(`/api/businesses/${businessId}/attachments/${id}/delete`, { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok && response.status !== 404) throw new Error('photoRemoveFailed');
}

export function SalePhotoUploader({ product, attachment, disabled, onAttachment, onUploading }: { product: Product; attachment?: SaleAttachment; disabled: boolean; onAttachment: (value?: SaleAttachment) => void; onUploading: (value: boolean) => void }) {
  const { t } = useSalesCopy();
  const app = useApp();
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const request = useRef<XMLHttpRequest | null>(null);
  const operation = useRef(0);
  const mounted = useRef(true);
  const [pending, setPending] = useState<{ file: File; key: string } | null>(null);
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(Boolean(attachment));
  const currentBusiness = app.businessId;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; operation.current++; request.current?.abort(); }; }, []);
  useEffect(() => {
    if (!pending) { setPreview(''); return; }
    const url = URL.createObjectURL(pending.file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  const upload = async (selection: { file: File; key: string }) => {
    const token = ++operation.current;
    setError(''); setBusy(true); setProgress(0); onUploading(true);
    try {
      const blob = await preparePhoto(selection.file);
      if (!mounted.current || operation.current !== token) return;
      const uploaded = await new Promise<SaleAttachment>((resolve, reject) => {
        const xhr = new XMLHttpRequest(); request.current = xhr;
        xhr.open('POST', `/api/businesses/${currentBusiness}/attachments`);
        xhr.withCredentials = true;
        xhr.timeout = 60_000;
        xhr.setRequestHeader('Content-Type', blob.type);
        xhr.setRequestHeader('X-Product-Id', product.id);
        xhr.setRequestHeader('X-Idempotency-Key', selection.key);
        xhr.upload.addEventListener('progress', event => { if (event.lengthComputable && mounted.current) setProgress(Math.round(event.loaded / event.total * 100)); });
        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status < 200 || xhr.status >= 300) reject(new RequestError(data.error?.code || 'UPLOAD_FAILED', data.error?.message || 'Upload failed.', xhr.status));
            else { const photo = restoreAttachment(data, currentBusiness, product.id); if (photo) resolve(photo); else reject(new Error('photoUploadFailed')); }
          } catch { reject(new Error('photoUploadFailed')); }
        });
        xhr.addEventListener('error', () => reject(new Error('photoUploadFailed')));
        xhr.addEventListener('timeout', () => reject(new Error('photoUploadFailed')));
        xhr.addEventListener('abort', () => reject(new DOMException('Upload cancelled', 'AbortError')));
        xhr.send(blob);
      });
      if (!mounted.current || operation.current !== token) return;
      onAttachment(uploaded); setPending(null);
      if (attachment && attachment.id !== uploaded.id) void removePendingPhoto(currentBusiness, attachment.id).catch(() => {});
    } catch (error) {
      if (mounted.current && operation.current === token && !(error instanceof DOMException && error.name === 'AbortError')) setError(error instanceof Error && ['photoInvalid', 'photoTooLarge'].includes(error.message) ? t(error.message) : t('photoUploadFailed'));
    } finally {
      if (operation.current === token) {
        request.current = null;
        if (mounted.current) { setBusy(false); onUploading(false); }
      }
    }
  };

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || disabled || busy) return;
    const selection = { file, key: crypto.randomUUID() }; setExpanded(true); setPending(selection); void upload(selection);
  };
  const remove = async () => {
    const token = ++operation.current;
    request.current?.abort(); request.current = null; setPending(null); setError('');
    if (!attachment) { setBusy(false); onUploading(false); return; }
    setBusy(true); onUploading(true);
    try { await removePendingPhoto(currentBusiness, attachment.id); if (mounted.current && operation.current === token) onAttachment(undefined); }
    catch { if (mounted.current && operation.current === token) setError(t('photoRemoveFailed')); }
    finally { if (mounted.current && operation.current === token) { setBusy(false); onUploading(false); } }
  };

  return <details className="sale-photo" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
    <summary className="sale-photo-label"><span><Camera size={15} />{t('photo')}</span>{attachment && !pending && <small><Check size={13} />{t('uploaded')}</small>}</summary>
    <input ref={camera} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" aria-label={`${t('takePhoto')} ${product.name}`} onChange={choose} tabIndex={-1} disabled={disabled || busy} />
    <input ref={gallery} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label={`${t('uploadPhoto')} ${product.name}`} onChange={choose} tabIndex={-1} disabled={disabled || busy} />
    {(preview || attachment?.url) && <div className="sale-photo-preview"><img src={preview || attachment!.url} alt={t('photoPreview', { name: product.name })} /><button type="button" className="icon-btn" aria-label={`${t('removePhoto')} ${product.name}`} disabled={disabled} onClick={() => void remove()}><X size={17} /></button></div>}
    {busy ? <div className="sale-upload-progress" role="status"><p>{t('uploading', { progress })}</p><progress value={progress} max={100} aria-label={t('photo')} /></div> : <div className="sale-photo-actions"><button type="button" disabled={disabled} onClick={() => camera.current?.click()}><Camera size={16} />{t('takePhoto')}</button><button type="button" disabled={disabled} onClick={() => gallery.current?.click()}><ImagePlus size={16} />{t(attachment ? 'replacePhoto' : 'uploadPhoto')}</button></div>}
    {error && <div className="sale-photo-error"><p role="alert">{error}</p>{pending && <div><button type="button" disabled={busy || disabled} onClick={() => void upload(pending)}><RefreshCw size={15} />{t('photoRetry')}</button><button type="button" disabled={busy || disabled} onClick={() => { setPending(null); setError(''); }}>{t('withoutPhoto')}</button></div>}</div>}
    {!attachment && !pending && <p className="sale-photo-hint">{t('photoHint')}</p>}
  </details>;
}
