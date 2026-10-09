# DukaanSet competitor research and positioning

Research date: **8 October 2026**, Asia/Kolkata. Sources below are official vendor websites and help documentation reviewed through web retrieval. Representative marketing pages and one public demo were also inspected in a browser. This is an initial desk study, not merchant interviews, a procurement recommendation, or a complete product usability audit.

## Evidence rules

- **Published:** a capability advertised or documented by the vendor. This does not independently verify speed, availability in every plan, reliability, legal compliance, or the underlying implementation.
- **Rendered:** a layout or control actually observed in the browser on the named public page.
- **Hypothesis:** a proposed DukaanSet improvement that needs task testing with merchants.
- **Not established:** absence of evidence in the pages reviewed; this must never be reported as a competitor lacking that feature.

No competitor account was created and no financial transaction or message was submitted. No customer-count, accuracy, collection-rate, testimonial, or time-saving claim has been independently verified or adopted as a DukaanSet claim. Competitor assets were not copied into the product.

## Capability comparison

This table summarizes published scope, rather than offering exhaustive yes/no checkboxes. Follow the linked evidence for plan and platform details.

| Product | Billing and records | Inventory and business relevance | Credit and everyday work | AI, language, and access |
| --- | --- | --- | --- | --- |
| [Vyapar](https://vyaparapp.in/) | GST/non-GST billing, POS, reports | Stock, industry solutions including kirana/hardware/clothing | Payment tracking and reminders | Local-language and cloud/offline positioning; [OCR document scanning](https://vyaparapp.in/ocr-scanner-software) |
| [myBillBook](https://mybillbook.in/) | Invoicing, purchase orders, POS, configurable invoice formats | Low stock, batches, expiry, industry pages | Outstanding dues, live ledgers, WhatsApp/SMS reminders | Advertises AI bank reconciliation; [FAQ](https://mybillbook.in/s/faqs/) explicitly lists English, Hindi, Hinglish and other mobile languages |
| [Khatabook](https://khatabook.com/) | Digital ledger, invoice creation | Inventory is now included in homepage positioning | Payment reminders and customer ledger focus | Desktop/mobile synchronization; [English site](https://khatabook.com/en/) advertises multilingual and multiple-business support |
| [Zoho Books India](https://www.zoho.com/in/books/) | Accounting, invoices, receivables/payables, reports | Purchases/sales update stock; replenishment thresholds | Automated reminders, banking, cash flow | Advertises Zia AI, roles, customization, and multi-device access |
| [TallyPrime](https://help.tallysolutions.com/tallyprime-get-started/) | Accounting, vouchers, invoices, reports | Godowns, batches, units and configurable company features | Bill-wise outstanding reports and reminders | Keyboard shortcuts, report drill-down, connected services; [FAQ](https://tallysolutions.com/tally-prime-faq-guide/) describes connected transaction updates |
| [Marg ERP](https://margcompusoft.com/retail/retail_software.html) | Retail invoicing, purchase/payment workflows | Barcode, batch/expiry, reorder and rack management | Collections, cash-drawer management, retail operations | Integrated mobile apps and banking; no specific LLM assistant behavior established in this review |

### What these products already do well

**Vyapar:** Its public positioning joins counter billing, inventory, payments, reports, language support and industry entry points. OCR is an existing category capability. DukaanSet should explain the state of its own scanning integration clearly and cannot market scanning or connected billing as a new invention. [Homepage](https://vyaparapp.in/), [OCR page](https://vyaparapp.in/ocr-scanner-software).

**myBillBook:** The current homepage ties stock alerts to billing and collections. Its FAQ documents payment allocation across multiple invoices and both a menu route and an invoice-level payment action. The mobile FAQ explicitly includes Hinglish; consistent three-language support is therefore a quality objective, not a uniqueness claim. [Homepage](https://mybillbook.in/), [FAQ](https://mybillbook.in/s/faqs/).

**Khatabook:** Collection reminders, a familiar ledger concept, multilingual access and multiple-business handling are established parts of its public positioning. The current homepage also mentions invoices and inventory; treating it as only a digital notebook would understate its advertised scope. [Homepage](https://khatabook.com/), [English product site](https://khatabook.com/en/).

**Zoho Books:** The public product explanation distinguishes receivables, payables, inventory and cash flow, and explicitly advertises AI. Its public demo separates current and overdue balances. DukaanSet should preserve this financial clarity while selecting daily merchant priorities. [India product page](https://www.zoho.com/in/books/), [public demo](https://www.zoho.com/in/books/accounting-software-demo/#/home/dashboard).

**TallyPrime:** Its help documentation emphasizes quick actions, in-context master creation, drill-down and configurable accounting/inventory capabilities. The FAQ says recorded sales and purchases update related books, stock and reports. One connected transaction is a baseline engineering expectation. [Feature documentation](https://help.tallysolutions.com/tallyprime-get-started/), [FAQ](https://tallysolutions.com/tally-prime-faq-guide/).

**Marg ERP:** Retail documentation is strong on batch/expiry, barcode, stock organization and practical checkout operations. This is an important reference for grocery depth; a lone product expiry field is not equivalent to batch-level expiry stock. [Retail product page](https://margcompusoft.com/retail/retail_software.html), [stock management](https://margcompusoft.com/retail/stock_management_software.html).

## Observed public layouts

Browser inspection used the normal desktop viewport (approximately 1280px wide) and an explicit **390 × 844 CSS pixel** phone viewport. Temporary research tabs were closed and the viewport override reset. These observations apply only to the public surfaces named below.

| Surface | Desktop observation | Phone observation | DukaanSet implication |
| --- | --- | --- | --- |
| [myBillBook homepage](https://mybillbook.in/) | Two-column hero, product-tour thumbnail, separate registration/demo actions, feature/solution menus | Hamburger opens a side drawer; hero stacks; a full-width demo action precedes the product image | Put a real, clearly identified product preview close to the CTA. Use a short, labelled mobile menu. |
| [Zoho Books India homepage](https://www.zoho.com/in/books/) | Two headers, centered accounting proposition, CTA pair, dashboard preview | Compact brand header, stacked CTA pair, persistent trial action at bottom | One clear DukaanSet action plus useful demo access; avoid multiple sticky surfaces competing for space. |
| [Zoho public demo dashboard](https://www.zoho.com/in/books/accounting-software-demo/#/home/dashboard) | Module sidebar; current/overdue receivable and payable cards; fiscal-year cash-flow section | Sidebar remained visible, leaving narrow/clipped content in this particular demo shell | Build and test DukaanSet's phone navigation deliberately. This is **not evidence about Zoho's native mobile app or every authenticated web screen**. |

The public demo was marked as a test organization with limited actions. No complete billing, inventory, onboarding or credit task was performed inside a competitor account. Billing flows for other products were studied through official descriptions/help, not independently timed. Native app navigation, keyboard behavior, screen-reader quality, full accessibility conformance and device performance remain unverified. A visual observation about a public demo is not a general assertion that the competitor is difficult to use.

## Pricing presentation

Prices change and this review is not a purchasing quote. DukaanSet's prices remain a centrally configured product experiment until approved.

| Vendor evidence | Presentation observed | Lesson for DukaanSet |
| --- | --- | --- |
| [Vyapar pricing](https://vyaparapp.in/pricing) | Dedicated pricing link exists; readable plan details were not returned by the text retrieval | Do not infer plan prices or entitlements from download CTAs. |
| [myBillBook pricing](https://mybillbook.in/pricing-plans) | Plus/Pro/Pro Max tiers; monthly/yearly presentation; business/user counts and platform differences | Show total billing period, tax treatment, limits, device support and business count together. |
| [Khatabook English site](https://khatabook.com/en/) | Feature-first ledger/payment marketing; no complete commercial plan comparison established here | Do not equate a free-app statement with unlimited paid-service access. |
| [Zoho India pricing](https://www.zoho.com/in/books/pricing/) | Organization/month pricing, monthly vs annually billed rates, tiered users and separately priced add-ons | Explain charges per business and AI quota; avoid hidden add-ons. |
| [Tally monthly subscription](https://tallysolutions.com/tally-monthly-subscription/) | Subscription duration and lifetime-license alternatives; tax shown separately | Distinguish recurring price from one-time cost. |
| [Marg price list](https://margcompusoft.com/marg-price-list.aspx) | Editions, extra users/companies, taxes, renewal and cloud/app sections; separate sections returned inconsistent edition figures | Confirm applicable edition and current quote before comparison. Do not publish a single unqualified price. |

## Friction: evidence versus assumptions

No independent user complaint corpus was analyzed. Vendor-selected testimonials are not neutral complaint evidence. This research therefore does **not** assert that any competitor is slow, unreliable, insecure, confusing or unsuitable for merchants.

1. **Documented workflow:** myBillBook's FAQ describes settling an unpaid invoice through Sales → Payment In → create payment, but also documents a contextual invoice action. **Hypothesis:** a payment sheet reachable from both customer and bill views may reduce task switching in DukaanSet. This hypothesis must be timed against both competitor paths, not just the longer one. [Official FAQ](https://mybillbook.in/s/faqs/).
2. **Documented terminology:** Tally's documentation uses masters, vouchers and bill-wise reporting. **Hypothesis:** everyday labels such as bill, customer, money to collect and stock may help first-time merchants. Familiarity with Tally can make its terminology efficient for experienced users; do not assume all merchants prefer simplified labels. [Official features](https://help.tallysolutions.com/tallyprime-get-started/).
3. **Observed public demo layout:** the specific Zoho demo dashboard retained a desktop sidebar at phone width. **Hypothesis:** Home/Bills/Stock/More plus contextual actions will make the DukaanSet daily slice easier on a phone. Validate with real device tests; do not generalize the demo limitation to Zoho's mobile product. [Public demo](https://www.zoho.com/in/books/accounting-software-demo/#/home/dashboard).
4. **Published scope breadth:** Marg's retail offering includes many specialized operations. **Hypothesis:** progressive disclosure by business category will help small shops get started. Hiding required controls could harm experienced merchants, so modules must remain discoverable. [Retail page](https://margcompusoft.com/retail/retail_software.html).

## Positioning decision

**Proposed promise:** a merchant can see today's sales, actual recorded collections, customer dues and stock actions together, then complete the relevant task without re-entering a transaction.

The defensible initial differentiation hypothesis is the *quality of this joined daily experience*: category-aware priorities, a focused Today's Work list, simple language, useful empty states and an understandable daily closing. It is not the invention of billing, stock, credit reminders, multiple businesses, multilingual UI, AI or scanning. Superiority and completion-time claims require comparative task evidence.

### Must match in the usable initial slice

- Persistent, tenant-scoped records; no mixing of real and demo accounts.
- Reliable sale confirmation updating invoice, stock, collections and dues atomically.
- Decimal quantities, partial payment, inventory movement history and clear financial labels.
- Products/customers/suppliers, stock receipt, collection entry and traceable cancellation.
- Search, legible money, usable phone targets and a visible route to the next daily action.
- Clear unavailable status for integrations that have not been implemented.

### Simplification opportunities to validate

- Put New Bill, Add Payment and Add Stock within one step from Home.
- Show only four relevant headline measures rather than every available chart.
- Use safe defaults for walk-in cash sales while making udhaar explicit.
- Keep the customer picker and new-customer entry in the bill context.
- Explain why sales and collections differ using ledger-derived values.
- Tailor units and attention cards for grocery, hardware and vegetables without duplicating the application.
- Preserve form drafts safely; clearly distinguish saved, pending and failed operations.

### Deferred from this session's initial slice

Government GST/e-invoice submission, advanced offline transactions, serial/warranty/variant ledgers, batch valuation, full double-entry accounting, bank feeds, automated WhatsApp sending, OCR, live speech, online payment collection and paid subscription checkout need dedicated integrations and tests. Read-only AI also requires a real provider adapter and tenant-safe tools; an environment variable alone does not implement it.

## Merchant validation plan

Recruit grocery, hardware and vegetable merchants using affordable Android phones, including users who already use the compared products and users migrating from paper. Use fictional test data. Obtain consent for observation and recordings. Do not expose real customer contact details in recordings.

| Task or question | Evidence to collect | Decision it informs |
| --- | --- | --- |
| Find today's sales and separately identify money received | Correct answer without instruction; task time; confusion between metrics | Dashboard hierarchy and labels |
| Create a ₹1,000 bill with ₹600 collected | Completion time, error rate, understanding of ₹400 due | Bill summary and partial-payment defaults |
| Sell 500g at a per-kg rate | Quantity entry errors and unit understanding | Decimal unit input and conversion design |
| Collect one payment against multiple old bills | Allocation comprehension, omitted/duplicate entry | Collection sheet and allocation controls |
| Receive goods versus draft a reorder | Whether users understand when stock changes | Purchase lifecycle wording |
| Complete today's closing | Cash-vs-UPI understanding; discrepancy explanation | Closing formula and checklist |
| Switch business and language mid-task | Data/context mistakes and translation comprehension | Business switcher and draft scope |
| Lose connectivity during a bill | Understanding of saved versus unsynced; recovery | Draft safety and offline roadmap |
| Which tasks must appear first every morning? | Ranked priorities by category | Category configuration |
| What makes an alert useful rather than annoying? | Preferred frequency, actionable detail and snooze rules | Today's Work prioritization |
| Would reminders be useful, and who may send them? | Consent, wording, staff authority and channel preferences | Notification permissions |
| What would you pay for, and what do you expect to export? | Willingness to pay plus switching concerns | Plan limits and portability |

Repeat observed tasks after onboarding, using the same data and goals across products when lawful and accessible. Report median times, task failures and qualitative notes; a small convenience sample cannot support universal superiority claims.

## Source and coverage register

All links above were accessed **8 October 2026**. Direct text extraction of the Khatabook, Tally and Marg root pages was limited; official-domain search results and the readable official specialist/help pages supplied the feature evidence. Pricing contradictions and retrieval gaps are retained rather than silently resolved. The older [Khatabook feature article](https://khatabook.com/blog/khatabook-app-features/) mentions Hinglish, but its age prevents using it alone as evidence of current complete-language coverage. Official product updates and plan limits should be rechecked before public comparative marketing.


## V2 desk-review update — 9 October 2026

Official sources were checked again for billing, statements and collections. [Zoho Books customer statement documentation](https://www.zoho.com/in/books/kb/reports/customer-statement-report.html) describes customer transaction consolidation, date/status filters and PDF download. [myBillBook FAQ](https://mybillbook.in/s/faqs/) discusses invoicing, payment recording and inventory. [Vyapar invoice receipt page](https://vyaparapp.in/free/invoice-receipt-software) presents PDF invoices with inventory and payment tracking. [Khatabook’s public site](https://mobile.khatabook.com/) describes ledgers, invoices and payment reminders. [OkCredit FAQ](https://okcredit.in/faq) documents credit/payment ledgers and reminders. [TallyHelp](https://help.tallysolutions.com/tallyprime-get-started/) describes vouchers, stock movements, outstanding reports, backup/migration and configurable permissions. The Marg retail URL could not be retrieved during the V2 recheck; the previous review remains dated 8 October and is not upgraded to a fresh V2 observation. No competitor account, transaction or outbound message was created.

The V2 design inference is to keep the counter sale on one page, show recorded cash/UPI separately from pending credit, and link each invoice to customer and stock history. These are task-based design choices, not claims that competitors lack them. Optional sale photos are documentation only, without visual recognition.

Browser voice support was reviewed using [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) and [Chrome’s Web Speech introduction](https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api). Feature detection, explicit start/stop and permission/error handling are necessary. Recognition may rely on the browser vendor’s servers; the app offers a manual fallback and does not claim universal availability or offline transcription. Parsing after transcription is deterministic, with explicit confirmation for uncertain product matches.
