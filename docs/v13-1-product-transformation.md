# DukaanSet V13.1 implementation

The supplied dashboard is the visual baseline. Its dark teal sidebar, compact search header, topbar microphone, illustrated greeting, four pastel metric cards, three-column operational panels and three-column recent-record panels are implemented in the existing application. The illustration is original SVG artwork; real account names, dates and business records replace the reference's sample information.

## Shared application design

`approved-workspace.css` defines the shared palette, surfaces, spacing, controls, statuses, responsive navigation and detail-page treatment. Existing Bills, Invoice Studio, Stock, Customers, Purchases, Suppliers, Payments, DemandPulse, Reports, Closing and Settings retain their authoritative services. Customer activity/bills/hisaab tabs, contextual actions and expandable advanced details remain available. Public and authentication layouts are preserved.

The header opens the existing conversational VoiceOS. There is one global launcher, with independent speech and display languages. Search uses the active business's permitted products, aliases, customers and saved invoices, and supports Ctrl/Cmd K. Business switching remains available on desktop and through the mobile menu. Sidebar collapse, notifications, language, profile and business tools have real actions.

Dashboard chart buckets use recorded, non-cancelled invoices in the shop's timezone. Week, month and year are actual calendar ranges. Aggregation runs on complete server records before the visible invoice list is capped at 1,000 rows. Invoice search uses the existing permission-checked full-history endpoint with debouncing and stale-response cancellation. Receipts and old dues are not sales. Product ranking uses sales value, while showing each product's own sold quantity and unit; kilograms and pieces are never added together. Collections and customer outstanding use existing server totals. No growth percentages or sample transactions are invented. Insights explicitly identify their source as saved records. Session status and closing actions use the existing closing backend.

## Product media

Schema 8 adds independent media settings, durable enrichment jobs, private assets and a public-source search cache. A job is inserted with product creation, including manual, imported and voice-created products; external lookup happens asynchronously on the persistent Node backend. Inventory confirmation never waits for a web provider. Identity edits invalidate automatic associations. Jobs use leases, bounded attempts, delayed retries and cached searches. A disabled shop is skipped by the worker.

The source adapter uses the [Wikimedia Commons Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo), including license, author, dimensions and MIME metadata. [Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) requires checking each asset's terms. The adapter rejects missing/unsupported licenses, noncommercial licenses, restricted assets and low-quality formats. Permitted author/source/license metadata travels with the stored thumbnail and appears in product details and image credits.

Verified Pyaz/Pyaaz/Pyaj/प्याज़/Onion, Aloo/Aalu/आलू/Potato and Tamatar/टमाटर/Tomato aliases resolve to raw produce categories. Name normalization preserves Devanagari combining marks. Cooking oil, hair oil, different dals, empty bottles and branded flavours stay distinct. Raw produce matches with adequate identity, quality and rights can attach automatically. Packaging suggestions require merchant review: Commons does not provide a verified manufacturer's catalogue for exact SKU/GTIN packaging. Incorrect or uncertain branded photos remain unselected; category illustrations are always available. An authenticated catalogue adapter can be added without changing inventory services.

The real source test found a usable onion photo: **Three onions on white background**, Dubravko Sorić / SoraZG on Flickr, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0), [source file](https://commons.wikimedia.org/wiki/File:Three_onions_on_white_background.jpg). It was downloaded, decoded, stripped of metadata and resized to a WebP thumbnail. Maggi Masala, Coca-Cola 500ml and Water Bottle 1L returned reviewable licensed suggestions and retained their safe placeholders.

Product Details offers Upload Photo, Choose Suggested Image, Use Default Image and Refresh Suggestions. Merchant uploads require a rights acknowledgement and inventory permission. Merchant/default selections are pinned; late automatic responses cannot replace them. The same `ProductImage` reads the stored association in dashboard rankings, stock, search, sale selection, selected sale items, purchase records, invoice/customer bill previews, DemandPulse and reports. Saved invoice photos and financial snapshots remain historical.

Media reads are authenticated and tenant-scoped. Only fixed Wikimedia API/image hosts are permitted; nonpublic DNS answers, credentials, custom ports and redirects are rejected. Responses have size/time bounds. JPEG/PNG/WebP uploads are signature-checked, fully decoded, limited to supported pixel counts, re-encoded without EXIF/GPS and resized. Private thumbnail storage is deduplicated within each tenant and capped. No search credential is exposed in the browser. No Google Images scraping or arbitrary hotlinks are used.

## Operating and deployment

The media worker runs by default on the persistent Node backend. `DUKAANSET_MEDIA_WORKER=0` disables it for isolated financial regression tests. Vercel does not run a durable SQLite/media worker; the existing frontend-to-HTTPS-backend deployment architecture remains required. The existing staging blocker is a missing configured persistent `DUKAANSET_BACKEND_ORIGIN`. Production promotion requires a verified backend and release checks; this change does not promote `main`.

Before local schema migration, a private SQLite backup was created and passed integrity and foreign-key checks. Production rollback across schema versions requires that verified backup, rather than opening schema 8 with an older application. Private databases, outbox messages, uploads, environment files and verification caches are excluded from Git.

The original brief is preserved in `docs/briefs/v13-1-product-transformation-master.md`. The accompanying QA report records rendered comparisons, measured results, automated checks and configuration limits.
