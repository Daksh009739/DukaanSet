# V15 Global VoiceOS

Customer, supplier and product roles are extracted separately before catalogue resolution. The Rahul/Daal commands now retain Rahul as the customer and Daal as the product. Bill verbs, payment words and supplier phrases cannot become product titles. Customer-plus-add commands without a clear bill or stock action ask for clarification. Repeated command words, Hindi numbers, fractional quantities, split receipts and corrections stay in the scoped conversation.

The shared action registry still delegates writes to existing domain services. Sales and dependent new-customer creation commit atomically. Stock uses the existing reviewed multi-product batch. Payments, expenses, purchases, suppliers, DemandPulse, documents, closing and customer/product edits retain their permission checks and final domain confirmation. A supplier purchase cost is separate from a selling rate; spoken-unit rates convert exactly to the catalogue unit. Confirmed requests retain their idempotency key after an uncertain network response.

Global VoiceOS and Business Assistant share the interpreter. The existing dashboard composition, top-level microphone, prominent stock entry and sidebar overlap correction are preserved. Resolved sale rows show the catalogue product image. Typed input remains available. Optional spoken report replies use installed device voices, start only on request and stop before microphone capture; no installed voice is represented as available when absent.

## Business intelligence

The global panel and `/app/intelligence` expose four actual tools. ProfitPilot uses recorded session sales and catalogue costs, explains cost coverage and shows gross-profit estimates only when its prerequisites hold. It explicitly labels current catalogue cost as an estimate, rather than historical cost of goods or net profit. Returns or incomplete costs make that estimate unavailable. The action center links actual low-stock products, customer balances and eligible consented DemandPulse requests.

The reorder planner reads complete recent invoice records, saved minimum stock, current stock and permitted open demand. Lead time and coverage are editable assumptions. Unreceived reorder drafts are displayed separately: the application has no supplier acknowledgement workflow, so they are never reported as confirmed incoming stock. Final confirmation saves an unreceived draft and changes neither inventory nor supplier payable. A lost-acknowledgement browser test verifies that retry creates one draft.

The what-if simulator uses exact money and quantity arithmetic to show purchase cost, potential sales, gross profit, margin and markup. It has no business transaction or Save action. Conditional `agar`/`if` commands remain simulations even if a provider proposes a sale.

Purchase Bill Intelligence accepts pasted text, text files and text PDFs, bounded to 2 MB, ten PDF pages and 20,000 text characters. The supported line format is `10 kg Daal @ 50`, with `Supplier:` and `Total:` fields. Extraction validates scoped catalogue matches and totals, exposes unparsed lines and warns about mismatches. The merchant can resolve supplier and product variants, acknowledge the original invoice, then open the existing editable purchase receipt form. Extraction itself never receives goods or records payment. Cost, quantity and payment remain editable in the receipt form, whose final confirmation is authoritative.

## Optional structured interpretation

The authenticated server integration calls the real OpenAI Responses API when `AI_PROVIDER=openai`, `OPENAI_API_KEY` and `OPENAI_MODEL` are configured. It sends the command only after the merchant selects the provider option; it sends neither the customer catalogue nor business record IDs. Strict structured output rejects unexpected fields, unsupported names/numbers and unspoken payment methods. Model values resolve against actual scoped records, require review and cannot specify execution paths, IDs, SQL or database tools. Provider refusal, timeout, incomplete output, malformed output or missing configuration leaves local parsing available. Late responses cannot replace a closed or business-switched conversation.

The request follows the official [Responses structured-output guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). Contract tests inject controlled fetch responses; they verify privacy and failure handling without making a paid provider call.

## Verification and practical limits

The labelled corpus covers Hindi, English and Hinglish; customer and supplier roles; multiple products; quantities and units; prices and split payments; variants; corrections; repeated/noisy wording; ambiguous intent; and read-only commands. The evaluator measures intent and labelled slot correctness, and records parser-only latency separately. These are regression measurements on a small manually labelled corpus, not real-world speech recognition accuracy.

Browser tests read back actual invoices, inventory, purchases and drafts. They cover sale clarification and commitment, conditional simulation, lost-acknowledgement reorder recovery, purchase extraction, variant choice, three languages, 1440/390/320 px layouts and WCAG checks. Compiled checks repeat the core workflows on an isolated production build. Existing financial, security, microphone, document, stock, closing and multilingual gates remain in Quality.

Live microphone recognition, installed TTS voice pronunciation and live OpenAI interpretation still require device/provider acceptance testing. Image/scanned-PDF OCR is not connected; verified OCR text can be pasted. The extractor does not infer taxes, discounts, freight or unsupported invoice layouts. Those details require review in the existing manual workflow. No fake OCR result, delivery confirmation, historical profit or supplier acknowledgement is presented.

Vercel staging still needs the persistent HTTPS backend URL in `DUKAANSET_BACKEND_ORIGIN`. The previously inspected preview failed because this configuration was absent. This release targets dev through exact-head Quality checks; it does not claim a working hosted deployment or advance main/production.
