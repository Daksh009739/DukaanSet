# Premium business module UI

Updated New Sale, Sales History, Stock, Customers, Payments, Purchases and Suppliers to use the existing DukaanSet brand with compact voice discovery, consistent page actions, icon-led financial summaries and readable record lists.

- New Sale groups draft controls and the existing inline voice workflow, with denser product cards and form sections.
- Sales History uses smaller filter controls and consistent invoice cards with their WhatsApp action inside the card.
- Stock uses a clear quantity/status column and responsive product actions.
- Customers can search names/phones and filter outstanding or settled accounts. Payment actions retain the selected customer.
- Payments can search names/phones and filter cash/UPI. Receipts, refunds and net received are calculated from the displayed ledger records. Refunds are stored as negative entries and shown once with a minus sign.
- Suppliers can search names/phones, filter balances and open the actual supplier record.
- Purchases uses consistent summaries, keyboard-accessible tabs and a first-purchase action that opens the existing receipt form.

CSS is scoped to these module routes and stock history. The approved dashboard, invoice/detail screens, permissions, voice parser, write confirmations and financial services retain their existing behavior. The removed demo strip stays removed; demo controls remain in the account menu.

## Visual review

The PNG files show the compiled production build running locally in a separate fictional hardware demo session, at 1440px desktop, 390px phone and 320px phone widths. All seven sections were inspected. Additional Hindi and Hinglish phone captures come from the multilingual browser regression suite. The phone voice bar is compact; examples remain available in the shared VoiceOS dialog. Forms and product lists still allow typing and manual entry.

`review.json` records 21 layouts without horizontal overflow or browser errors. All seven pages passed WCAG A/AA automated checks at desktop and 390px widths. The regression suite additionally audits all three languages, keyboard/record actions, customer balance filters and signed refunds. Automated accessibility checks supplement visual review; they do not establish full accessibility conformance.

## Validation

- TypeScript, source lint and locale validation; 2,378 keys with English/Hindi/Hinglish parity.
- All 259 existing unit tests.
- Production build.
- `node scripts/qa/premium-modules-production-review.mjs`: 21 compiled layouts, 14 accessibility scans, no browser errors, unchanged financial/product records.
- `tests/e2e/premium-modules.spec.ts`: ledger/filter/navigation actions and 49 multilingual responsive layouts.
- Existing sale and contextual voice regression suites.

Hosted staging depends on the existing Vercel/backend configuration; local build and browser checks do not establish a successful hosted deployment.
