# DukaanSet premium PDF suite

The six approved reference pages are implemented in the existing PDFKit renderer. There is one shared design system for private previews, downloads, printing and existing invoice attachments. The user authorised proceeding without the missing Implementation Guide.

## Available exports

| Document | Entry point | Authoritative records |
| --- | --- | --- |
| Sales invoice | Saved sale → Preview / Invoice Studio | Issued merchant/customer/item/rate/discount snapshot; current payments and dues |
| Payment or refund receipt | Customer → Documents & Hisaab | One saved receipt group, its invoice allocations and account impact at payment time |
| Customer statement | Customer → Hisaab / Documents | Complete ledger, opening and closing balances, cancellations and refunds; optional item detail |
| Stock health | Products & Stock → Stock health report | Complete current catalogue, stock quantities, variants and configured reorder thresholds |
| Business report | Reports → Business report | Recorded sales, signed collections and expenses in the chosen period; clearly identified current dues, supplier payable and stock at cost |
| Purchase order | Saved purchase order → Purchase order PDF | The actual saved reorder draft, supplier, quantity, cost and draft/received/cancelled status |
| Received purchase | Saved purchase → Purchase receipt | Saved received goods, quantities, costs, paid amount and supplier balance |
| Closing preview | Open Shop Closing → Closing preview PDF | Server-calculated open session; explicitly not finalised, and exporting never closes the shop |
| Saved closing | Closing history / saved closing → Download report PDF | Frozen closing version, verification state, all financial breakdowns, inventory and audit details |

All types support English, Hindi and Hinglish, colour A4, monochrome A4, 58 mm and 80 mm. Document language is independent of interface language. Existing Invoice Studio and sharing controls continue to use the same renderer and private authenticated endpoints.

## Design and pagination

The suite follows the approved Lato typography, deep teal `#082F2A`, mint `#1CC69C`, pale summary surfaces, rounded status pills, aligned amount columns, payment summaries, actual DukaanSet logo, top accent and numbered footers. Noto Sans Devanagari is embedded for Hindi and mixed-script names. Fonts are bundled; generation does not fetch fonts or a business logo from the network. A configured merchant PNG is retained beside the DukaanSet brand in A4 headers.

A4 is 595.28 × 841.89 points with 42-point margins. Continuations repeat the brand, document title/reference and table headings. Rows stay together; receipt account cards and payment summaries reserve space before page breaks. Thermal formats use the actual roll width, a readable single-column presentation, grayscale graphics, repeated headings, and a final page trimmed to its content with a zero-origin page box. Large documents retain every supported row and all totals rather than silently truncating to the dashboard's history limit.

## Financial and access behaviour

Amounts are existing integer paise; quantity totals keep the application's integer thousandths and half-up calculation. A PDF is a presentation snapshot and does not create a payment, inventory movement, purchase receipt or closing. Issued invoice details remain distinct from later payments. Allocations belonging to one receipt stay adjacent when multiple receipts share a millisecond, so its balance change excludes unrelated payments. Payment staff may export authorised receipts without acquiring customer-statement permission.

The application currently records ordinary, non-GST sales. The invoice states that GST has not been calculated; the suite does not fabricate GST registration, HSN, tax rates, tax totals, shipping charges or supplier payment terms absent from the underlying record. A cancelled invoice retains its issued total and history while showing zero current money to collect. Manually recorded UPI remains labelled. A UPI QR appears only for a configured payee and an uncancelled invoice with a real balance.

Server permissions and tenant scope are enforced for each source and again after rendering. Stored document reads also recheck permissions. Downloads use `private, no-store`; existing seven-day document retention and storage/size limits remain in force. Preview state clears when the shop, source record or document kind changes. A closed session must use its saved closing report rather than creating a misleading open preview. New render cache keys do not replace previously retained PDFs.

## Fonts and deployment

Lato Regular, Bold and Black are from [Google Fonts Lato](https://github.com/google/fonts/tree/main/ofl/lato); the OFL licence is bundled in `public/fonts/pdf/Lato-LICENSE.txt`. Noto Sans Devanagari uses the existing bundled regular font and a static weight-700 instance of the [official variable font](https://github.com/google/fonts/tree/main/ofl/notosansdevanagari), under the existing Noto OFL licence. Next.js output tracing explicitly includes the fonts and DukaanSet logo files for API deployments.

## Verification

See [the QA record](qa/pdf-suite/REPORT.md). Reproduce the matrix with `node --import tsx scripts/qa/pdf-suite-review.ts`, then render it using `scripts/qa/render-pdf-suite.py` and Poppler. The fixtures use an in-memory SQLite database and deliberately different fictional records; they are not runtime templates or production data.

Browser checks are `tests/e2e/pdf-suite.spec.ts`. Run them in an isolated checkout with a fresh database. `scripts/qa/pdf-suite-production.config.ts` runs the same checks against an already compiled application on port 3001. Keep the user's preview server and database separate.
