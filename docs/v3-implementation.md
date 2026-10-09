# DukaanSet V3 implementation and limits

9 October 2026. This extends the existing V2 Next/React/TypeScript application. The supplied [master prompt](briefs/v3-master.md) is preserved verbatim. V2 sales, stock, customers, signed payments, photos, PDFs, voice review and demo isolation remain connected to the same transactional services. [QA evidence](v3-test-report.md) describes what was actually verified.

## Feature completion

| Requested area | Delivered behavior | Remaining boundary |
| --- | --- | --- |
| Account lifecycle | Minimal registration, confirmed password, actual email-link verification, resend, generic recovery, one-use reset, profile/language/password settings | Live provider/domain must be configured and exercised. No fake OTP or automatic verified flag. Email changes/MFA are not implemented. |
| Progressive setup | Language, shop/category/location/contact, smart defaults; optional Add, reviewed Import, separate Demo or Skip | No mandatory stock entry or sample records in a real shop. |
| Roles | Owner, manager, staff; owner-set permission overrides; private registered-account invitations and immediate membership removal | Invitations require an existing registered non-demo account. Ownership transfer is separate future work. |
| Modules | Persisted owner toggles and notification preferences; navigation, dashboard, direct routes and server operation guards | Toggles hide workflows, preserve their history and do not remove real data. |
| Demand capture | Stock/sale/standalone Nahi Mila entry, catalogue/free text, descriptive variant, explicit quantity/unit, optional customer, request-specific consent and notes | No reservation, lost-sale revenue or automatic stock change. |
| Demand review | Grouped request/quantity/identified-customer/reported-visitor counts, exact matching, history, status filters, compact dashboard and customer history | Up to 5,000 requests per shop; UI loads bounded groups/pages. Reported visitors are observations, not deduplicated people. |
| Reorder | Suggested quantity from real demand, min stock and pending drafts; editable supplier/cost/quantity; explicit draft/cancel/receipt | Draft does not contact a supplier or move stock. Actual receipt uses the existing purchase service. Supplier payments remain cash-only. |
| Follow-up | Available-stock and consent checks, explicit message preparation/copy, actual manual contact confirmation/history | No automatic WhatsApp/SMS/email or delivery/open claims. Stock is not reserved. |
| Recovery attribution | New-sale draft preparation, ordinary saved invoice, separate explicit quantity linking, net discounted attribution, cancellation reversal | Attribution is selected by the merchant. Partial returns and automatic conversion are not implemented. |
| Daily work/reports | Permission-aware grouped demand tasks, notification preferences, demand totals and last-30-day request counts | Rules over saved records; no predicted demand or fabricated tasks/revenue. |
| Voice | Deliberate browser mic, stop, editable parsed draft and manual fallback in three languages | Recognition is browser-dependent. Unsupported/unclear quantities need merchant input. No hosted STT or stored raw audio/transcripts. |
| AI | Optional configured OpenAI read-only questions with reduced tenant-scoped snapshot; existing deterministic summaries remain | No credentials/model means unavailable. Model accuracy/real provider operation has not been tested here. No write tools or automatic actions. |
| Mobile/language | English, Hindi and Hinglish copy, sheets/cards, layouts checked at 320/390/768/1440px | Physical phones, screen readers and field performance remain to be assessed. |
| Nearby merchant network | Explicit future phase | No fake nearby merchants, stock sharing, messaging or orders. |

## Authentication, onboarding and permissions

New public accounts have `verification_required=1` and remain unverified until a valid POST consumes their verification token. Tokens use cryptographic randomness, are hashed in SQLite, expire and are one-use. Verification/invitation expires at 24 hours; reset at 30 minutes. Reissuing verify/reset retires older tokens. Reset revokes all sessions and outstanding reset/verification tokens; password change revokes all sessions and all outstanding auth tokens. GET links only show confirmation UI. Token pages use no-referrer behavior and are excluded from development incoming URL logging.

Local email writes private JSON outbox files; production file mode is refused. Configured Resend delivery uses its [official API](https://resend.com/docs/api-reference/emails/send-email). Recovery gives the same public response for unknown/known accounts, is throttled and does not log reset tokens. Provider latency can still affect timing; durable queued delivery, timing normalization and distributed throttling remain operational hardening. See [OWASP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

The additive migration marks no legacy email verified and requires no retroactive lockout of existing owners. They can explicitly request verification. Demos remain isolated and fictional. Verification-required accounts cannot create/read a shop before confirmation. Shop creation and modern additional-shop setup use an account-scoped retry key and create empty real shops with category defaults.

| Permission | Owner | Manager default | Staff default |
| --- | --- | --- | --- |
| Sales, customers, payments, DemandPulse | Yes | Yes | Yes |
| Inventory, purchases, reports | Yes | Yes | No |
| Business settings, team management | Yes | No | No |

Owners can override operating permissions for managers/staff. Non-owners can never grant themselves settings/team through an override. Owner self-demotion/removal and other owner changes are refused. A recipient must be logged into the intended account, verified when required to accept an invitation, and the inviter must still be owner.

HTTP state is filtered for permissions. Staff cannot retrieve costs through product or reorder payloads, purchase/supplier history, aggregate reports, audit activity or full business export. Invoice reading is available with sales/customer/payment access; creating/cancelling a sale still requires sales. Customer-only access hides sale and repayment controls. Direct API writes check permissions independently of UI. Internal `Store.state` is a service-level complete state; HTTP handlers use the SaaS filtered state. Full JSON export requires owner settings access and excludes account/session/auth secrets.

## Business configuration

All shops share the same core data model. New categories apply these optional defaults: photo sales for clothing/mobile/general; variants for clothing/hardware/mobile; expiry for grocery; waste for vegetables; unit conversion for grocery/hardware/vegetables. Voice, DemandPulse, daily work, assistant and closing begin enabled. Existing V2 shops without configuration retain their previously available modules; no historic fields or workflows disappear during migration.

Owner settings are persisted with an optimistic revision and retry key. Disabled optional inputs/workflows and direct writes are checked on the server. Existing variant/expiry/pack values and saved invoice snapshots are preserved. Stock, credit and demand notification preferences control app alerts; they are not external push notifications. Core bills, stock and customers remain discoverable according to permissions, while advanced modules sit in appropriate sidebar/More/settings locations.

## DemandPulse data and status

The V3 tables are `business_settings`, `auth_tokens`, `demand_requests`, `demand_followups`, `demand_conversions`, `reorder_drafts` and `demand_dismissals`. User verification and membership permission columns are additive. No merchant ledger table is dropped or reseeded. SQLite integrity and original-value preservation are documented in [migration evidence](qa/v3/migration-verification.json).

A demand request stores product/name, exact descriptive variant, unit, explicit positive quantity in thousandths, optional scoped customer and contact permission, optional reported visitor count, notes, time and stored workflow status. `requestCount` is records; `quantityMilli` is requested units; `uniqueCustomers` counts distinct saved customer IDs; `reportedPeople` sums merchant observations separately. Three visitors asking about an XL shirt does not invent three requested shirts.

Free requests must be manually associated to a real catalogue item before reordering/attribution. NFKC/whitespace/case normalization supports exact descriptive variant matching. Known aliases such as piece/pcs and litre/liter can match without changing the numeric quantity. Different sizes, brands, pipe dimensions, physical scales and unspecified pack quantities are not substituted. General cross-unit demand conversion and full variant matrices remain future work.

`open`, `ordered`, `contacted`, `closed` and `cancelled` record workflow intent. Availability is derived from positive current stock of the exact matched item. Fully attributed active invoice units derive `converted`; partial attribution leaves remaining demand. Cancellation marks conversion history reversed, removes its amount from recovery totals and reopens remaining units. Explicit closed/cancelled requests do not create new work. Reorder cancellation reopens ordered requests when no other pending draft covers them.

Groups aggregate active requests by matched product or normalized free name plus variant/unit. Suggestions use `max(remaining demand, minimum stock) - current stock - pending draft quantity`, clamped to zero. The UI also shows actual last-30-day sold units. No probability, forecast, promised supply or automatically placed order is represented. Manual dismissal suppresses a suggestion/task without changing stock or financial records.

## Receipt, contact and recovered revenue

Creating a reorder draft only stores the reviewed intent. Confirming receipt creates one actual purchase through the existing atomic service, updates stock/supplier balance and records its purchase ID. Invalid suppliers/payments roll back all writes; retries cannot receive twice. Purchase/inventory permissions apply. Existing draft receipt/cancellation remain guarded operating actions; disabling the DemandPulse entry workflow does not erase drafts or ledgers.

Contact preparation requires an active exact matched request, stock, a saved customer phone and explicit permission for that request. Anonymous requests cannot grant consent. Reading/copying a prepared message does not mark contact. The merchant explicitly records a phone/WhatsApp/manual contact already performed. History records actor, channel and time; it does not claim provider delivery. Revoking permission disables later preparation/contact recording. Customer requests, purchases and payments remain separate histories.

Preparing a sale can prefill the correct product and remaining quantity within available stock. Existing sale drafts are not silently replaced. Only ordinary Save Sale writes stock/invoice/payment ledgers. The merchant then explicitly links saved invoice quantities to the demand request. The server requires the same shop, a non-cancelled invoice dated no earlier than the request, the same customer when identified, correct product/unit/snapshot variant and enough unallocated invoice units and remaining request units.

Discount is allocated proportionally across actual invoice lines using integer paise, with deterministic residual rounding. Cumulative quantity attribution allocates each line's net revenue once. Several requests cannot claim the same invoice units or exceed its net amount. `recoveredPaise` is active attributed net invoice value, including any normal customer credit; it is not collected cash or guaranteed causal uplift. Full invoice cancellation restores stock/refunds under existing rules and removes all its active attributed recovery amounts while retaining history. Later-repayment restrictions and partial-return limitations remain V2 behavior.

## Reviewed voice, CSV and retry behavior

Demand speech starts only on a deliberate click, provides stop/error/manual controls, and uses the shared browser speech adapter. The parser handles common English/Hindi/Hinglish numbers and separates dimensions/visitor counts from actual units. Missing, negative or overprecision quantities remain unresolved. Simulation is labelled as a UI example. Review fields must be correct before explicit Save Request. No parser/model response writes a record on its own.

CSV import accepts UTF-8/BOM, quoted commas/doubled quotes/newlines, at most 256 KiB and 100 product rows. Required columns are `name,unit,price` in rupees. Optional columns are `sku,cost,stock,min_stock,variant`. The UI provides a downloadable template and shows review before confirmation. Server validation rechecks each product, quantities, money and module gates. Every row commits together; a SKU collision rolls back all rows. It adds catalogue/opening stock, never silently replaces products or creates sales.

Demand, order and import browser writes store the exact body and retry key in account/shop-scoped session storage before sending. An uncertain acknowledgement freezes edits, survives same-tab reload and offers replay of that same request. The backend binds the key to the payload and returns the original result; changed payload is rejected. A definite validation failure can be corrected with a new attempt. A synchronous in-flight guard also prevents double clicks. Browser storage is not an offline sync queue or backup; do not use shared untrusted devices for private work.

## Optional AI and operating limits

The server-only assistant requires explicit provider/key/model configuration and report permission plus the assistant module. It sends a reduced, permission-filtered snapshot only on Ask, containing real totals, bounded demand groups and permitted low-stock/credit names, not phone/email/password/token data. Rules remain visible. The [Responses adapter](https://developers.openai.com/api/docs/guides/text) uses a fixed provider URL, timeout, bounded output, `store:false` and no write tools; it reads output message text rather than assuming the first output array element is text. Failure/incomplete output returns an honest unavailable state.

Read the provider's [data controls](https://developers.openai.com/api/docs/guides/your-data) before enabling it: `store:false` is not a zero-retention promise. Tenant scoping and read-only code limit data/actions, but instructions do not guarantee a model never makes an incorrect suggestion. This delivery uses mocked provider tests and does not claim real paid-model accuracy.

Persistent single-process Node/SQLite, process-local request limits, online confirmed writes and bounded state/history remain current operating limits. Commercial operation needs trusted HTTPS ingress, provider delivery checks, protected backups/restore, distributed throttles/monitoring, privacy/retention/deletion, device/merchant acceptance and a reviewed storage/concurrency plan. PostgreSQL, billing subscriptions, payment verification, OCR/hosted STT, partial returns, supplier repayment, batch expiry, offline financial sync and nearby networking are unfinished future phases. See [deployment preparation](deployment.md).
