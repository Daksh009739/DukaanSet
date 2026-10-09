# DukaanSet V2 implementation

9 October 2026. V2 extends the existing local application. Source implementation, automated checks and browser/device verification are distinct evidence; the [V2 test report](v2-test-report.md) records final checks. No hosted deployment, commercial readiness, bank verification or perfect speech accuracy is claimed.

## Implemented product path

The shared sales engine supports product selection, quantity, optional product-linked photo, customer, cash/UPI/split receipts, remaining credit and explicit final confirmation. Server prices and stock are authoritative. Customer creation and language changes can preserve the local draft; a draft is never a saved invoice until the server acknowledges it.

The Fashion demo starts with **Blue Casual Shirt: 4 pieces at ₹899**, Black T-Shirt: 8 at ₹499, Denim Jeans: 6 at ₹1,299, and Rahul Sharma with no prior due. Selling two shirts with ₹1,000 cash and ₹500 recorded UPI produces a ₹1,798 invoice, ₹1,500 received, ₹298 due and two shirts remaining. The backend regression verifies these values, ledger receipts, customer balance, dashboard totals and duplicate replay.

Grocery demo products include Milk (packet), Dal (kg), Onion (kg), Potato (kg), Biscuit (packet), existing branded essentials and English/Hindi/Hinglish aliases. Grocery, hardware and vegetables retain fictional historical invoices and due balances. Fashion starts clean for the exact sales demonstration. All demo sessions remain separate from real merchants.

Voice inventory provides deliberate browser speech activation where supported, spoken-language controls, a clearly identified typed/simulated fallback, English/Hindi/Hinglish product matching, aliases, number/unit parsing, correction/removal, ambiguity review and editable confirmation. Recognition support and accuracy depend on the browser/device; this build does not host a remote STT or LLM service. Stock updates occur only through the authenticated reviewed batch endpoint. Raw audio and transcript text are not stored by the backend.

Customer views use all-ledger totals and server statements. Invoice/statement documents are generated locally as real PDF files with local font rendering. Receipt text explicitly identifies an ordinary sales receipt, not a GST tax invoice. Manual reminder text requires the user to copy/share it; no automatic message is sent.

## Data model and financial rules

- Money is integer paise. Quantity is integer thousandths of the product's unit. Line amounts use integer multiplication with half-up rounding.
- A sale commits invoice snapshot, every receipt, stock movements, quantity changes, audit and idempotent result together.
- `Invoice.payments` contains the invoice's signed ledger records; `paymentMethod` can be `cash`, `upi` or `split`. Manual UPI receipts do not imply provider confirmation.
- Sale and repayment `Payment.amountPaise` are positive; refunds are negative in public DTOs. Raw database/export amounts remain positive magnitudes accompanied by `kind`.
- Customer due is derived from active invoice balances. `Customer.totalSalesPaise` excludes cancelled invoices; `netReceivedPaise` includes signed receipts/repayments/refunds across the complete ledger.
- Full cancellation appends a refund per original cash/UPI receipt and returns stock once. Historical total/items remain; the cancelled DTO has zero current paid/due. Later repayments block cancellation until a reviewed adjustment workflow exists.
- Closing uses India calendar dates, signed cash receipts/refunds, cash expenses and cash paid purchases. UPI is excluded from the cash drawer. Closing locks current-day financial writes; inventory receipts remain possible.
- Product edits preserve historical item name/unit/price/variation/photo snapshots. Units cannot change after a movement. Stock quantity is changed through movements, not product-edit fields.

`BusinessState.totals` exposes complete-ledger sales, received and expenses. `daily` exposes signed cash/UPI, purchase count, all-method expenses, cash expenses/purchase payments, remaining credit on today's active bills and collections against older business-day invoices. These aggregates avoid incorrect totals caused by recent-history limits.

## V2 API contract

All endpoints below require the session cookie and business membership. Writes require a matching Origin, except no business ID is needed for the demo-only account reset.

| Method/path | Accepted input / result |
| --- | --- |
| `POST /api/businesses/:id/invoices` | `idempotencyKey`, items `{productId,quantityMilli,attachmentIds?}`, customer if credit, optional discount/due date, and `payments:[{method:'cash'\|'upi',amountPaise}]`; legacy `paidPaise/paymentMethod` remains supported. If both representations are sent their totals must agree. At most one positive receipt per method. |
| `POST /api/businesses/:id/products/:productId/edit` | Editable name/SKU/unit/prices/minimum/expiry/aliases/barcode/variation/packSize. Existing values persist when omitted. No quantity override. |
| `POST /api/businesses/:id/customers` or `/suppliers` | `name`, optional `phone` and optional `idempotencyKey`. Matching retries return one contact; a changed payload with the same key returns 409. Distinct keys can deliberately create matching name/phone records; no automatic merging. Keyless legacy callers remain supported. |
| `POST /api/businesses/:id/stockbatch` | `{idempotencyKey,source:'voice'\|'manual'\|'mixed',items:[{productId,quantityMilli,unit?}]}`; positive receipts only. Repeated products aggregate safely. Returns `InventoryEntry` with item snapshots and movement IDs. |
| `GET /api/businesses/:id/state` | Includes `inventoryEntries`, all-ledger customer/business aggregates and existing dashboard/catalog/recent histories. |
| `GET /api/businesses/:id/customers/:customerId/statement` | Complete scoped `{customer,invoices,payments}` within the documented download limit. Exceeding the limit returns `STATEMENT_LIMIT`, never a partial statement labelled complete. |
| `POST /api/businesses/:id/attachments` | Raw JPEG/PNG/WebP body; headers `Content-Type`, `X-Product-Id`, `X-Idempotency-Key`. Returns `{id,url,productId,mime,size,date}`. No multipart or arbitrary external image URL. |
| `GET /api/businesses/:id/attachments/:attachmentId` | Authenticated private image response; exact tenant scope, no-store, nosniff and restrictive image CSP. |
| `POST /api/businesses/:id/attachments/:attachmentId/delete` | Delete an unused pending upload; saved invoice photos are immutable. |
| `POST /api/auth/demo/reset` | Reset only the authenticated isolated demo. Retains user, language, session and existing business IDs; returns refreshed Session. Refuses real/shared businesses. |

Existing auth, session, language, business creation, contacts, single stock adjustment, repayments, purchases, expenses, closing, guarded cancellation and export remain supported. Unsupported methods/routes fail safely. New payload fields are strictly checked; JSON requests require `application/json` and are bounded at 64 KiB.

## Unit conversion and history

Stock batches can supply quantities in the canonical product unit or an explicitly compatible input unit. Supported physical conversions are g/gram ↔ kg/kilogram, ml ↔ litre/liter/l, and metre/meter/m synonyms; piece synonyms remain whole quantities. Exact integer conversion refuses a result beyond three decimal places. Weight, volume, length and piece dimensions are never interchanged.

Optional `packSize` is a positive whole count of base units in a box/pack (up to 100,000). A box/pack conversion without saved configuration is rejected. Pack configuration is merchant-entered, not guessed by voice parsing. Aliases are limited to 20 per product; identical aliases on different products remain possible and must produce a product-choice ambiguity.

Inventory entry history includes ID, timestamp, source, final product/name/unit/quantity snapshots and movement IDs. No transcript or raw audio is accepted in that server payload. Repeating an entry creates a new editable draft/key and requires another confirmation; replaying the same key/payload returns the original result without receiving stock twice. Any invalid line rolls back the entire batch.

## Private photo storage and limits

Photos are private SQLite blobs outside `public/`, not object-storage integrations. The HTTP layer checks MIME plus JPEG/PNG/WebP signatures; Sharp fully decodes and re-encodes the image, stripping EXIF/GPS and trailing data. Damaged images, MIME mismatch, unsupported formats, animation, excessive dimensions/pixels or oversized normalized output are rejected.

- Maximum upload/normalized size: 2 MiB.
- Maximum decoded pixels: 16 million; width/height at most 8,192.
- Maximum three photos per invoice item; a photo belongs to its selected product/business and can be committed to one invoice only.
- Maximum 20 pending photos, 1,000 total photos and 100 MiB stored photo bytes per business.
- Pending photos expire after 24 hours; expired pending photos cannot be read/attached. Cleanup runs when storage opens or another photo is uploaded. Saved invoice photos persist with the historical invoice.
- Upload idempotency binds product, MIME and original content digest. Saved photos cannot be deleted or silently reused by a new sale.
- There is no image-based product identification, automatic price extraction or OCR. Local camera/canvas selection is an optional attachment workflow only.

## Storage upgrade and recovery

Node 24 is required. The default file is `.data/dukaanset.sqlite`; `DATABASE_PATH` selects a server-controlled alternative. Foreign keys, WAL and a five-second busy timeout remain enabled.

The V1 → V2 migration adds product metadata, inventory-entry history and protected blobs without replacing merchant tables. Initial bootstrap and forward migration run in one transaction. Migration tests preserve original invoice/product/customer/payment/audit/session records and verify a subsequent reopen. A newer unknown schema is rejected.

No automatic backup service or down migration exists. `npm run backup` now creates and verifies a SQLite-consistent private snapshot; one current V2 snapshot was saved locally during delivery, after the forward migration. It is not a pre-V2 snapshot. Before a real upgrade, retain a SQLite-consistent private backup using a reviewed stopped/checkpointed or SQLite backup process; a raw live-file copy can miss WAL data. To recover, stop the app, restore the consistent pre-upgrade backup and use the matching source version. Do not delete the merchant database as an upgrade technique. Never commit `.data`, WAL files, secrets, passwords or customer records to Git.

Demo reset intentionally recreates only fictional records inside the authenticated demo's exclusive business IDs. It is one transaction, not a database reset. Language and account/session/business IDs remain; product/contact/invoice IDs are reseeded, so client drafts must be cleared/refreshed after reset.

Before a sale is sent, the browser must persist its exact payload and retry key in account/business-scoped sessionStorage. Uncertain responses lock editing, clearing and photo deletion; retry replays that request even if refreshed stock is now lower. Storage denial prevents submission. Malformed stored recovery data blocks a replacement sale and directs the owner to Sales History. Quick customer creation similarly preserves one exact request/key. Logout clears ordinary drafts and voice transcripts but retains the current account's unresolved sale/customer requests for same-tab sign-in recovery. Another account cannot load those keys. Demo reset clears that demo's drafts explicitly. Tab/session loss is still possible: inspect saved history before recreating an uncertain transaction. This is local recovery, not encrypted or multi-device draft storage.

## Bounded reads and honest scope

The aggregate state returns at most 1,000 recent invoices, payments, movements, purchases, expenses and inventory entries; 365 closings and 100 activity rows. Financial/customer aggregates use the full scoped ledger. Complete customer statements allow at most 5,000 invoices, 10,000 payments and 8 MiB of item snapshots; larger histories require the authorized business ledger export or a future paginated document service.

Catalog/contact limits are 2,000 records of each kind per business, and 20 businesses per user. Process-local request throttles exist, including a dedicated upload/reset limit; these are not distributed abuse controls. The application remains suited to a bounded single-node local demonstration/pilot after appropriate operational review.

## Partial, unavailable and future work

| Capability | Actual status |
| --- | --- |
| Staff roles/invitations | Owner workspace only; no invitation or granular staff-permission service |
| Variant matrix / serials / warranty | Optional variation/barcode metadata and independent products; no complete variant/serial/warranty subsystem |
| Product expiry | Product-level date; no purchase-batch expiry/FEFO ledger |
| CSV inventory | Export supported; transactional CSV import remains future work |
| Supplier money | Received purchases record cash paid and due; separate UPI/bank supplier settlement and purchase-order workflow remain future work |
| Returns/exchanges | Audited full cancellation; partial/damaged returns, exchanges and cancellation after repayments require separate reviewed workflows |
| Voice | Browser recognition + reviewed deterministic parsing/manual fallback; no hosted STT, raw-audio storage or accuracy guarantee |
| AI/OCR | Rules-based read-only business summary available; no active LLM or scan-based financial write service |
| Messaging/email/payment integrations | Reminder drafts/local sharing only; no automatic WhatsApp/email sending, recovery delivery, provider-confirmed UPI, subscriptions or government invoicing |
| Offline/PWA/Android | Public offline fallback and scoped local drafts; no offline financial synchronization, proven real HTTPS installation or Android store publication |
| Production operations | Local SQLite and private blobs; PostgreSQL/multi-process verification, managed storage, monitoring, backups/restores, retention/deletion and ingress review remain work |

`npm test` passed **58/58** tests. This includes previous ledgers plus migration, contact retries, split receipts/refunds, photo isolation/validation, atomic batches, complete statements past recent caps, daily aggregates, demo reset, strict HTTP boundaries and voice parsing. Final build/browser/production evidence is maintained in the [V2 QA report](v2-test-report.md).
