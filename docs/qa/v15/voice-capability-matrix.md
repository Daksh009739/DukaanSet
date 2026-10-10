# V15 VoiceOS capability and confirmation matrix

| Capability | Resolver and actual service | Write boundary | Evidence |
| --- | --- | --- | --- |
| Bill / dependent new customer | Separate roles, unique scoped contact and SKU; `Store.createVoiceSale` | One explicit atomic invoice confirmation | Labelled corpus; transaction tests; browser and compiled invoice/stock readback |
| Stock / new products / rates | Existing reviewed stock parser and `Store.receiveStockBatch` | One confirmed batch; unit, price and variant checks | Retained stock, voice-products, conversation and V14 gates |
| Customer, phone, product-rate edits | Scoped contact/SKU; existing contact and optimistic editors | Reviewed form Save | Retained VoiceOS/V14 functional tests |
| Old udhaar, cash and UPI receipts | `Store.receivePayment`; actual customer ledger | Explicit payment confirmation; never a new sale | Labelled payment case and retained ledger/browser tests |
| Supplier / received purchase / payable payment | Scoped supplier and SKU; `Store.createContact`, `Store.createPurchase`, `ClosingService.supplierPayment` | Existing reviewed forms; receipt and payment remain separate | Purchase-cost tests and retained supplier/closing browser gates |
| Supplier outstanding | Actual unique supplier balance | Read only; ambiguous supplier is not guessed | V15 unit test and server-scoped state |
| Reorder advice and draft | `IntelligenceService.reorder`, `SaaSService.reorder` | Prepare, review, then confirm one unreceived draft | Permission/idempotency tests; lost-acknowledgement browser and compiled checks |
| Receive a saved order | Explicit actual draft; `SaaSService.receiveOrder` | Existing goods-received confirmation | Retained Demand/closing checks; corrected purchase-order destination |
| DemandPulse and follow-up | Variant and people/units separated; existing demand services | Reviewed demand; consent and explicit contact for messaging | V15 count test; retained Demand, document and VoiceOS gates |
| Invoice, receipt, Hisaab, WhatsApp preparation | Actual immutable source records and document/delivery services | Preview; explicit recipient/contact confirmation | Retained Invoice Studio, PDF and WhatsApp gates |
| Daily closing | Actual session, cash preview and `ClosingService` | Explicit existing closing confirmation | Retained closing concurrency, snapshot and compiled PDF gates |
| Sales, collections and expenses by period | `Store.voiceReport`; complete ledger; business timezone/cutoff | Read only | Half-open historical-boundary test; retained full-ledger tests |
| Selected customer/product pronouns | Only an actual entity from the active page/business | Read/navigation or existing editor confirmation | Retained customer tests; product stock query maps to the selected SKU |
| ProfitPilot and Smart Action Center | Recorded session sales, cost coverage, scoped records | Read only; historical cost absence explicit | Service tests, compiled record-derived estimates, multilingual layout checks |
| What-if simulator | `IntelligenceService.simulate`; exact amounts | Read only; conditional intent cannot transact | Model-misclassification guard; 300 profit/20% margin browser/compiled assertion |
| Purchase invoice text / text PDF | Bounded document extraction; actual supplier/SKU and explicit variants | Extraction is draft only; receipt form has its own confirmation | Text extraction and competing-variant browser cases |
| Optional OpenAI interpretation | Strict schema, source evidence, actual scoped resolution | Model proposes only; provider review and normal domain validation | Injected response/timeout/refusal/privacy tests; no live provider call |
| Optional spoken report answers | Installed browser voices | Explicit playback; cancels before listening | Lifecycle code; live pronunciation/device availability unverified |

Image OCR, supplier-confirmed incoming quantities, historical unit-cost snapshots and net-profit forecasting are not configured capabilities. Read-only advice never implies stock receipt, supplier payment, customer messaging or a successful sale.
