# Premium PDF suite verification

Verified on 13 October 2026 against the six approved pages in `DukaanSet_Ultra_Premium_PDF_Design_Suite.pdf`.

## Result

The existing application now generates the premium templates from authenticated, business-scoped records. This is integrated rendering and export functionality, not a separate mockup. The approved invoice, customer statement, receipt, closing, stock health and purchase-order designs share their typography, palette, summaries, tables, status treatments and footers with received purchases and business reports.

| Check | Result |
| --- | --- |
| Complete application tests | 340 passed, zero failures |
| Focused document/financial regression | 26 passed, zero failures |
| Production build and TypeScript | Passed in isolated checkout |
| Source syntax/localisation checks | Passed; 191 source files |
| Translation parity | 2,781 keys across English, Hindi and Hinglish; zero hardcoded visible strings |
| PDF matrix | 111 documents, 216 pages |
| Poppler rendering and text-bound audit | Every page rendered; zero glyphs beyond paper bounds |
| Browser workflows, development server | 3 language workflows passed |
| Browser workflows, compiled production app | 3 language workflows passed |
| Responsive export dialogs | 320, 390, 768 and 1,440 px in every language; no horizontal overflow |
| Export-dialog accessibility | Zero axe WCAG A/AA violations at 390 px in every language |

The matrix covers nine document types in three languages and four formats: colour A4, monochrome A4, 58 mm and 80 mm. Three additional 67-item A4 invoices test long mixed-script product names and seven-page pagination. Every generated page was inspected using labelled contact sheets, with individual pages checked at larger size where needed. Continuations retain titles, references, headers, rows, totals and actual page counts. Receipt account-impact summaries stay together; thermal final pages have correctly trimmed, zero-origin page boxes.

## Data and functional checks

QA documents use deliberately different fictional Northstar Retail records in an in-memory database. Browser tests create fresh isolated QA accounts and databases. These fixtures are confined to test scripts; application templates contain no sample business, customer, product or monetary values. The user's local preview server and business database were not used for these writes.

The financial tests exercise fractional quantities, paise rounding, discounts, cash/UPI allocations, later receipts, same-millisecond split receipts, current balances, received purchases, saved reorder drafts, stock thresholds and open/saved closing reports. A receipt's before/after balances exclude unrelated payments and subsequent sales. Generating or downloading a document leaves products, invoices, payments, purchases, movements, expenses and the trading session unchanged.

Browser checks exercise the existing invoice preview and new operational export controls, rendered PDF canvases, real downloaded PDF bytes, paper widths, server document models and the print-window blob. Customer statements and receipts also pass authenticated private-download checks. Tenant boundaries, staff permissions, missing sources, invalid periods, saved-closing formats and closed-session preview rejection are covered by server tests. No browser page errors were observed.

## Review artifacts and reproduction

The generated PDFs, source-model JSON, manifest, individual rendered PNGs, 18 contact sheets and `visual-audit.json` are in the ignored `.local/qa/pdf-suite/` directory. Browser evidence is in `.local/qa/pdf-suite-ui/` in the isolated verification checkout. QA artifacts contain fictional test data and are not documents for the user's customers.

```powershell
npm test
npm run typecheck
npm run lint
npm run test:locales
node --import tsx scripts/qa/pdf-suite-review.ts
python scripts/qa/render-pdf-suite.py
```

Run browser checks in a separate checkout with a fresh database. After compiling that checkout:

```powershell
node node_modules/@playwright/test/cli.js test tests/e2e/pdf-suite.spec.ts --config scripts/qa/pdf-suite-production.config.ts
```

## Practical limits

Physical A4 and thermal-printer output has not been checked on hardware. The browser print/download paths and exact PDF page dimensions have been checked. Use actual-size printing and the matching 58/80 mm driver paper setting for a physical acceptance pass.

The current financial model stores ordinary non-GST sales. The invoice accurately states that GST was not calculated; no GST registration, HSN or tax rate is invented. Adding statutory GST calculations would require a separately defined financial schema and calculation change.

Hindi and mixed-script text use embedded shaped Devanagari fonts and have been reviewed visually. Some PDF text extractors report ligatures or visual glyph order instead of reproducing the original Unicode string exactly. This does not prevent visual rendering, and language assertions use the authenticated source model alongside PDF references, amounts and rendered pages.
