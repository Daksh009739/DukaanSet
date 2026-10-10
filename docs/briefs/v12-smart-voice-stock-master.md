# DUKAANSET V12 — ULTIMATE SMART VOICE STOCK AUTOMATION

## FINAL MASTER PROMPT — AUTO PRODUCT CREATION, MULTI-ITEM STOCK ENTRY, SMART PRICING, ONE-TAP SAVE & PREMIUM UI/UX

### PROJECT

**Product:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Existing System:** Global VoiceOS 2.0

**New Capability:** Intelligent Voice-to-Inventory Automation

**Main Goal:** Allow a shopkeeper to speak or type multiple products and quantities in natural Hindi, Hinglish or English. DukaanSet must automatically match existing inventory products or prepare new products when no suitable match exists, then save the entire validated stock entry with ONE confirmation.

**Core Experience:**

Speak → Understand Items → Match or Prepare Products → Review Quantities and Prices → Save All Stock.

**Design Philosophy:** Advanced automation in the backend. Radically simple experience in the frontend.

---

# 1. YOUR ROLE

Act as a complete implementation team:

- Principal AI Product Architect
- Senior Full-Stack Developer
- Inventory Systems Engineer
- Conversational AI Engineer
- Speech Recognition Specialist
- Database Architect
- Product Designer
- Mobile UI/UX Engineer
- Financial Software Engineer
- Security Engineer
- QA Automation Engineer

Implement this feature in the EXISTING DukaanSet application.

Do not create an independent inventory module.

Do not replace working stock logic with disconnected VoiceOS data.

Reuse existing:

- Global VoiceOS
- Products and Variants
- Inventory Services
- Product Creation
- Stock Movements
- Business Settings
- Authentication
- Role Permissions
- Multilingual Engine
- Dashboard
- Reports
- Audit Logs

Do not stop after generating mockups or UI designs.

Implement the actual working feature and verify it against real backend inventory records.

---

# 2. ANALYSE THE PROVIDED SCREENSHOT

The screenshot shows the current Stock Voice page at:

`/app/stock/voice`

The merchant entered:

"10 kilo pyaj 2 kilo Aalu add kar do kar do"

The system extracted products and quantities but displayed:

"No product matches. Choose a product or create one first."

This is the exact problem to eliminate.

### Current UX Issues

1. The merchant must manually choose products.
2. Missing catalogue entries block the workflow.
3. Each row has an unnecessary Add as New Product action.
4. The page displays too many input fields.
5. Product selection is visually more important than the speech result.
6. Quantity and unit controls are unnecessarily repetitive.
7. Microphone and stock draft are separated into bulky sections.
8. The page requires too much scrolling.
9. Pricing is not handled naturally.
10. The workflow does not feel automated.

### Required Redesign

Transform it into a premium, concise VoiceOS Stock Entry experience.

Remove mandatory manual product selection.

Remove per-product Add as New Product buttons from the normal workflow.

Remove blocking No Product Matches errors when a clearly identifiable new product can safely be prepared.

Instead, automatically prepare the product for creation within the same stock draft.

---

# 3. PRIMARY AUTOMATION RULE

## IF PRODUCT EXISTS → ADD TO ITS STOCK.

## IF PRODUCT DOES NOT EXIST → CREATE PRODUCT AND ADD STOCK.

Both paths must happen within ONE validated Save All Stock operation.

### Example

User says:

"10 kilo pyaz, 2 kilo aloo aur 20 kilo daal stock mein add kar do."

VoiceOS must:

1. Recognise three products.
2. Recognise their respective quantities.
3. Recognise kilograms as the unit.
4. Search the active business's inventory.
5. Match existing products where possible.
6. Prepare genuinely missing products for creation.
7. Show a concise combined draft.
8. Allow rate editing if relevant.
9. Wait for one Save confirmation.
10. Execute the validated backend operation.
11. Update the inventory and movement history.
12. Show a real success result.

Do not require a separate Add Product screen for each item.

Do not automatically commit stock while the merchant is speaking.

Automatic preparation and creation-on-confirmation are mandatory.

---

# 4. SINGLE PREMIUM STOCK REVIEW INTERFACE

The stock review should show a simple list.

### Example

**3 Products Ready**

Pyaz — 10 kg — New Product

Aloo — 2 kg — Existing Product

Daal — 20 kg — New Product

Primary Action:

**Save All Stock**

### UI Rules

- One clear Save button.
- No separate Save button per product.
- No mandatory product dropdown for confidently identified items.
- No unnecessary technical labels.
- No large blank textarea after transcription when a structured draft is available.
- No giant form for each individual product.
- No nested scrollbar problems.
- No multiple confirmation dialogs for normal stock entries.

Use compact product rows.

Allow users to expand a row to edit its details.

Keep the primary Save All Stock action visible.

---

# 5. AUTOMATIC NEW PRODUCT CREATION

When a product does not exist in the active shop's catalogue:

Prepare a new product automatically.

### Example

User says:

"10 kilo pyaz add karo."

No matching product exists.

The draft should display:

Product: Pyaz

Quantity: 10 kg

Status: New Product

On Save:

1. Validate the new product.
2. Create the product in the current business.
3. Configure its appropriate unit.
4. Create its initial inventory entry.
5. Record a stock movement of +10 kg.
6. Return the newly created product ID.
7. Refresh inventory and reports.

Do not create an empty product first and require another form to add quantity.

### Product Fields

Use the existing product model.

Automatically populate safely inferred values:

- Product name
- Canonical unit
- Initial stock quantity
- Active business reference
- Creation source: VoiceOS, where supported

Do not fabricate:

- Purchase cost
- Selling price
- Tax rate
- Brand
- Supplier
- Product category
- Expiry date
- Barcode

Use an appropriate uncategorised/default catalogue state only if the existing business model supports it and the merchant can edit it later.

When an essential required field is genuinely missing, request it inline without opening a separate product-creation workflow.

---

# 6. SMART EXISTING PRODUCT MATCHING

A robust matching engine is essential.

### Example

Merchant says:

"Aloo"

Existing product:

"आलू"

Or:

"Potato"

If the business has verified aliases connecting these names, recognise the same product.

Support:

- Exact product names
- Case-insensitive matching
- Hindi script
- Hinglish spellings
- Common spelling variations
- Approved product aliases
- Canonical product identities
- Product variants
- Unit compatibility

### Example Variations

Aloo

Aalu

आलू

Potato

These may map to the same product when justified by approved aliases or reliable existing catalogue context.

### Important Duplicate Protection

Do not create:

Aloo

Aalu

Aaloo

as three separate products if they clearly refer to one approved catalogue product.

However, do not merge genuinely different products.

### Ambiguous Match

If the shop contains:

Loose Aloo

Aloo 1 kg Pack

Ask:

"Kaunsa Aloo add karna hai?"

Present concise options.

Do not create a third product merely because the match was ambiguous.

---

# 7. SMART MULTI-PRODUCT EXTRACTION

VoiceOS must identify multiple items from one natural instruction.

### Example

"10 kilo pyaz, 2 kilo aloo aur 20 kilo daal stock mein add karo."

Expected extraction:

| Product | Quantity | Unit |
|---|---:|---|
| Pyaz | 10 | kg |
| Aloo | 2 | kg |
| Daal | 20 | kg |

Support:

- Multiple products
- Different units
- Singular and plural expressions
- Hindi number words
- English numbers
- Hinglish commands
- Spoken corrections
- Filler words
- Repeated words from speech transcription

### Example

"10 kilo pyaj 2 kilo aloo add kar do kar do."

The repeated "kar do" must not create duplicate items or double the stock.

### Important

Preserve the spoken association between product and quantity.

Do not accidentally assign one product's quantity to another.

Support large commands without forcing the merchant to split each item into a separate workflow.

---

# 8. SMART UNIT RECOGNITION

Support units relevant to Indian shops.

Examples:

- Kilogram
- Gram
- Piece
- Packet
- Box
- Litre
- Millilitre
- Metre
- Dozen
- Bag

Interpret common Hindi/Hinglish words.

Examples:

"5 kilo aloo" → 5 kg

"10 packet doodh" → 10 packets

"12 piece shirt" → 12 pieces

"2 litre tel" → 2 L

"3 dozen ande" → 36 pieces, only when the product's unit conversion is correctly configured

### Unit Safety

If an existing product uses grams and the user speaks kilograms, convert only through a valid supported unit conversion.

Do not convert packets to kilograms without configured pack contents.

If a spoken unit conflicts with an existing product variant or inventory unit, ask a targeted question.

Do not silently change inventory units.

---

# 9. SMART PRICING ENGINE — MANDATORY

Price understanding must be flexible but financially correct.

Distinguish:

1. Selling price per unit.
2. Purchase cost per unit.
3. Total batch purchase cost.
4. Total batch selling value, where explicitly provided.

These are different fields.

### Example A — Selling Rate

User:

"10 kilo pyaz add karo, selling price 40 rupaye kilo rakhna."

Draft:

Product: Pyaz

Quantity: 10 kg

Selling Price: ₹40/kg

Stock Addition: +10 kg

If the product already exists, show any selling-price change clearly before applying it.

### Example B — Total Purchase Cost

User:

"20 kilo daal total 1000 rupaye mein kharidi, stock mein add karo."

Draft:

Product: Daal

Quantity: 20 kg

Total Purchase Cost: ₹1,000

Derived Unit Purchase Cost: ₹50/kg

Selling Price: Not specified

### Example C — Selling Price and Purchase Cost

User:

"20 kilo daal 1000 rupaye ki kharidi, 70 rupaye kilo bechni hai."

Draft:

Quantity: 20 kg

Purchase Cost: ₹50/kg

Selling Price: ₹70/kg

### Important

Do not automatically assume purchase cost equals selling price.

Do not silently interpret every spoken rupee amount as a selling price.

If the merchant says:

"20 kilo daal ₹1000 ki add kar do."

And the meaning is genuinely ambiguous, ask one concise question:

"₹1000 poori daal ka purchase cost hai ya per-kilo selling rate?"

Provide quick choices and allow a spoken answer.

---

# 10. PRICE MISSING — KEEP WORKFLOW SIMPLE

User says:

"10 kilo pyaz aur 2 kilo aloo add karo."

No price is provided.

Do not reject the command solely because no price was spoken if the inventory system permits products without a final selling price.

### New Product

Show a compact editable rate field.

Example:

Pyaz — 10 kg

Selling Rate: Set later

If selling price is mandatory under the actual application's business rules, show one inline required rate input before Save.

Do not silently insert ₹0 as the actual selling price just to satisfy database validation.

### Existing Product

Keep the current selling price unless the merchant explicitly requests a change.

Do not overwrite existing prices with blank or guessed values.

### Important UI Rule

Price should be easy to provide without turning each product row into a long form.

Use compact inline editing.

---

# 11. VOICE PRICE CORRECTIONS

Support corrections to the same draft.

### Example

Initial:

"10 kilo pyaz add karo."

Follow-up:

"Pyaz ka rate 40 rupaye kilo rakhna."

VoiceOS must update the same draft row.

Another follow-up:

"Pyaz 10 nahi 15 kilo karo."

The quantity changes to 15 kg.

Do not create another Pyaz row.

If multiple similar products exist, resolve which item the correction refers to.

Do not commit any stock before final confirmation.

---

# 12. COMPACT EDITABLE PRODUCT ROWS

Recommended structure:

### Default Row

Product Name

Quantity + Unit

Rate, if configured

Status: New or Existing

### Expanded Row

Allow editing:

- Product Name
- Quantity
- Unit
- Selling Price
- Purchase Cost, where relevant
- Product Match, if ambiguous
- Variant, where relevant

Avoid displaying all editing fields by default.

### Remove Item

Allow removing a mistakenly recognised product.

A remove-row action must modify only the draft.

It must not delete an existing catalogue product.

---

# 13. ONLY ONE FINAL SAVE BUTTON

The merchant must see one clear primary action:

**Save All Stock**

This button saves the entire validated batch.

### Button Behaviour

When ready:

Enable Save.

When required information remains unresolved:

Keep the action visible but explain the specific missing information.

When saving:

Show a loading state and prevent duplicate submissions.

After success:

Show a consolidated success message.

### Example

**Stock Updated Successfully**

3 products processed.

2 new products created.

1 existing product updated.

Total added:

10 kg Pyaz

2 kg Aloo

20 kg Daal

Use actual backend results.

Do not invent success numbers.

### No Unnecessary Extra Buttons

Remove per-row:

- Add Product
- Save Product
- Confirm Product
- Save Stock

from the normal flow.

Retain only appropriate Edit, Remove, microphone and one final Save action.

---

# 14. ATOMIC PRODUCT CREATION AND STOCK UPDATE

This is a critical backend requirement.

One Save All Stock action may contain multiple existing and new products.

The backend must:

1. Validate the authenticated business.
2. Validate user permissions.
3. Validate the batch.
4. Recheck matching products at commit time.
5. Prevent accidental duplicates.
6. Create genuinely new products.
7. Add stock to existing products.
8. Create accurate inventory movements.
9. Preserve financial data consistency.
10. Commit all successfully as one logical operation.

Prefer a database transaction that atomically covers product creation and stock updates.

### Example

Batch:

10 kg Pyaz — New

2 kg Aloo — Existing

20 kg Daal — New

If a critical validation or database error occurs, do not leave a misleading partially successful stock batch.

Where all-or-nothing atomicity cannot be supported across systems, implement an explicit recovery strategy and accurately report partial completion.

Do not silently claim all three products were saved if only one succeeded.

---

# 15. EXISTING STOCK UPDATE LOGIC

If Aloo already exists with 8 kg available and the merchant adds 2 kg:

Existing Stock: 8 kg

Added Stock: +2 kg

New Available Stock: 10 kg

Record a traceable inventory movement.

Do not reset existing stock to 2 kg.

Do not create a duplicate Aloo product.

Do not overwrite existing product metadata unless the user explicitly requests an authorised change.

---

# 16. IMPORTANT DIFFERENCE — STOCK ENTRY VS PURCHASE

A stock-addition command is not necessarily a supplier purchase.

Example:

"10 kilo pyaz stock mein add karo."

This means add stock using the permitted inventory workflow.

Do not automatically create:

- Supplier purchase order
- Supplier payment
- Business expense
- GST purchase invoice

without the necessary information and intent.

If the merchant explicitly says:

"Gupta Traders se 10 kilo pyaz 300 rupaye mein kharida."

The system may prepare an appropriate supplier purchase/receiving workflow, depending on the existing business architecture.

Preserve the distinction between:

- Inventory Stock Adjustment
- Goods Receipt
- Supplier Purchase
- Supplier Payment

Do not create duplicate stock receipts from the same transaction.

---

# 17. NO DUPLICATE PRODUCTS OR STOCK MOVEMENTS

Implement idempotency and concurrency protection.

### Problems to Prevent

- Save button double-click.
- Network timeout followed by retry.
- Duplicate transcription events.
- Repeated speech fragments.
- Two users creating the same product simultaneously.
- A delayed response causing duplicate submission.

### Technical Requirements

Use:

- Stable batch request IDs
- Backend idempotency checks
- Appropriate database constraints
- Transaction isolation
- Revalidation of matching products
- Audit records

Do not assume disabling the button on the frontend is sufficient protection.

---

# 18. CENTRAL GLOBAL VOICEOS INTEGRATION

Do not create a disconnected Stock Voice engine.

The Global VoiceOS must understand:

"10 kilo pyaz stock add karo."

from anywhere inside DukaanSet.

If the merchant is on Customers, Bills or Home, the intent must still route to Inventory.

### Shared Infrastructure

Use:

- Global voice launcher
- Speech recognition
- Intent detection
- Entity extraction
- Product matching
- Stock draft builder
- Price clarification
- Save confirmation
- Existing inventory backend service

The `/app/stock/voice` page may remain as a focused stock-entry workspace.

Both the focused page and global assistant must reuse the same stock-command engine.

Do not maintain duplicate parsers with inconsistent behaviour.

---

# 19. PREMIUM NEW VOICE STOCK UI

Redesign the screenshot's layout completely.

### Suggested Structure

**Header**

Add Stock by Voice

**Microphone Area**

Large, prominent microphone

**Recognised Request**

Short transcript summary

**Product List**

Compact rows showing product, quantity and price

**Final Action**

Save All Stock

### Product List Example

Pyaz — 10 kg — New

Aloo — 2 kg — Existing

Daal — 20 kg — New

### Visual Design

Use DukaanSet colours:

Deep Teal: #103B36

Mint: #22C99D

Off-White: #F7FAF8

Amber: #F5B942

### UI Rules

- Simple typography.
- Consistent spacing.
- Compact product cards.
- Clear quantity and unit display.
- No huge empty textarea.
- No mandatory dropdown per product.
- No excessive warnings.
- No unnecessary instructional paragraphs.
- One prominent primary Save button.
- Editing available only when needed.

The design must feel like a premium retail SaaS product, not a complicated inventory administration form.

---

# 20. MOBILE-FIRST EXPERIENCE

Optimise for common Android devices.

### Mobile Layout

Top:

Voice microphone.

Middle:

Recognised products.

Bottom:

Sticky Save All Stock action.

When the merchant edits an item, use a compact inline editor or accessible bottom sheet.

Handle:

- Keyboard opening
- Mobile scrolling
- Safe areas
- Long product names
- Many recognised products
- Hindi text
- Accessible tap targets

Do not require horizontal scrolling.

Do not hide the Save button at the bottom of a long page.

---

# 21. REAL SPEECH RECOGNITION

Inspect the existing browser speech-recognition implementation.

The screenshot currently indicates that speech is transcribed through the browser, with rule- and alias-based product matching.

Improve the architecture appropriately.

Support:

- Hindi speech
- English speech
- Hinglish commands
- Spoken quantities
- Spoken numbers
- Product aliases
- Manual text fallback
- Speech permission errors
- Recognition failures

Use a transcription provider or browser speech API only when actually supported and configured.

Do not pretend that a rules-based parser is a connected generative AI service.

A hybrid parser may use deterministic unit/quantity handling and an optional AI extraction service with schema validation.

All extracted results must be validated against domain rules.

---

# 22. MULTILINGUAL SUPPORT

Use the existing DukaanSet language engine.

Supported UI languages:

- English
- Hindi
- Hinglish

### English

Add Stock by Voice

Products Ready

New Product

Existing Product

Save All Stock

### Hindi

बोलकर सामान जोड़ें

सामान तैयार है

नया सामान

पहले से मौजूद सामान

सारा स्टॉक सेव करें

### Hinglish

Bolkar Stock Jodo

Products Ready Hain

Naya Product

Pehle Se Hai

Saara Stock Save Karo

Keep display language separate from spoken language.

The merchant may speak Hindi while using English UI.

Do not translate original user-created product names destructively.

Use approved product aliases where appropriate.

---

# 23. BUSINESS-SPECIFIC STOCK AUTOMATION

Support different store categories.

### Grocery

"10 kilo pyaz aur 5 kilo aloo add karo."

### Clothing

"Blue Shirt XL 10 pieces aur Black Jeans 5 pieces add karo."

### Hardware

"20 pipe, 10 switch aur 5 box screws stock mein add karo."

### Vegetables

"15 kilo tamatar aur 8 kilo bhindi add karo."

### Mobile Accessories

"10 Type-C cables aur 5 chargers add karo."

Use business-aware product matching and units.

Do not invent incompatible variants.

Do not assign kilograms to shirts.

Do not turn a supplier purchase into a generic stock adjustment when the user clearly requested purchase recording.

---

# 24. SUCCESS SCREEN AND POST-SAVE NAVIGATION

After successful stock saving, show a concise summary.

### Example

**Stock Saved**

3 Products Updated

2 New Products Created

1 Existing Product Updated

Actions:

- View Stock
- Add More Stock

Use genuine backend data.

Refresh:

- Product list
- Stock detail pages
- Inventory summaries
- Relevant dashboard values
- Stock movement history

Do not show success before the backend confirms the operation.

---

# 25. ERROR HANDLING

Handle:

- Microphone permission denied
- Failed transcription
- Unrecognised quantity
- Conflicting units
- Ambiguous product names
- Duplicate catalogue matches
- Missing required price
- Invalid or negative quantities
- Existing product inactive
- Invalid selling-price override
- Insufficient permissions
- Concurrent product creation
- Network interruption
- Backend save failure

### UX Rule

Ask short, actionable questions.

Avoid technical errors such as:

"No product matches. Choose or create product first."

Instead, a genuinely new product should be prepared automatically.

Only request intervention when a real ambiguity or required validation issue exists.

Preserve the valid parts of the draft after an error.

---

# 26. SECURITY AND BUSINESS RULES

Ensure:

- Authentication
- Active-business isolation
- User permission checks
- Safe product creation
- Safe stock movements
- Price-change authorisation
- Input validation
- Audit logging
- Idempotency
- Correct multi-tenant database scoping

Treat transcript text as untrusted input.

Do not let product names or generated AI output bypass permission rules.

Do not allow unauthorised negative stock or price changes.

---

# 27. RECOMMENDED BACKEND ARCHITECTURE

Use reusable services, such as:

- VoiceStockIntentHandler
- StockCommandParser
- QuantityUnitExtractor
- ProductAliasResolver
- ProductMatchService
- AutoProductDraftBuilder
- StockPriceInterpreter
- StockDraftManager
- StockBatchValidator
- InventoryBatchService
- ProductCreationService
- StockMovementService
- VoiceStockAuditService

### Pipeline

Voice/Text Command

→ Transcription, if needed

→ Stock Intent Recognition

→ Multi-Product Extraction

→ Product and Unit Resolution

→ Existing/New Product Decision

→ Price Interpretation

→ Concise Editable Draft

→ One Save Confirmation

→ Atomic Backend Stock Update

→ Inventory Refresh

→ Accurate Success Summary

Use the application's real services rather than duplicating financial or inventory logic.

---

# 28. REAL-WORLD TEST SCENARIOS

### Scenario A — Two Missing Products

"10 kilo pyaz aur 2 kilo aloo add karo."

Both products absent.

Expected:

Prepare two new product drafts.

One Save creates both products and their correct initial inventory.

### Scenario B — One Existing, One New

"10 kilo pyaz aur 2 kilo aloo add karo."

Aloo exists.

Pyaz missing.

Expected:

Prepare Pyaz as new.

Prepare +2 kg for existing Aloo.

One Save commits both.

### Scenario C — Multiple Products

"10 kilo pyaz, 2 kilo aloo aur 20 kilo daal add karo."

Expected:

Three correctly extracted items.

One final Save.

### Scenario D — Purchase Cost

"20 kilo daal total 1000 rupaye mein kharidi, add karo."

Expected:

Purchase cost ₹50/kg, subject to the correct stock/purchase workflow.

Do not invent selling price.

### Scenario E — Selling Price

"10 kilo pyaz add karo, 40 rupaye kilo selling rate rakhna."

Expected:

10 kg stock.

Selling price ₹40/kg.

Apply any existing-product price change only after explicit validation.

### Scenario F — Ambiguous Amount

"20 kilo daal 1000 rupaye ki add karo."

Expected:

One short price-meaning clarification when context cannot reliably distinguish total purchase cost from another rate.

### Scenario G — Spoken Correction

"Pyaz 10 nahi 12 kilo karo."

Expected:

Existing draft changes from 10 kg to 12 kg.

No duplicate row.

### Scenario H — Repeated Save

User clicks Save twice.

Expected:

Only one committed inventory batch.

### Scenario I — Similar Product Names

"Aalu add karo."

Existing approved alias points to Aloo.

Expected:

Use existing product.

Do not create duplicate catalogue entries.

### Scenario J — Mixed Units

"2 kilo aloo aur 10 packet doodh add karo."

Expected:

Preserve correct product-specific units and quantities.

---

# 29. AUTOMATED QA REQUIREMENTS

Test:

- Speech transcription
- Typed stock commands
- Hindi product names
- Hinglish aliases
- Multiple products
- Quantity extraction
- Unit extraction
- Price interpretation
- Existing-product matching
- New-product drafting
- Duplicate prevention
- Product variants
- Draft corrections
- Missing-price rules
- One-save batch operation
- Atomicity
- Idempotency
- Backend permissions
- Tenant isolation
- Inventory movement records
- Product creation
- UI refresh
- Error recovery
- Mobile responsiveness
- English/Hindi/Hinglish UI

Run real integration tests with the inventory database.

Do not use hardcoded success states.

---

# 30. CI/CD AND DEPLOYMENT

Integrate with the existing DukaanSet workflow:

feature/* → dev → main

Run:

- Type checking
- Linting
- Parser tests
- Product-matching tests
- Inventory batch tests
- Database integration tests
- Permission tests
- Idempotency tests
- Localization checks
- UI tests
- End-to-end stock-entry tests
- Build verification

Verify behaviour in the configured Vercel staging environment.

Use isolated demo inventory data.

Do not perform production stock changes during testing.

Do not claim deployment or live voice recognition without actual verification.

---

# 31. IMPLEMENTATION PRIORITIES

## PHASE 1 — REMOVE THE CURRENT UX FRICTION

- Audit `/app/stock/voice`.
- Remove mandatory product dropdowns.
- Remove individual Add as New Product steps.
- Build compact editable stock rows.
- Add one Save All Stock action.
- Improve microphone and transcript presentation.

## PHASE 2 — AUTOMATIC PRODUCT HANDLING

- Exact and alias matching.
- Safe new-product drafting.
- Product creation at save time.
- Correct unit handling.
- Existing-stock increments.
- Duplicate prevention.

## PHASE 3 — SMART PRICING

- Selling rate extraction.
- Purchase cost extraction.
- Total amount interpretation.
- Per-unit rate calculations.
- Price clarification.
- Inline rate editing.
- Existing-price preservation.

## PHASE 4 — GLOBAL VOICEOS INTEGRATION

- Reuse global intent routing.
- Multi-item instructions.
- Spoken corrections.
- Unified stock draft.
- Real backend inventory integration.

## PHASE 5 — COMPLETE VALIDATION

- Mobile UI polish.
- English/Hindi/Hinglish.
- Security.
- Financial accuracy.
- Atomicity.
- Idempotency.
- Automated tests.
- Staging verification.

---

# 32. FINAL ACCEPTANCE CRITERIA

Do not mark this feature complete until:

1. A merchant can speak multiple stock items naturally.
2. The system extracts correct product names and quantities.
3. Existing catalogue products are matched automatically.
4. Genuinely missing products are prepared for automatic creation.
5. New products are created as part of the confirmed Save operation.
6. Stock is added without separate product-creation forms.
7. The interface shows one clear Save All Stock button.
8. There are no mandatory product-selection dropdowns for resolved items.
9. Similar aliases do not create duplicate products.
10. Quantity corrections update the current draft.
11. Selling prices and purchase costs are handled separately.
12. Ambiguous prices trigger concise clarification.
13. Missing optional prices do not unnecessarily block stock entry.
14. Existing product prices are not silently overwritten.
15. Units and variants are validated.
16. All items are saved through a safe batch operation.
17. Double clicks and retries do not double stock.
18. Inventory movement history is accurate.
19. Existing stock is incremented, not overwritten.
20. The global assistant can perform the same stock workflow.
21. Hindi, Hinglish and English input are supported.
22. The UI is modern, premium and mobile-friendly.
23. The screenshot's confusing workflow is replaced.
24. The backend saves real products and inventory movements.
25. Actual automated and end-to-end tests pass.

---

# FINAL EXECUTION INSTRUCTION

Transform the existing DukaanSet Voice Stock functionality into a genuinely intelligent inventory automation experience.

Use the supplied screenshot as the baseline of current UX problems.

When the shopkeeper says:

"10 kilo pyaz, 2 kilo aloo aur 20 kilo daal add karo."

Automatically:

- Understand the complete command.
- Extract each product.
- Extract the correct quantity and unit.
- Match existing inventory.
- Prepare missing products for creation.
- Interpret any provided prices.
- Display a concise editable list.
- Provide ONE final Save All Stock button.
- Create all new products and update all existing stock safely after confirmation.
- Record accurate inventory movements.
- Refresh all affected application views.

Never force the shopkeeper to manually visit Add Product for every missing catalogue item.

Never block a clear new-stock command simply because the product does not yet exist.

Never invent prices, costs, categories or tax values.

Never save unconfirmed financial or inventory changes.

Never create duplicate products or double-count stock.

Keep everything integrated with the existing business services.

## FINAL MAIN WORKFLOW

**User Speaks → Products Identified → Existing/New Products Resolved → Quantities and Prices Prepared → One Save → Stock Updated.**

## FINAL PRODUCT PHILOSOPHY

**The shopkeeper should only need to tell DukaanSet what stock arrived. DukaanSet should handle the catalogue and inventory work.**

## PRODUCT PROMISE

**DukaanSet VoiceOS — Bolo Kitna Stock Aaya, Baaki Sab Set.**

**BEGIN COMPLETE IMPLEMENTATION IN THE EXISTING DUKAANSET CODEBASE. DO NOT STOP AT MOCKUPS, PLANNING OR FAKE AUTO-CREATION DEMOS.**
