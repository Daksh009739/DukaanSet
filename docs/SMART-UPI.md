# Smart UPI and merchant profile

Implemented in the existing authenticated application. Entry points are `/app/settings/account`, `/app/payments/upi`, the Payments page, customer details and invoice actions. The approved dashboard hero is unchanged; its lower content includes a compact verified-UPI summary.

## Merchant experience

The profile shows actual account and shop details, role, category, private photo, contact details, security sessions, existing VoiceOS settings and preferences. Names refresh throughout the app after saving. Plan information is explicitly unavailable because this application has no configured subscription service.

Merchants can enter an existing UPI address, upload a payment QR or scan it with the camera. They must confirm the destination before saving. Multiple saved destinations have one primary destination; it updates future invoice QR branding. Issued invoice snapshots retain their original payment details. QR parsing validates a destination and does not establish ownership or enable transaction access.

Supported tracking is a separate official Razorpay authorisation. The UI distinguishes saved addresses, active authorisations, reconnect-required accounts, disconnection and test mode. Only receipts processed by the authorised Razorpay merchant account are accessible. Payments made to an unrelated static QR or another bank account remain manual.

## Provider and deployment configuration

Selected provider: **Razorpay Technology Partner OAuth**. This implementation uses the official authorisation, token exchange, token refresh, revoke, merchant payment history, payment-fetch and optional QR-code APIs. See the [official integration steps](https://razorpay.com/docs/partners/technology-partners/onboard-businesses/integrate-oauth/integration-steps/), [webhook validation guide](https://razorpay.com/docs/webhooks/validate-test/) and [QR creation API](https://razorpay.com/docs/api/qr-codes/create/).

Configure these secrets only on the durable backend, not on the browser or Vercel gateway:

- `RAZORPAY_CLIENT_ID`, `RAZORPAY_CLIENT_SECRET`: approved partner application credentials.
- `RAZORPAY_OAUTH_REDIRECT_URI`: the exact registered HTTPS URL ending in `/api/upi/razorpay/callback`. Local HTTP is allowed only for localhost in the local environment.
- `RAZORPAY_MODE`: `test` or `live`.
- `UPI_TOKEN_ENCRYPTION_KEY`: securely generated 32-byte key, encoded as base64. Retain it securely for existing authorisations; changing it requires reconnection.
- `RAZORPAY_WEBHOOK_SECRET`: secret registered for `/api/upi/razorpay/webhook`.
- `RAZORPAY_WEBHOOK_SECRET_PREVIOUS`: optional previous secret, retained only for the provider retry window during rotation.
- `RAZORPAY_DYNAMIC_QR=1`: optional, only after confirming merchant entitlement. This requests `read_write` instead of the default `read_only` scope.
- `DUKAANSET_UPI_WORKER=0`: disables the fallback poller. Enabled polling requires valid configuration and actual merchant authorisation.

Register payment capture/failure/refund events and `account.app.authorization_revoked` using the partner's official webhook configuration. Validate that the event carries the same merchant account identifier returned by OAuth. Provider tokens are AES-256-GCM encrypted with business identity as authenticated data. They never appear in API DTOs or logs. OAuth state is random, short lived, user/business bound and single use.

Signed webhooks re-fetch the payment under that merchant's private access token before accepting an observation. Duplicate event IDs, mismatched digests, unexpected payment changes and out-of-order regressions are checked. Provider failures leave tracking unavailable or require reconnection; they never generate synthetic receipts. The 60-second fallback poller retrieves the recent seven-day period. Manual refresh retrieves the selected period. One sync is bounded at 2,000 provider records; shorter periods can be refreshed when that limit is reached. The centre paginates persisted records in groups of 200; CSV exports are bounded at 5,000 records.

## Financial rules

Amounts use integer paise and checked sums. Verified incoming receipts, sales, bank settlements and customer dues remain separate. Display totals use the shop's configured timezone. Pending, failed and imported receipts are excluded from verified collections. Refund totals describe refunds on the receipts in the selected period, not the date of bank settlement.

Payer grouping uses only a stable provider customer identifier scoped to the authorisation. Handles are masked and are not converted into names. Explicitly linking a customer changes no balance. Merchants may approve future linking for that reliable identifier. Customer history aggregates all eligible linked observations while displaying the most recent 200 records.

Explicit reconciliation can pay an invoice, recover older dues through the existing ledger service, reserve a customer advance, or match an existing recorded UPI receipt without creating more money. Each financial operation has confirmation, permissions, business scope and an idempotency key. Advances affect invoice dues only when separately applied to a bill. Confirmed provider refunds require account review; reconciliation records a reversal without sending money or cancelling the sale. Existing closing-session guards still apply.

Provider test receipts cannot affect a real shop ledger. Tests use a deliberately designated isolated workspace in `upi_test_workspaces`; the application exposes no merchant-facing API to designate a real shop as a test workspace. Customer financial history excludes test receipts from real shops. CSV exports include verification, mode, gross amount, net amount and refunds.

Automatic invoice allocation requires a server-created QR request and an authoritative QR-payment mapping from the provider. Exact amount, invoice balance, business, customer, mode, request time and open session must match. Names, free-form notes and coincidentally equal amounts are insufficient. Repeated requests reuse the active provider QR; an uncertain creation acknowledgement blocks another attempt until reviewed.

Statement imports are deduplicated, atomic, unverified review records. They cannot clear dues or count as verified money. Existing manual Payments remains the fallback. The UI distinguishes provider-verified ledger receipts from manually recorded UPI entries.

VoiceOS answers the approved UPI questions using authenticated verified observations, including amount, customer, yesterday and unmatched queries. Allocation requests prepare an editable review; they do not post money through speech alone. Normal bill creation remains in the existing billing workflow.

## Release status

### V18.1 identity safeguards

Same-name VoiceOS requests return a customer shortlist with phone suffixes and a distinguishing Customer ID. Selection stores the unique ID for the active conversation; matching-name and pronoun follow-ups reuse it. A new conversation, cancellation, closing VoiceOS or switching business clears that context. A different explicit customer name cannot silently reuse the previous selection. Ambiguous requests prepare no financial allocation until the merchant identifies the customer.

An optional authorised [Razorpay customer lookup](https://razorpay.com/docs/api/customers/fetch-with-id/) can supply a name hint. It is displayed as provider-supplied and **identity unconfirmed**. Missing names appear as **New UPI Payer**. Names, handles and matching shop contact names never create or confirm a customer automatically. The existing editable customer form can accept a hint; merchant confirmation and explicit linking remain separate steps. An anonymous payer can pay without registering or supplying a DukaanSet Customer ID. Automatic future linking still requires a reliable provider identifier and an approved business-scoped binding.

Schema 13 adds immutable original-payment snapshots and an append-only association audit with old/new Customer IDs, actor, reason and timestamp. Linking and renaming do not change payment amounts, references, source statuses/timestamps, invoices, dues or ledger entries. Legitimate provider lifecycle updates still update current status/refunds while preserving the original snapshot. Existing observations receive their unchanged available source snapshot during migration; unavailable earlier provider history is not fabricated. Detailed association audits include confirmed backfill, future bindings, automatic reliable-payer links and explicit allocation associations. Repeating the same link does not create another financial transaction or another association change.

Identity acceptance results are in `docs/qa/upi18-identity/REPORT.md`.

Local implementation and simulated-provider acceptance are complete. No actual Razorpay credentials, approved partner application or authorised merchant were present in the workspace. Live/sandbox-provider acceptance, physical Android camera/microphone acceptance, QR entitlement and remote revocation must still be verified. Universal bank history, settlement reporting, direct refund initiation and subscription billing are unsupported and are not claimed by the UI.

Use the existing feature → dev → main workflow. Keep this payment release in review until genuine provider acceptance passes; do not deploy it to production on the strength of fixtures. See `docs/qa/upi18/REPORT.md` for executed results and external acceptance steps.
