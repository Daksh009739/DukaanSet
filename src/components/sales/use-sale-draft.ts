'use client';

import { useEffect, useState, type SetStateAction } from 'react';
import { freshDraft, restoreDraft, type PendingSale, type SaleDraft } from './sale-draft';

export function useSaleDraft(storageKey: string, businessId: string) {
  const [draft, storeDraft] = useState<SaleDraft>(freshDraft);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let raw: string | null = null;
    try { raw = sessionStorage.getItem(storageKey); storeDraft(restoreDraft(raw, businessId)); }
    catch { storeDraft({ ...freshDraft(), recoveryBlocked: Boolean(raw) }); setStorageError(true); }
    setHydrated(true);
  }, [storageKey, businessId]);

  useEffect(() => {
    if (!hydrated || draft.recoveryBlocked) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify(draft)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [draft, hydrated, storageKey]);

  const setDraft = (action: SetStateAction<SaleDraft>) => storeDraft(previous => previous.pendingSale || previous.recoveryBlocked ? previous : typeof action === 'function' ? action(previous) : action);
  const update = (values: Partial<SaleDraft>) => setDraft(previous => ({ ...previous, ...values }));
  const remember = (next: SaleDraft) => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); setStorageError(false); storeDraft(next); return true; }
    catch { setStorageError(true); return false; }
  };
  const clear = () => { if (!draft.pendingSale && !draft.recoveryBlocked) remember(freshDraft()); };
  const complete = (invoiceId: string) => { const next = { ...freshDraft(), savedInvoiceId: invoiceId }; remember(next); storeDraft(next); };
  // Persist synchronously before sending. No request goes out without its recovery key and immutable body.
  const freeze = (pendingSale: PendingSale) => remember({ ...draft, pendingSale });
  const reject = () => { const next = { ...draft, pendingSale: null }; remember(next); storeDraft(next); };
  const markConflict = (pendingSale: PendingSale) => { const next = { ...draft, pendingSale: { ...pendingSale, conflict: true } }; remember(next); storeDraft(next); };
  return { draft, setDraft, update, clear, complete, remember, freeze, reject, markConflict, hydrated, storageError };
}
