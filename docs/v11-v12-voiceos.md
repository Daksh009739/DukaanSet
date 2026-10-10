# V11.1 conversational VoiceOS and V12 stock automation

The global VoiceOS button opens a compact microphone-first panel from any business page. It shows three contextual suggestions, an optional single-line command input, and hidden microphone settings. The display language and spoken language are independent. English, Hindi and Hinglish display copy shares the existing localisation engine; available browser recognition locales are English (India) and Hindi (India).

## Conversational operations

`advanceVoice` resolves explicit commands before using an active draft or page context. A customer page can prepare a bill, and a stock page can record a customer payment. Missing products, quantities, rates or payment methods remain questions; the interface never saves merely because recognition stopped.

Try these typed or spoken sequences in a fictional demo:

1. `Chetna ka bill banao` → `5 kilo aloo` → `200 rupaye` → `Cash` → review **Confirm & Save**.
2. `Neel customer add karo aur uska 5 kilo aloo 200 rupaye mein bill bana do, cash mila` → review customer, item, rate and payment → **Confirm & Save**.
3. `20 kilo daal total 1000 rupaye mein kharidi, stock mein add karo` → supply the required selling rate → **Save All Stock**.
4. `10 kilo pyaz add karo, selling price 40 rupaye kilo rakhna` → `pyaz 10 nahi 12 kilo` → **Save All Stock**.

New customer names retain their original spelling and case. Phone numbers are optional. Existing ambiguous names require a selection. Customer creation plus the dependent sale use `/voice-sale` and one database transaction: an invalid sale cannot leave an orphan customer. Catalogue prices, stock availability, integer currency calculations and permissions are checked again by the existing server.

Sales, customer creation, customer collections, expenses and stock save from the conversation panel. Supplier payments open the existing confirmation form with the supplied amount/method. Purchases, supplier creation, demand recording, reorder receiving and follow-ups use the existing reviewed workflows. Read-only report requests use business-scoped report data. Invoice requests reuse Invoice Studio and Customer Hisaab; WhatsApp preparation reuses its explicit review and send controls. Daily closing opens the existing counted/reviewed closing workflow. These handoffs are intentional: those specialised forms own their additional required fields and final confirmation.

## Shared stock engine

Global stock commands and `/app/stock/voice` both call `prepareStockCommand`. Resolved products appear as compact rows. Unmatched products become new-product drafts automatically, with no separate creation action. Rows expand for quantity, unit, price, optional cost, SKU and variant changes. One **Save All Stock** writes the whole batch and its inventory movements.

The current catalogue requires a selling rate when creating a product. That field is asked inline; it is never invented. Existing prices remain unchanged unless a selling-rate change is explicitly prepared and reviewed. A blank optional cost uses the catalogue's existing zero/default convention and is not evidence of a known purchase cost.

Selling rate, total batch selling value, per-unit purchase cost and total batch purchase cost have separate meanings. Ambiguous amounts ask whether they mean a selling rate or batch cost. Exact unit conversions operate on integer paise and milli-units. If a rate cannot be represented exactly, the batch stays unresolved. Quantity corrections recompute an explicit batch purchase cost's unit cost. A quantity correction inconsistent with an existing selling total requires review; it cannot silently change the selling rate.

Stock receipts retain cost/price snapshots in inventory history. They do not invent a supplier, purchase invoice, cash payment or debt. To record those liabilities or cash movements, use the purchase workflow. Repeated canonical aliases within a batch merge their quantities and compatible cost totals. Similar catalogue variants stay ambiguous. A new catalogue match appearing before save rejects the stale draft rather than creating a duplicate.

## Recovery and server boundaries

Draft storage is scoped to the signed-in user and business. Before a write, the exact request and idempotency key are frozen in session storage. An uncertain response can be retried after reload with that same request. A confirmed validation failure allows editing. Unsaved global drafts expire after 30 minutes; uncertain submitted requests remain recoverable. Stock drafts retain the existing 24-hour recovery policy.

The server validates membership, feature/role permissions, open business sessions, product/customer ownership, price changes and compatible conversions. The stock transaction creates products, increments stock, writes inventory movements and audit entries together. Failed batches roll back; repeated keys replay the saved result. No schema migration is needed for this release. The runtime revision changes so development reloads the expanded Store safely.

## Speech and hosting limits

Capture uses the real browser Web Speech API with typed fallback, permission/error handling, one shared microphone owner and teardown on navigation. Stopping recognition prepares a review; it does not save. Tests cover the capture adapter using deterministic recognition doubles. They do not establish physical microphone quality or transcription accuracy on every device.

There is no configured paid generative speech/LLM provider in this environment. Interpretation is deterministic and does not claim unrestricted language understanding. Official WhatsApp sending still requires the separately configured provider and templates; this change sends no real messages.

Vercel remains the frontend/gateway. A configured HTTPS `DUKAANSET_BACKEND_ORIGIN` must point to the persistent Node.js 24 backend with private durable SQLite storage. The existing staging prerequisite is unresolved; local verification and a green source PR must not be described as a verified live staging deployment. Main and production promotion remain separate from the dev integration.

## Verification

`tests/conversation.test.ts` covers multi-turn instructions, corrections, alias matching, separated prices, exact unit conversions, required fields, customer/sale rollback, batch rollback, tenant access, stale catalogue races and idempotency. `tests/e2e/conversation.spec.ts` covers actual UI writes, lost-response recovery, automatic product drafts, stock batch pricing, four viewport widths and accessibility. Existing VoiceOS, inventory, localisation, invoice, dashboard and closing suites retain their financial assertions.

`scripts/qa/v12-production-review.mjs` exercises the compiled production application with a private fictional shop. It verifies a dependent customer/sale, focused new-product stock, global stock increments and explicit price changes, mobile accessibility and runtime errors. CI runs this after the existing compiled closing/timer review. See [release evidence](v11-v12-test-report.md) for measured results and remaining external checks.
