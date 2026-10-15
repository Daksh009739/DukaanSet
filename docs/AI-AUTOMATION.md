# Reviewed document automation and Shop Autopilot

This extension preserves the existing Dashboard and financial services. Scan actions prepare reviewed inputs; they do not introduce another payment ledger or automatic inventory writer.

## Merchant flow

- **Stock → Scan & Add Stock** accepts a camera photo or a JPEG/PNG/WebP file. **New Sale**, **Sales History**, **Purchases**, and purchase intelligence offer **Scan Bill**.
- The original file remains private business-scoped evidence. A separate rotated, resized JPEG preview removes metadata before optional extraction. Maximum input: 8 MB, 16 megapixels, 8192 pixels per dimension, one image frame. A review supports up to 100 entries. Evidence storage is capped at 100 MB per business.
- Optional extraction reads Hindi, English and Hinglish into a strict editable draft. Missing/uncertain values need correction. Unsupported output and provider failures create no financial records. Manual entry remains available when extraction is unavailable.
- Product matching uses existing catalogue IDs. Duplicate customer names are shown with phone suffixes and ID suffixes; a party is never selected from a photographed name. New catalogue items require explicit review and inventory permission.
- Changing the review language changes supported display labels without translating source evidence or changing IDs, quantities or prices. Merchant display names take priority. Unknown brands/variants retain their original names.
- Final review shows exact quantities, stock effects, rate meaning, catalogue selling-price changes and bill totals. Editing a confirmed preview requires another review. A stock/pricing change invalidates a stale preview.
- A confirmed save calls the existing stock batch, invoice or purchase service inside one transaction. Imported bills have **no payment**. Actual money received or paid must be recorded separately in the existing workflow.
- Saved invoices and purchases expose the original image, source reference, source date and readable source text. Standard exports contain capture metadata and review references, without embedding image bytes or server credentials.

## Financial boundaries

Source bill references and dates are evidence. They do not replace internal invoice numbers, backdate transactions or rewrite issued records.

Existing invoice arithmetic supports line rates and an invoice discount; existing purchase arithmetic supports line costs. There is no new tax calculation engine. Source tax remains evidence. Merchants must review final tax-inclusive rates and adjustments, and explicitly acknowledge tax/purchase-discount treatment. A supplied source grand total and reviewed line totals must match deterministic existing arithmetic before save. Purchase discounts must be reflected in reviewed final unit costs. Documents needing unsupported tax treatment must be corrected or handled through an appropriate existing workflow, rather than silently approximated.

Stock-only purchase rates are saved as batch receipt evidence using the existing stock service; they do not change an existing catalogue cost or create a supplier payable. A **purchase bill** uses the existing purchase receipt service and its established cost/payable rules. New product selling prices are shown separately from purchase cost.

Exact original hashes and normalized-pixel hashes prevent identical re-uploads. Committed extracted-text hashes and party/date/source-reference claims also block matching evidence from a different photo. Identical legitimate slips without distinguishing evidence may need manual investigation; there is no automatic bypass or customer merge. A completely changed image without a reference and without extraction cannot be proven to be the same document.

Confirmed requests are replay-safe, including a lost response, a changed retry key or later catalogue renaming. A committed capture cannot be repurposed into another financial transaction. A conflicting body fails; a permission revocation also applies to retries. Failures roll back new products and stock changes together.

## Provider configuration

Configure the durable server, never a public client bundle:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=<server secret>
DOCUMENT_VISION_MODEL=<configured vision-capable Responses model>
```

If `DOCUMENT_VISION_MODEL` is empty, the adapter reuses `OPENAI_MODEL`. No provider credentials or model are fabricated. The environment example contains placeholders only. With incomplete configuration, the interface reports extraction unavailable and offers manual review.

The adapter uses the existing OpenAI Responses integration pattern: explicit image-sharing consent, `store: false`, image input, strict structured output, 60-second timeout, short extraction lease, numeric fields checked for consistency with the returned transcription, no catalogue/contact disclosure, and no financial tool calls. `store: false` does not assert zero provider retention; the provider's applicable data controls still apply. Read the [official image-input guide](https://developers.openai.com/api/docs/guides/images-vision) and [structured-output guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). Image recognition can misread handwriting, small text and non-Latin text; merchant review is mandatory.

Original bytes are retained in the existing private SQLite database. Existing deployment access controls and backup/export policies apply. There is no claim of encryption, backup completion or a security certification that has not been verified.

## Grounded business assistance

The existing AI page adds a collapsed **Shop Autopilot** section. It compares the latest seven calendar days with the preceding seven days in the business timezone, using complete scoped SQL aggregates of recorded sales, signed receipts/refunds and expenses. It counts supported stock movement events and unpaid bills and reuses existing priorities for verified UPI, unmatched payments, customer dues, inventory and enabled activities.

Missing history is explained rather than replaced with invented trends. No-baseline changes are not presented as a percentage. The assistant cannot determine whether the merchant recorded every real-world transaction. Cancelled invoices are excluded from current recorded sales.

“How is my business doing?”, “Mera business kaisa chal raha hai?” and the Hindi equivalent open a read-only VoiceOS report without confirmation. Existing write flows continue to require review and confirmation. Morning/day/evening priorities are in-app suggestions. The optional recap preference stores a link on this device for this user/business; it schedules no background job or external message.

Shop closing separately displays calendar-day verified provider collections and unmatched receipts. These are not added to trading-session sales or cash totals, and identifying a payer does not clear Udhaar. Existing closing confirmation, refunds, cash difference review and saved closing versions remain authoritative.

## Verification and acceptance

- 26 document/automation regression tests cover extraction consent/validation/lease/failure, immutable original evidence, business permissions, IDs, units, unknown rates, totals, tax acknowledgement, atomic saves/rollbacks, stale previews, deduplication, retry integrity, unpaid imports, scoped exports, display-language conversion and deterministic health reports.
- The complete existing suite must also pass; see the checked-in QA report for final totals.
- `scripts/qa/automation18-production-review.mjs` exercises the compiled production application against an isolated database. The purchase extraction is a deliberately supplied fixture, not a live recognition claim. The UI upload, correction, final confirmation, financial write, source download and replay checks use actual application endpoints.
- Real Hindi/English/Hinglish handwriting recognition is **not yet accepted**: no server-side AI credentials were supplied in this workspace. A merchant must configure a supported model and test readable, difficult, mixed-language, rotated and unreadable photos against the originals. Physical Android camera/microphone testing also remains separate from browser emulation.

No production deployment or live payment verification is implied by these checks.
