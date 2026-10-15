import type {Store} from './store';
import type {PaymentLinkExplanation,LinkReason} from '../payment-companion';

export function paymentLinkExplanation(store:Store,business:string,id:string,customerId:string|null):PaymentLinkExplanation {
 const allocated=Boolean(store.db.prepare('SELECT id FROM upi_allocations WHERE business_id=? AND transaction_id=? LIMIT 1').get(business,id));
 if(!customerId)return{reason:'unlinked',at:null,reference:null,canCorrect:!allocated};
 const audit=store.db.prepare('SELECT reason,created_at FROM upi_customer_link_audit WHERE business_id=? AND transaction_id=? AND customer_id=? ORDER BY rowid DESC LIMIT 1').get(business,id,customerId);
 // Invoice provenance is written only after authoritative provider QR-to-payment verification.
 const proof=store.db.prepare('SELECT reference,created_at FROM upi_invoice_link_proofs WHERE business_id=? AND transaction_id=? AND customer_id=?').get(business,id,customerId);
 const reasons:Record<string,LinkReason>={reliable_payer:'reliablePayer',confirmed_payer_backfill:'reliablePayer',merchant_confirmed:'merchantConfirmed',allocation_confirmed:'allocationConfirmed'};
 return{reason:proof?'invoiceReference':reasons[String(audit?.reason)]||'legacyAssociation',at:proof?String(proof.created_at):audit?String(audit.created_at):null,reference:proof?String(proof.reference):null,canCorrect:!allocated};
}
