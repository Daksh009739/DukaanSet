# Smart Invoice Studio and Customer Hisaab

Invoice Studio uses existing sales, payment allocations and customer records. Opening a document, preparing a PDF, downloading, printing or sharing does not create a sale, payment or inventory entry.

## Shopkeeper workflow

Open a saved invoice and choose Preview, Download PDF, Print or Send on WhatsApp. WhatsApp prepares that invoice and opens recipient review. The studio also offers English, Hindi and Hinglish independently of the display language, with Premium A4, monochrome A4, 58 mm and 80 mm formats. Preview renders the exact private PDF bytes used by download, print and delivery. Print opens that PDF in the browser's PDF viewer; use its print control. Thermal documents are paginated at a fixed page height; configure the printer for the selected width. Physical printer output has not been tested.

Customer profiles show complete account activity for the selected period, opening balance, period debits/credits, running balance and closing balance. Date presets include the last seven days, this/last month, last three months and the Indian financial year, plus a custom range. Choose an existing payment to generate its receipt. A later collection allocated across several invoices produces one receipt for the original collection. Refund receipts retain their signed value. Generated document history preserves the saved PDF, language, format and statement period while it remains available. Expired copies can be regenerated explicitly. Delivery history is separate.

Edit customer changes the current name/contact with an optimistic conflict check. It does not rewrite issued invoices or separately saved WhatsApp recipient preferences. Lifetime purchase count and last purchase/payment dates come from complete SQL queries. Photos and DemandPulse remain available in the customer profile.

Owners configure shop display name, local logo, address, contacts, tagline, readable accent, terms, return policy and footer under Settings → Shop Branding & Invoices. The live design example is labelled fictional. Save applies changes to future invoices. A valid configured UPI ID and payee can add a QR for the current invoice balance; scanning it does not record or verify payment. This is an ordinary invoice system: GST, GSTIN/HSN tax computation, statutory e-invoices, partial item returns and bank/payment-gateway verification are not implemented.

## Financial and historical rules

- New sales atomically capture merchant branding, customer name/phone, item snapshots and original payment totals. Later branding/contact/catalogue edits cannot change those issued facts.
- The PDF distinguishes payments/due at issue from current balance and subsequent collections/refunds, labelled with its generation date. Cached PDFs retain their original generation/as-of date. Source changes invalidate the cache.
- Earlier invoices that predate saved branding are explicitly marked as legacy presentation copies. Original merchant branding cannot be reconstructed. The first legacy presentation snapshot is retained; no original branding is invented.
- Statements use the complete authorised ledger rather than the dashboard's 1,000-entry display window. Opening balance includes earlier debits/credits. Sales debit the account; payments credit it; full cancellations credit the original sale once; refunds debit it once. Negative credit balances remain negative.
- Periods use India business dates. Future dates, inverted ranges, missing cancellation provenance and unsafe sums fail visibly. Documents fail rather than silently truncating above 5,000 invoices, 10,000 payment allocation rows or 8 MiB of item snapshots.

## Private storage and access

Additive migrations upgrade SQLite to schema 6 and preserve existing finance records. Back up the database before upgrading. PDFs and their canonical models live in tenant-scoped `documents`; payment `receipt_id` groups allocations. Existing payments receive a stable receipt identifier during migration. Canonical model hashing reuses unchanged PDFs and a transactional recheck prevents duplicate retention during concurrent generation.

PDF access requires a live session, membership and the document module permission. Statements additionally require customer access; sharing requires customer access and the document permission. Every route uses tenant predicates; mutation routes retain same-origin CSRF checks. PDFs have `private, no-store` headers, seven-day access expiry, a 10 MiB per-document cap and a 100 MiB retained PDF cap per business. Expired bytes are purged during generation; metadata and audit history remain private. This is not an automated retention scheduler. Owners' JSON export includes branding, communication preferences and document/delivery metadata; private PDF blobs remain in the protected database backup. No public financial links are created, and the service worker caches only public assets.

## Rendering and fonts

`src/lib/server/pdf-renderer.ts` is the shared PDFKit renderer. It uses local licensed Manrope and Noto Sans Devanagari static TTF fonts with fontkit shaping and a rupee/Devanagari fallback. Text is embedded and searchable; there are no remote font or image fetches during rendering. Mixed scripts wrap by grapheme and measured width. Multi-page tables repeat headings, shop/reference and page count. Saved source names stay unchanged in all languages.

The committed static fonts were derived at weight 400 from the locked `@fontsource-variable` WOFF2 assets using fonttools' variable-font instancer; their licences are adjacent in `public/fonts/pdf`. Font conversion is a maintenance operation, not a runtime dependency. `scripts/pdf-assets.mjs` synchronises the locked PDF.js worker before dev/build/start execution, copying only changed files so browser preview and worker versions match. PDF.js is used for preview; PDFKit generates the authoritative document. See [PDFKit font/text documentation](https://pdfkit.org/docs/text.html).

To reproduce the three explicitly fictional output PDFs and long-layout fixtures, run `node --import tsx scripts/qa/invoice-samples.mts` with Node 24. This regenerates `output/pdf` sample files from an isolated in-memory database and writes stress PDFs under ignored `.local/pdf-qa-v7`; it never connects to the merchant database or sends a message. Render the samples with Poppler and inspect their pages before delivery.

## VoiceOS and deployment

Requests such as “Rahul ka is month ka hisaab PDF bana do” open the existing customer statement. Saved bill/receipt requests select existing authorised records; missing or ambiguous customers/records require review. A WhatsApp request opens recipient confirmation. Voice requests never automatically create finance events or send messages.

The Node 24 backend needs durable private SQLite storage. The Docker image includes the local fonts and preview worker. Vercel remains a checked gateway to that backend, not a place to store SQLite on ephemeral functions. Hosted staging acceptance remains pending its backend origin/volume, deployment check token and verified mail sender. See [deployment setup](VERCEL_STAGING_SETUP.md) and the [V6/V7 verification report](v6-v7-test-report.md).
