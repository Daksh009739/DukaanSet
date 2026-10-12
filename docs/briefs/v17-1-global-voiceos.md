# DUKAANSET V17.1 — FINAL ULTIMATE GLOBAL VOICEOS MASTER PROMPT

## TRANSFORM VOICEOS INTO DUKAANSET'S MOST ADVANCED, RELIABLE AND PREMIUM CORE BUSINESS EXPERIENCE

**Product:** DukaanSet — Apni Dukaan, Sab Set.

**Main Product Pillar:** Global VoiceOS

**Primary Goal:** Make the EXISTING DukaanSet VoiceOS genuinely intelligent, extremely easy to use, highly reliable and fully integrated across the entire application.

**Core Experience:**

Bolo → DukaanSet Samjhe → Details Verify Kare → Draft Dikhaye → Confirm Karo → Kaam Ho Jaye.

---

## 1. ABSOLUTE PRIORITY — VOICEOS IS OUR MAIN X-FACTOR

VoiceOS must not behave like basic speech-to-text, a collection of fixed commands or a decorative microphone.

It must work as a **universal conversational business action assistant**.

A normal shopkeeper should be able to speak naturally without learning commands, opening specific modules or manually filling complicated forms.

The assistant must understand everyday Hindi, Hinglish and English, identify the intended action, resolve actual business records and prepare the relevant operation.

**Do not stop at UI improvements. Audit the existing VoiceOS, fix root causes and implement actual end-to-end functionality.**

---

## 2. UNDERSTAND NATURAL AND UNEXPECTED COMMANDS

Support different ways of asking for the same action.

Examples:

"Rahul naam ka customer bana do."

"Ek naya customer add karna hai."

"10 kilo daal stock mein daal do."

"Inventory mein daal 10 kilo badha do."

"Rahul ko 10 kilo daal bechi."

"Rahul ke naam se bill bana do."

"Maggi Masala naam ka product add karna hai."

"500 rupaye Rahul se cash mile."

"Aaj business mein kya chal raha hai?"

"Maggi ka kitna stock mangwana chahiye?"

Do not depend only on exact predefined phrases.

Implement a reliable hybrid natural-language interpretation layer with structured outputs and deterministic business validation.

If a merchant says:

"Best product add kar do."

Do not invent a product or automatically create something called Best Product. Determine whether they mean a specific product name, recommendation or new-product creation, then ask the smallest necessary clarification.

---

## 3. PERFECT CUSTOMER AND PRODUCT SEPARATION

This is mandatory.

### Example

User says:

"Rahul ke naam se 10 kilo daal ka bill bana do."

VoiceOS must understand:

- Intent: CREATE_SALE
- Customer: Rahul
- Product: Daal
- Quantity: 10
- Unit: kg

**Correct Product Title: Daal**

**Correct Customer: Rahul**

Never create:

- Rahul Daal
- Rahul Ke Naam Se Daal
- 10 Kilo Rahul Daal
- The entire spoken sentence as a product title

Use semantic entity-role extraction and strict structured validation.

Never concatenate customer details with product names.

---

## 4. AUTOMATIC SALES VS STOCK INTENT

### Sales Command

"Rahul ko 10 kilo daal bechi."

Prepare a sale for Rahul.

Resolve Daal from actual inventory.

Validate quantity, selling price and payment.

Show an editable bill draft.

After confirmation, create the actual invoice, deduct inventory and update the ledger.

### Stock Command

"10 kilo daal stock mein add karo."

Prepare an inventory addition.

If Daal exists, increase its stock.

If missing, prepare product creation and stock addition together.

Show one stock draft.

After confirmation, update inventory.

### Ambiguous Command

"Rahul ke naam se 10 kilo daal add kar do."

If intent remains unclear, ask:

"Rahul ka bill banana hai ya stock add karna hai?"

Never guess and commit the wrong action.

---

## 5. INTELLIGENT MULTI-TURN CONVERSATION

VoiceOS must remember current task information.

Example:

User: "Rahul ka bill banao."

VoiceOS: "Kaunsa samaan liya?"

User: "10 kilo daal."

VoiceOS: "Kitne rupaye kilo?"

User: "100 rupaye."

VoiceOS: "Cash, UPI ya udhaar?"

User: "500 cash, baaki udhaar."

VoiceOS prepares:

Customer: Rahul

Product: Daal

Quantity: 10 kg

Unit Price: ₹100

Total: ₹1,000

Cash: ₹500

Udhaar: ₹500

Primary Action: Confirm & Save Bill

The assistant must not forget Rahul or ask for already supplied details.

Support corrections:

"Rahul nahi, Rohan."

"10 kilo nahi, 12 kilo."

"Cash nahi, UPI."

"Moong dal hai, normal daal nahi."

Update the SAME draft and revalidate it.

Do not create duplicate items.

---

## 6. COMPLETE APPLICATION-WIDE AUTOMATION

Integrate VoiceOS with the existing supported services:

- Customer Creation
- Customer Search and Details
- Product Creation
- Inventory Addition
- Stock Checking
- Sales and Billing
- Multi-Product Billing
- Payments and Udhaar
- Purchases and Suppliers
- Goods Receiving
- Expenses
- DemandPulse
- Reports
- Smart Invoice Studio
- Payment Receipts
- WhatsApp Document Sharing
- Smart Shop Closing
- ProfitPilot AI
- Smart Reorder Planner
- Purchase Bill Intelligence
- What-If Simulator
- Smart Action Center

VoiceOS must work from any authenticated page.

The current page may provide useful context, but an explicit spoken command must take priority.

Use ONE global action registry and existing domain services.

Do not create separate disconnected voice implementations for different modules.

---

## 7. AUTOMATIC PRODUCT CREATION AND STOCK ENTRY

If the merchant says:

"10 kilo pyaz, 20 kilo aloo aur 5 kilo daal stock mein add karo."

VoiceOS must:

1. Identify all three items.
2. Extract their quantities and units.
3. Search existing catalogue records.
4. Match existing products and verified aliases.
5. Prepare missing products for automatic creation.
6. Preserve correct product titles.
7. Ask about required price/unit details only when necessary.
8. Show one compact editable list.
9. Provide ONE Save All Stock button.
10. Commit the validated batch safely.
11. Update inventory movements.
12. Trigger background product-image enrichment where supported.

Do not block valid new products with mandatory "Choose Product" dropdowns.

Do not invent selling prices.

Do not duplicate products or stock movements.

---

## 8. ADVANCED INDIAN LANGUAGE UNDERSTANDING

Support natural:

- Hindi
- English
- Hinglish
- Mixed-language sentences
- Different Indian accents
- Romanized Hindi spellings
- Common shopkeeper expressions
- Spoken quantities
- Number words
- Informal corrections

Examples:

"ढाई किलो आलू"

"aadha kilo daal"

"das packet Maggi"

"do shirt XL size"

"paanch sau rupaye"

"ek hazaar rupaye total"

Correctly identify numerical values and units.

Do not confuse total price with per-unit price.

Do not combine unrelated products or quantities.

Use configurable product aliases and actual catalogue context.

Do not assume every similarly pronounced product is identical.

---

## 9. PREMIUM NEXT-GENERATION VOICEOS UI/UX

Redesign the existing VoiceOS using DukaanSet's approved premium visual system.

**Colours:**

Deep Teal: #103B36

Mint: #22C99D

Off-White: #F7FAF8

Charcoal: #1A2624

### Initial Interface

Show only:

- DukaanSet VoiceOS branding
- Active shop name
- One large microphone
- "What would you like to do?"
- Two or three helpful commands
- Optional text input

### Listening

Elegant microphone pulse or waveform.

Clearly show Listening and Stop.

### Understanding

Show an appropriate processing state.

### Clarification

Display one natural question with quick-answer suggestions.

### Draft Ready

Show a beautiful structured card.

Example:

**New Product Ready**

Product: Maggi Masala

Quantity: 20 packets

Selling Price: ₹15/packet, if actually provided or verified

Action: Add Product & Stock

**Confirm & Save**

### Success

Show genuine saved record details and relevant next actions.

### Mobile

Use a polished bottom sheet/full-screen conversational view with accessible controls and sticky confirmation.

Remove complicated intent selectors, duplicate language settings, oversized forms and excessive scrolling.

Preserve the approved Dashboard Hero and global microphone placements.

---

## 10. MY RECOMMENDATION — SMART VOICE PREVIEW

Every command must show exactly what the assistant understood.

Use compact editable preview cards showing relevant:

- Action
- Customer
- Product
- Quantity
- Unit
- Price
- Payment
- Resulting stock or balance impact

Do not expose technical internal field names.

Allow manual corrections without restarting the microphone.

For multi-item commands, show a concise combined list instead of separate full forms.

---

## 11. MY RECOMMENDATION — CONTEXTUAL INTELLIGENCE

Understand context from the current page when helpful.

Examples:

On Rahul's Customer Details:

"Iska pending paisa batao."

Resolve Rahul.

On Daal's Product Details:

"Isme 10 kilo aur add karo."

Resolve the displayed Daal product.

On an Invoice Detail page:

"Iska PDF WhatsApp ke liye prepare karo."

Resolve that specific invoice.

Always verify business scope and entity permissions.

Never silently use an outdated page context when the merchant explicitly names another record.

---

## 12. MY RECOMMENDATION — VOICE-FIRST, NOT VOICE-ONLY

Support both speech and typed natural-language requests through the same interpretation pipeline.

If microphone access fails, the merchant should continue by typing.

Provide optional spoken assistant replies only if an actual text-to-speech capability is available.

Keep spoken replies short and optional.

Do not force voice playback in a busy shop.

Support microphone cancellation, permission recovery and appropriate privacy controls.

Never commit from incomplete interim transcripts.

---

## 13. MY RECOMMENDATION — SAFETY WITHOUT EXTRA FRICTION

Classify actions:

### Read-Only

"Aaj ki sale batao."

Return actual data immediately.

### Navigation

"Customers kholo."

Open the authorised page.

### Write Action

"Rahul ka bill banao."

Prepare draft → review → confirm → execute.

### High-Risk Action

Refund, reversal, stock write-off, final shop closing or sensitive financial correction.

Apply stronger domain-specific validation and permissions.

**One confirmation for a normal complete action.**

Do not require unnecessary repeated confirmation steps.

Do not let AI bypass backend validation.

---

## 14. MY RECOMMENDATION — REAL AI + DETERMINISTIC BUSINESS ENGINE

Use a hybrid architecture:

Speech Recognition

→ Natural Language Understanding

→ Structured Intent and Entity Extraction

→ Customer/Product/Supplier Resolution

→ Business Rules Validation

→ Missing Information Clarification

→ Editable Draft

→ User Confirmation

→ Existing Authorised Backend

→ Verified Result

Use AI for language understanding and natural responses.

Use deterministic application services for:

- Financial calculations
- Inventory movements
- Customer balances
- Product pricing
- Permissions
- Invoice creation
- Purchase receiving
- Tax and discount rules

Do not execute arbitrary AI-generated database instructions.

Use strict schemas, transaction boundaries, idempotency and audit logs.

---

## 15. MY RECOMMENDATION — RECOVERABLE ACTIONS

Support mistakes and interruptions gracefully.

If the merchant says:

"Cancel karo."

Cancel the pending draft without saving.

If they say:

"Change karna hai."

Open the relevant draft field.

If the backend save fails:

Preserve the draft and provide a safe retry.

If a transaction already succeeded but needs correction:

Use the existing authorised return, refund, reversal or adjustment workflow.

Never silently delete an already committed financial transaction or pretend an unsafe operation was undone.

---

## 16. MY RECOMMENDATION — VOICEOS LEARNING AND QUALITY IMPROVEMENT

Create a privacy-conscious quality system.

Measure:

- Intent accuracy
- Customer/product separation accuracy
- Correct quantity recognition
- Product matching accuracy
- Number of clarifications
- Draft correction rate
- Successful confirmed actions
- Backend failures
- Average response latency
- Microphone failures
- User abandonment

Create an evaluation dataset of real-world Hindi, English and Hinglish shop commands.

Use consented, appropriately protected examples for improvements.

Do not automatically modify financial rules based on conversational history.

Add regression tests for every discovered interpretation failure.

---

## 17. CURRENT DATE AND BUSINESS CONTEXT

Use the actual current runtime date and active business timezone.

Correctly interpret:

- Aaj
- Kal
- Parso
- Yesterday
- This Week
- Last Month
- Previous Business Day

Respect the shop's closing cutoff.

Do not hardcode demonstration dates.

Read all financial and inventory information from authoritative business services.

Clearly distinguish actual values, estimates and simulations.

---

## 18. PERFORMANCE AND RELIABILITY

Prioritise fast interactions on normal Android devices and ordinary shop internet connections.

Implement:

- Fast assistant opening
- Stable microphone lifecycle
- Efficient transcription
- Scoped entity search
- Cached appropriate metadata
- Responsive structured drafts
- Clear network failure states
- No duplicate commits
- Secure business-specific sessions
- Appropriate backend logging

Do not claim a speech provider or AI integration works without a real configured and tested service.

If an advanced interpretation provider is unavailable, offer the working supported fallback and manual entry.

---

## 19. MANDATORY END-TO-END TESTS

Test at minimum:

**Customer:** "Rahul naam ka customer add karo."

**Product:** "Maggi Masala naam ka product add karo."

**Stock:** "10 kilo daal stock mein add karo."

**Bill:** "Rahul ko 10 kilo daal ka bill banao."

**Payment:** "Rahul ke ₹500 purane udhaar cash mein jama karo."

**Multi-Product:** "10 kilo pyaz aur 5 kilo aloo add karo."

**Correction:** "5 kilo nahi 8 kilo karo."

**Missing Detail:** "Ek product add kar do."

**Ambiguous Intent:** "Rahul ke naam se daal add kar do."

**Read-Only:** "Aaj kitni sale hui?"

**Closing:** "Aaj ka closing summary dikhao."

**Intelligence:** "Maggi ka kitna reorder karna chahiye?"

For every command verify:

- Correct intent
- Correct entity roles
- Correct actual business records
- Correct required clarifications
- Correct structured preview
- No unauthorised writes
- Correct backend execution after confirmation
- No duplicate transactions
- Correct affected-module refresh

Test actual microphone-to-backend flows, not just typed inputs.

Include multilingual tests, Playwright E2E tests, mobile tests, permission tests and database consistency tests.

---

## 20. IMPLEMENTATION EXECUTION ORDER

### Phase 1 — Core Root Cause Fixes

Fix incorrect parsing, customer/product contamination, intent routing, units, quantities, aliases and business-context handling.

### Phase 2 — Premium Conversational UI

Redesign the assistant using the approved DukaanSet visual language.

Implement listening, clarification, editable drafts, confirmation, success and error states.

### Phase 3 — Complete Business Integration

Connect Customers, Products, Stock, Billing, Payments, Purchases, Expenses, DemandPulse, Reports, PDFs, WhatsApp and Shop Closing through real existing backend services.

### Phase 4 — Advanced Intelligence

Integrate ProfitPilot AI, Reorder Planner, Purchase Bill Intelligence, What-If Simulator and Smart Action Center.

### Phase 5 — Production Reliability

Implement quality evaluation, security, permissions, idempotency, performance optimisation, multilingual regression tests and staging verification.

Complete each phase with working functionality.

---

# FINAL ACCEPTANCE CRITERIA

VoiceOS is complete only when:

1. Natural Hindi, English and Hinglish requests work across supported workflows.
2. Customer and product names are reliably separated.
3. Sales and Stock operations are never silently confused.
4. Missing products can be prepared for creation.
5. Existing inventory updates correctly.
6. Customer, billing and payment records remain financially accurate.
7. Normal incomplete commands trigger helpful short clarifications.
8. Multi-turn conversation preserves the current draft.
9. Voice corrections update the right fields.
10. Every write shows an understandable preview.
11. One clear confirmation executes the authorised action.
12. Actual backend records update correctly.
13. No duplicate transactions are created through retries.
14. VoiceOS works globally from authenticated pages.
15. Premium desktop and mobile interfaces are consistent.
16. Microphone permission and provider errors have usable fallbacks.
17. All three display languages are supported.
18. Role permissions and tenant isolation are enforced.
19. Critical speech, semantic and end-to-end tests pass.
20. Unimplemented or unverified functionality is not advertised as working.

---

# FINAL NON-NEGOTIABLE RULES

DO NOT BUILD A BASIC KEYWORD-ONLY VOICE ASSISTANT.

DO NOT SAVE CUSTOMER NAMES INSIDE PRODUCT TITLES.

DO NOT CONFUSE SALES WITH STOCK ADDITIONS.

DO NOT FABRICATE PRICES, CUSTOMERS, PRODUCTS OR PAYMENT METHODS.

DO NOT FORCE USERS TO SELECT MODULES BEFORE SPEAKING.

DO NOT ASK THE SAME QUESTION REPEATEDLY.

DO NOT EXECUTE FINANCIAL WRITES WITHOUT CONFIRMATION.

DO NOT DUPLICATE EXISTING DOMAIN SERVICES.

DO NOT CLAIM SUCCESS BEFORE THE REAL BACKEND CONFIRMS.

DO NOT LEAVE VOICEOS AS A FRONTEND-ONLY DEMO.

DO NOT STOP AT VISUAL DESIGN OR BASIC TRANSCRIPTION.

## FINAL EXECUTION DIRECTIVE

**Completely enhance and rebuild the existing VoiceOS experience, fixing its actual weaknesses and connecting it safely to every supported DukaanSet business workflow.**

Prioritise natural conversation, semantic correctness, minimum merchant effort, fast execution, premium UI/UX and production-grade reliability.

## THE FINAL PRODUCT EXPERIENCE

**Merchant Speaks Naturally**

↓

**VoiceOS Understands Correctly**

↓

**Finds Relevant Real Data**

↓

**Asks Only Missing Details**

↓

**Shows a Clean Action Draft**

↓

**Merchant Confirms**

↓

**DukaanSet Executes Safely**

↓

**All Relevant Business Records Update**

## FINAL PRODUCT PROMISE

**DUKAANSET VOICEOS — AAP BOLO, DUKAANSET KAAM SAMBHALE.**

**BEGIN ACTUAL IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY. DO NOT STOP AT PLANNING OR MOCKUPS.**
