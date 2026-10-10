# DUKAANSET V14 — ULTIMATE PREMIUM APPLICATION UX & GLOBAL VOICEOS REBUILD

## FINAL COMPLETE IMPLEMENTATION MASTER PROMPT
### Seven-Screenshot UI/UX Audit + Approved Dashboard Design + Universal Voice-Controlled Business Operations + Production-Grade Backend Execution + Comprehensive Testing

---

# PROJECT IDENTITY

**Product:** DukaanSet

**Official Tagline:** Apni Dukaan, Sab Set.

**Core Differentiator:** DukaanSet Global VoiceOS — Aap Bolo, DukaanSet Kaam Sambhale.

**Product Type:** Premium, Mobile-First, Multi-Tenant Business Management SaaS for Indian Shopkeepers.

**Target Merchants:** Kirana, grocery, clothing, hardware, vegetables, fruits, mobile accessories, general stores and other retail businesses.

**Reference Material:** Seven screenshots attached to this request, plus the previously approved DukaanSet Dashboard design.

## PRIMARY OBJECTIVES

Implement two closely connected transformations:

**OBJECTIVE A — COMPLETE PREMIUM APPLICATION UI/UX ENHANCEMENT**

Redesign every screenshot-identified screen and extend the approved premium design language across the authenticated application.

**OBJECTIVE B — COMPLETE GLOBAL VOICEOS ENGINE ENHANCEMENT**

Make VoiceOS a genuine application-wide business action system that understands natural voice and typed instructions, identifies the correct workflow, fills missing details through conversation, and executes actual authorised backend operations after confirmation.

VoiceOS must become one of the main ways to operate DukaanSet, not a secondary voice-input form.

## PRODUCT PHILOSOPHY

**Advanced Technology Behind the Scenes.**

**Radically Simple Experience for the Shopkeeper.**

**Speak → Understand → Prepare → Review → Confirm → Complete.**

---

# 1. YOUR ROLE

Act as a professional cross-functional product engineering team:

- Principal Full-Stack Architect
- Conversational AI Systems Architect
- Speech Recognition Engineer
- Natural Language Understanding Engineer
- Agentic Workflow Engineer
- Financial Systems Engineer
- Inventory Systems Engineer
- Database Architect
- Senior React/Next.js Engineer
- Senior Product Designer
- Creative Director
- Mobile UX Designer
- Design System Engineer
- Security Engineer
- Accessibility Engineer
- Performance Engineer
- QA Automation Engineer
- DevOps Engineer

You have permission to make reasonable product, architecture and design improvements necessary to fulfil these requirements.

Do not repeatedly ask for aesthetic approval.

Make decisions based on the established DukaanSet design system, merchant usability, financial accuracy and implementation quality.

However, do not guess missing business facts that affect money, stock, customer identity or legally important records.

For those cases, ask the merchant a short clarification inside the product.

---

# 2. NON-NEGOTIABLE IMPLEMENTATION CONTRACT

Work inside the EXISTING DukaanSet repository.

Do not:

- Create a second unrelated application.
- Build a disconnected VoiceOS database.
- Replace working domain services with fake implementations.
- Hardcode successful transactions.
- Fake an AI integration.
- Hardcode product matching results.
- Disable validation to make commands appear successful.
- Create mock billing records in production.
- Rewrite financial history incorrectly.
- Break existing authentication or business isolation.
- Stop after building a pretty frontend.

Inspect the actual routes, components, backend APIs, schemas, transaction services, authentication, permissions and existing test infrastructure first.

Reuse current functionality wherever correct.

Fix broken or incomplete behaviour.

Deliver working code, not just design concepts.

---

# 3. MANDATORY SEVEN-SCREENSHOT AUDIT

Review all seven supplied screenshots carefully before implementation.

Treat them as evidence of actual UI/UX problems and possible workflow defects.

The screenshots do not by themselves prove the exact backend root cause; investigate that through the real repository, runtime behaviour, network requests and logs.

## SCREENSHOT 1 — STOCK / PRODUCT DETAILS

### Observed Problems

The Aashirvaad Atta product section displays a generic placeholder image.

A technical message says:

"No confident licensed match. Your category illustration is ready."

The Recent Activity section contains plain, widely spaced transaction rows.

Quantity changes appear at the far right.

The page has weak information grouping.

A simple More Details accordion appears disconnected from the main product experience.

### Required Improvements

Create a premium Stock Detail experience.

The product summary must clearly show:

- Product image
- Product name
- Variant or unit
- Available quantity
- Selling price
- Stock status
- Primary stock action

Replace technical media-provider explanations with useful merchant-facing text.

Example:

"Product photo not added yet."

Provide Change Photo without treating the absence of a photo as a business error.

Convert recent activity into a compact, modern stock movement timeline.

Example:

**9 Oct — Sold 2 kg**

Invoice DS-00005

**6 Oct — Sold 2 kg**

Invoice DS-00003

**3 Oct — Added 125 kg**

Stock Received

Show movement type, signed quantity, event date and appropriate reference.

Make quantity changes visually understandable.

Use meaningful icons and restrained colour.

Do not expose technical IDs unnecessarily.

Keep advanced stock information accessible through expandable details.

## SCREENSHOT 2 — DEMANDPULSE

### Observed Problems

The page has excessive whitespace.

Summary cards feel generic.

The demand record appears isolated in a large container.

The interface shows explanatory system text that is too technical for ordinary merchants.

The requested product is not yet linked to an inventory catalogue item.

The interface does not make the next useful action sufficiently prominent.

### Required Improvements

Transform DemandPulse into a visually clear missed-demand management workflow.

Show:

- Requests Received
- Products Requested
- Back in Stock
- Confirmed Sales Recovered

Use concise premium metric cards.

Create visually meaningful demand cards.

Each card should show:

- Requested item
- Variant or package size
- Requested quantity
- Number of customer requests
- Availability
- Linked customer information, when available
- Next recommended action

If a product does not exist in the catalogue, provide a contextual action to link or prepare the product.

Do not make the merchant manually navigate through several unrelated pages.

Use a simple visual process:

**Customer Asked → Demand Recorded → Consider Restocking → Available Again → Follow Up → Confirmed Sale**

Do not count requested quantities as guaranteed sales.

Do not claim recovered revenue unless a confirmed linked invoice supports it.

Preserve the distinction between one customer request and the requested quantity.

For example, "1 packet of 500g tea" must not be confused with 500 packets.

## SCREENSHOT 3 — CUSTOMER DETAILS

### Observed Problems

The customer profile has reasonable high-level summary cards but an unpolished activity section.

The activity feed exposes UUID-like technical transaction identifiers.

The rows are visually repetitive and have excessive empty spacing.

The type of transaction is not always immediately clear.

The current balance label could communicate customer receivables more clearly.

### Required Improvements

Redesign Customer 360° with:

- Compact customer header
- Contact information
- Current outstanding amount
- Total purchases
- Net payments received
- Clear primary actions
- Readable transaction timeline
- Invoice references
- Payment status
- Expandable advanced details

Never use a raw database UUID as the main visible transaction title when a proper human-readable invoice or payment reference is available.

If a record has no human-friendly reference, generate a safe display label without rewriting historical primary keys.

Example:

**Bill DS-00005**

8 October 2026

Tata Salt × 1

₹28

Paid / Partially Paid / Unpaid, based on actual data

Another example:

**Payment Received**

₹125 · Cash

4 October 2026

Make purchases and payments visually distinct.

Do not delete legitimate repeated transactions merely because they appear similar.

Maintain the actual customer ledger.

A summary such as ₹278 shopping, ₹153 received and ₹125 outstanding must reconcile according to the authoritative ledger and applicable adjustments.

## SCREENSHOT 4 — DUKAANSET AI / BUSINESS SUMMARY

### Observed Problems

The page is sparse and visually unbalanced.

The current feature is described as rules-based and read-only.

The screen indicates that no live AI provider is connected.

Preset questions and the Ask Your Records section feel disconnected.

The page has significant unused space.

### Required Improvements

Redesign into a premium Business Assistant experience.

Use a balanced layout with:

- Assistant header
- Real business context
- Suggested questions
- Conversation history
- Structured answer cards
- Useful contextual actions
- Related insights
- Optional VoiceOS interaction

Unify the conversational experience with the Global VoiceOS command architecture.

Do not maintain two contradictory systems that interpret merchant commands differently.

Support existing rules-based financial questions accurately even when no generative AI provider is connected.

When a real AI service is configured, it may help interpret more flexible requests but must still use authorised structured business tools.

Do not pretend a rules-based query engine is a live generative AI model.

Do not fabricate analysis or numeric answers.

## SCREENSHOT 5 — SETTINGS

### Observed Problems

The Settings page contains many horizontally arranged category buttons.

The selected account form occupies one isolated section.

The screen has large unused areas.

Build Details appears in an expandable control that feels like developer information.

The page lacks strong visual grouping between account settings and shop operations.

### Required Improvements

Create a premium Settings information architecture.

Use grouped categories such as:

**Your Account**

- Name
- Email
- Password and Security
- Language

**Your Shop**

- Shop Details
- Business Type
- Team and Permissions
- Shop Timing

**Business Features**

- Invoice Branding
- WhatsApp Sharing
- VoiceOS
- Automatic Product Images
- Shop Closing
- Feature Preferences

**Advanced**

- Technical information
- Integrations
- Build diagnostics, only where appropriate

Use responsive navigation instead of one overlong row of tabs.

Do not expose developer-only diagnostic information prominently to ordinary merchants.

Keep demo-workspace information clearly labelled but visually unobtrusive.

Preserve real account updates and backend validation.

## SCREENSHOT 6 — VOICE BILLING IDLE STATE

### Observed Problems

The interface resembles a long form.

The microphone does not have enough visual priority.

There is a prominent spoken-language dropdown.

There is an empty textarea.

Repeated instructional text consumes vertical space.

Several controls compete for attention before the user has spoken anything.

### Required Improvements

Use a minimal microphone-first design.

Default state should show:

- VoiceOS branding
- Active business context
- One prominent microphone
- "What would you like to do?"
- A few contextual examples
- Optional text command input

Hide advanced voice settings until needed.

Show recognised transcript and action draft only after an instruction is received.

Avoid nested scrolling and unnecessarily large form sections.

## SCREENSHOT 7 — VOICE BILLING COMMAND REVIEW

### Observed Problems

The screenshot contains a voice transcript similar to:

"10 kilo Aashirwad Aata 2 kilo basmati rice aur 10 kilo daal add kar do kar do cash"

The system displays a generic workflow mismatch message.

It also asks for products and quantities even though the transcript already contains recognizable product and quantity phrases.

It separately requests payment details without first resolving whether the merchant intended a stock operation or a sale.

The transcript state claims that it has already been applied, although no completed business action is apparent.

### CRITICAL REQUIREMENT

This flow must be investigated and corrected at the intent router, transcript processing, state-management and backend execution levels.

Do not merely remove the warning message.

Fix the reason the user's instruction cannot reach the correct business action.

---

# 4. KEEP THE APPROVED DASHBOARD DESIGN

The previously approved premium DukaanSet Dashboard is the visual design reference for the authenticated product.

Preserve its:

- Deep teal sidebar
- Mint highlights
- Global topbar
- Search
- Global VoiceOS microphone
- Refined typography
- Illustrated greeting
- Premium metric cards
- Subtle shadows
- Rounded surfaces
- Attractive status indicators
- Compact task panels
- Responsive grid

Do not randomly redesign the approved Dashboard.

Instead, extend its design system to all the screenshot-identified screens.

If its reference image is available in the repository or attached with the task, compare against it directly.

Every authenticated screen should feel like it belongs to the same premium SaaS product.

---

# 5. COMPLETE DESIGN SYSTEM REFINEMENT

Use the established DukaanSet colours:

Deep Teal: `#103B36`

Forest Teal: `#062F29`

Mint: `#22C99D`

Off-White: `#F7FAF8`

Charcoal: `#1A2624`

Amber: `#F5B942`

Use consistent supporting colours for semantic states.

### Typography

Use the existing compatible typography system.

Suggested choices:

- Manrope or Plus Jakarta Sans for headings
- Inter for interface text
- Noto Sans Devanagari for Hindi

### Components

Create or refine reusable:

- AppShell
- CompactPageHeader
- EntitySummary
- FinancialMetricCard
- ActivityTimeline
- StatusBadge
- SmartActionBar
- ProductImage
- EmptyState
- LoadingSkeleton
- ErrorState
- CollapsibleDetails
- BottomSheet
- FormField
- GlobalVoiceOSLauncher
- VoiceConversationPanel
- VoiceDraftPreview
- VoiceConfirmationBar

Avoid oversized cards and unnecessarily large empty areas.

Use page-specific compositions while preserving one visual identity.

---

# 6. PREMIUM DETAIL PAGE PRINCIPLE

Apply this rule to every detail page:

**Important Information First. Advanced Information on Demand.**

Default structure:

1. Compact page header
2. Main entity identity
3. Current state
4. Important summary
5. Contextual actions
6. Recent activity
7. Expandable advanced details

Avoid exposing technical database metadata in the primary visual hierarchy.

Use consistent spacing and readable values.

Do not make important actions difficult to find.

---

# 7. STOCK DETAILS — FINAL PREMIUM DESIGN

The redesigned Stock Detail page should contain:

### Product Header

- Product image
- Product name
- Unit/variant
- Stock status
- Change Image action

### Main Inventory Summary

- Available Stock
- Selling Price
- Purchase Cost, when authorised
- Low Stock Threshold

### Actions

- Add Stock
- New Sale
- VoiceOS
- More Options

### Stock Timeline

Show meaningful movement types:

- Received
- Sold
- Returned
- Adjusted
- Damaged/Wasted, where supported

Each entry must show:

- Quantity
- Unit
- Event date and time
- Reason
- Related invoice or receipt where available

### Image Handling

Preserve automatic licensed image discovery.

Do not show technical licensing failure messages as prominent product information.

Use a polished placeholder when no suitable authorised image exists.

Provide Change Image.

Image lookup failures must not affect stock calculations.

---

# 8. DEMANDPULSE — FINAL PREMIUM DESIGN

Build a compact, visually meaningful demand-management experience.

### Top Summary

Show four helpful metrics.

### Main Demand Section

Use premium product-request cards.

### Product Context

Where the product is absent from inventory, allow authorised inline catalogue linking or creation preparation.

### Actions

- Review Demand
- Consider Restock
- Mark Stock Available
- View Related Customers
- Prepare Follow-Up

Only show actions valid for the current state.

### Recovered Sales

Count recovered sales only after a legitimate linked sale has been committed.

### VoiceOS Examples

"Teen customers ko blue shirt XL chahiye thi."

"Do customers ko 500 gram wali chai chahiye, stock nahi hai."

"Is missing demand ko record karo."

VoiceOS must preserve actual request counts and quantities.

Do not fabricate stock availability.

---

# 9. CUSTOMER 360° — FINAL PREMIUM DESIGN

Create a cleaner, more understandable Customer Details page.

### Header

Customer name

Contact details

Outstanding status

### Financial Summary

- Total Shopping
- Net Payments Received
- Current Money to Collect

### Main Actions

- New Sale
- Add Payment
- Generate PDF

### Tabs

- Activity
- Bills
- Hisaab

### Recent Activity

Use human-readable references and concise transaction cards.

Distinguish:

- Purchases
- Payments
- Returns
- Refunds
- Adjustments

### VoiceOS Integration

Examples:

"Neha ke kitne paise baaki hain?"

"Neha ka 100 rupaye payment add karo."

"Neha ka last bill kholo."

"Neha ka monthly hisaab PDF banao."

Use the actual selected customer when the user says "is customer" and the page context is unambiguous.

Do not silently use the wrong customer.

---

# 10. DUKAANSET AI — UNIFIED BUSINESS ASSISTANT

Redesign the DukaanSet AI page as the extended conversational workspace for the same core assistant used by Global VoiceOS.

### Architecture Decision

There must be one shared business command interpretation and execution layer.

VoiceOS and text-based DukaanSet AI are different input experiences built on the same authorised action platform.

Do not create two independent systems with conflicting interpretations.

### Visual Layout

Header:

**DukaanSet Assistant**

Supporting message:

"Ask about your business or tell DukaanSet what to do."

Include:

- Conversation panel
- Suggested questions
- Contextual business cards
- Text composer
- Microphone button
- Structured business answers
- Relevant action previews

### Examples

"Aaj ki sale kitni hui?"

"Kaunse products low stock hain?"

"Neha ke kitne paise pending hain?"

"Kal kitne bills bane?"

"10 kilo aloo stock mein add karo."

### Provider Transparency

If no generative AI provider is configured, use supported deterministic commands and clearly communicate their scope.

If an AI provider is configured, use it for language understanding and explanation, not unrestricted database access.

Do not invent financial answers.

---

# 11. SETTINGS — FINAL UX RESTRUCTURE

Use a simple navigation model.

Recommended sections:

- Account
- Shop Details
- Team
- Language
- VoiceOS
- Product Images
- Invoice Branding
- WhatsApp
- Shop Closing
- Security
- Advanced

### VoiceOS Settings

Include genuinely supported controls:

- Preferred Speech Language
- Microphone Behaviour
- Transcription Provider Status
- Privacy Information
- Audio Permission Help
- Typed Command Fallback

Do not show technical provider configuration to ordinary merchants.

### Product Image Settings

Include:

- Automatic Images
- Manual Image Override
- Image Suggestions
- Provider Availability
- Suitable Placeholders

### UI

Use balanced settings panels, clear category labels and responsive navigation.

Keep Dev/Build Details behind an appropriate advanced or administrator-only section.

Do not break account-saving functionality.

---

# 12. VOICEOS IS THE CORE PRODUCT CAPABILITY

The most important product requirement:

**Every relevant business workflow supported manually in DukaanSet should have an equivalent authorised VoiceOS workflow.**

VoiceOS must not be limited to:

- One particular page
- Stock only
- Billing only
- Customer creation only
- A fixed set of demo phrases

VoiceOS must behave as a universal business command system.

### Examples

"Customer add karo."

"Bill bana do."

"Stock add karo."

"Payment record karo."

"Purchase receive karo."

"Expense add karo."

"Customer ka hisaab dikhao."

"Demand record karo."

"Invoice PDF banao."

"WhatsApp sharing prepare karo."

"Aaj ki dukaan close karo."

### Important Limitation

Not every imaginable spoken instruction should automatically be executable.

Implement explicit, validated capability coverage for real application workflows.

When an action is unsupported, explain that specifically rather than pretending it was completed.

---

# 13. AUTOMATIC WORKFLOW DETECTION

Remove mandatory workflow or module selection from Global VoiceOS.

### Example

The user is on the Bills page.

They say:

"10 kilo aloo stock mein add kar do."

VoiceOS must identify an inventory operation.

It should not respond:

"This command belongs to another workflow."

Instead:

Recognise STOCK_ADD.

Prepare the stock draft.

Allow confirmation.

Execute the stock service.

### Context Hierarchy

When interpreting a command, consider:

1. Explicit user instruction
2. Active business
3. Current selected entity
4. Current page
5. Conversation state
6. Supported operations and permissions

Explicit intent must override irrelevant page context.

---

# 14. SCREENSHOT-SPECIFIC VOICE COMMAND FIX

Investigate the exact failure shown in screenshot seven.

Transcript:

"10 kilo Aashirwad Aata 2 kilo basmati rice aur 10 kilo daal add kar do kar do cash"

### Required Parsing

Recognise likely product phrases:

- Aashirvaad Atta — 10 kg
- Basmati Rice — 2 kg
- Daal — 10 kg

Treat repeated command endings such as "kar do kar do" as speech/transcription repetition when appropriate.

Do not create duplicate action requests.

### Intent Ambiguity

The phrase "add kar do" may imply stock addition.

The word "cash" may imply a sale or a purchase-payment context.

If the full utterance does not sufficiently establish the business operation, show one short clarification:

**"Ye 3 products stock mein add karne hain ya cash sale ka bill banana hai?"**

### If User Selects Stock

- Resolve existing products.
- Prepare new products when genuinely missing.
- Validate quantities and units.
- Clarify the variety of "daal" only when required to identify the correct product.
- Preserve existing prices.
- Handle optional purchase cost correctly.
- Show one editable stock draft.
- Offer Save All Stock.

### If User Selects Sale

- Resolve the customer or valid walk-in sale context.
- Match existing sellable inventory.
- Resolve product varieties and quantities.
- Determine prices from the catalogue or explicit command.
- Resolve Cash as the selected payment method only when the context supports it.
- Verify stock availability.
- Present a complete sale draft.
- Offer Confirm & Save Sale.

### Expected Behaviour

The user must not need to:

- Close VoiceOS.
- Navigate manually to Stock.
- Repeat the entire instruction.
- Select a workflow dropdown.
- Re-enter product quantities already understood.

Keep the original transcript and resolved entities available in the active draft.

---

# 15. NEW INTENT ROUTING ARCHITECTURE

Build a centralized Global VoiceOS Intent Router.

Examples of supported intents:

- CREATE_CUSTOMER
- FIND_CUSTOMER
- UPDATE_CUSTOMER
- CREATE_SALE
- FIND_SALE
- VIEW_INVOICE
- RECORD_CUSTOMER_PAYMENT
- CHECK_CUSTOMER_BALANCE
- ADD_STOCK
- CREATE_PRODUCT
- UPDATE_PRODUCT
- CHECK_STOCK
- RECORD_STOCK_ADJUSTMENT
- PREPARE_PURCHASE
- RECEIVE_PURCHASE
- RECORD_SUPPLIER_PAYMENT
- CREATE_EXPENSE
- RECORD_MISSED_DEMAND
- VIEW_DEMAND
- GENERATE_INVOICE_PDF
- GENERATE_CUSTOMER_STATEMENT
- GENERATE_PAYMENT_RECEIPT
- PREPARE_WHATSAPP_DELIVERY
- GET_BUSINESS_SUMMARY
- GET_SALES_REPORT
- GET_STOCK_REPORT
- PREPARE_DAILY_CLOSING
- VIEW_CLOSING_HISTORY
- OPEN_PAGE

Add other supported business actions discovered in the repository.

### IMPORTANT

These must be registered actions with known input schemas, validation and permissions.

Do not allow an LLM to invent arbitrary backend API calls.

---

# 16. MANUAL-TO-VOICE WORKFLOW PARITY

Perform a complete audit of the authenticated application.

Identify every meaningful manual workflow.

Create an internal capability matrix with:

- Module
- Manual operation
- Existing backend service
- Voice intent
- Required fields
- Entity resolution rules
- Permission requirements
- Confirmation requirement
- Supported languages
- Test coverage
- Actual implementation status

### Modules to Cover

- Dashboard
- New Sale
- Bills
- Customers
- Stock
- Purchases
- Suppliers
- Payments
- Udhaar
- Expenses
- DemandPulse
- Reports
- Smart Invoice Studio
- WhatsApp Document Sharing
- Smart Shop Closing
- Appropriate Business Tools
- Safe Settings operations

### Critical Rule

Do not claim full VoiceOS coverage until the capability matrix is complete and representative workflows are tested.

For sensitive account/security settings, require stronger authentication or keep them manual when voice execution is inappropriate.

---

# 17. VOICE COMMAND PROCESSING PIPELINE

Implement a production-oriented pipeline:

**Microphone / Typed Input**

↓

**Speech-to-Text, when applicable**

↓

**Transcript Normalization**

↓

**Language and Intent Interpretation**

↓

**Structured Entity Extraction**

↓

**Active Business Context**

↓

**Real Customer/Product Lookup**

↓

**Workflow Selection**

↓

**Missing Field Detection**

↓

**Clarification, if necessary**

↓

**Editable Action Draft**

↓

**Business Rule Validation**

↓

**Explicit Confirmation**

↓

**Authorised Domain Service**

↓

**Database Commit**

↓

**Affected UI Refresh**

↓

**Accurate Result**

### Important

Never treat text transcription alone as completed business execution.

Never treat an extracted JSON draft as a saved transaction.

Track each stage explicitly.

---

# 18. SPEECH RECOGNITION ENGINE ENHANCEMENT

Inspect the current speech-recognition implementation.

Determine:

- Actual transcription provider
- Browser dependencies
- Supported locales
- Microphone permission handling
- Interim transcript behaviour
- Final transcript behaviour
- Timeouts
- Network failures
- Audio privacy handling
- Current parsing architecture

### Required Capabilities

Support:

- English
- Hindi
- Hinglish
- Common mixed Hindi-English retail instructions
- Natural quantities
- Numbers
- Product names
- Customer names
- Corrections

### Recommended Architecture

Use a pluggable SpeechTranscriptionAdapter.

Support the currently configured browser transcription solution and, where configured, a suitable production speech provider.

Use provider capabilities accurately.

Mixed-language recognition quality must be tested with real recorded or spoken commands.

Do not promise perfect code-switching accuracy.

### Important Speech States

- Idle
- Permission Required
- Listening
- Transcribing
- Understanding
- Need Clarification
- Draft Ready
- Saving
- Success
- Failed

### Reliability

Handle repeated speech fragments without duplicate actions.

Do not parse every interim transcript as a new committed command.

---

# 19. THREE-LANGUAGE VOICE EXPERIENCE

Support:

## ENGLISH

"Add ten kilograms of onions to stock."

"Create a bill for Chetna."

"Show today's sales."

## HINDI

"दस किलो प्याज़ स्टॉक में जोड़ दो।"

"चेतना के नाम से बिल बना दो।"

"आज की कुल बिक्री बताओ।"

## HINGLISH

"10 kilo pyaz stock mein add kar do."

"Chetna ka bill bana do."

"Aaj ki total sale batao."

### Language Handling

Display language and spoken language must remain independent.

A merchant may use the English interface but speak Hindi.

The assistant must respond according to the selected display language unless an explicit supported output-language instruction overrides it.

Use the existing central localization system.

Do not mix untranslated interface strings.

Preserve original customer and product names.

---

# 20. NATURAL HINDI AND HINGLISH UNDERSTANDING

Recognise common retail vocabulary.

### Products

Aloo / Aalu / आलू / Potato

Pyaz / Pyaaz / प्याज़ / Onion

Atta / आटा / Flour

Chawal / चावल / Rice

### Payments

Cash

UPI

Udhaar

Baaki

Advance

### Actions

Add karo

Jodo

Bana do

Bech diya

Payment mila

Stock aaya

Bill kholo

Hisaab dikhao

### Numbers

Support:

- 2
- Do
- दो
- 10
- Das
- दस
- Sau
- सौ
- Hazaar
- हज़ार

### Safety

Use controlled aliases and language normalization.

Do not map different products to the same SKU just because their names sound similar.

Use the real business catalogue to verify exact identities.

---

# 21. ENTITY RESOLUTION

VoiceOS must identify real business entities.

### Customers

Match:

- Exact names
- Approved aliases
- Phone numbers when supplied
- Relevant current page context

### Products

Match:

- Name
- Approved aliases
- Brand
- Variant
- SKU
- Unit
- Package size

### Suppliers

Match:

- Supplier name
- Approved aliases
- Relevant purchase references

### Documents

Match:

- Invoice number
- Customer
- Date
- Existing transaction reference

### Ambiguity Handling

When multiple matches are credible, show a short selection.

Example:

"Do Chetna customers mil rahe hain. Kaunsi Chetna?"

Do not silently use an uncertain customer for a financial transaction.

---

# 22. AUTOMATIC PRODUCT CREATION THROUGH VOICE

When the user clearly wants to ADD STOCK:

If the product exists, add to its inventory through the correct service.

If it does not exist, prepare its creation as part of the same batch.

### Example

"10 kilo pyaz aur 20 kilo daal stock mein add karo."

Expected:

Pyaz — New or Existing

Daal — Resolve exact product type when needed

Quantities and units extracted

One consolidated draft

One Save All Stock confirmation

### Important Distinction

Stock addition may support automatic creation of a missing catalogue item.

A sales command must not silently create and sell an unknown product without the application's required inventory, pricing and sale validations.

Do not conflate stock receiving, purchase orders and sales.

---

# 23. SMART PRICE INTERPRETATION

Distinguish:

- Selling Price
- Purchase Cost
- Unit Rate
- Total Batch Cost
- Invoice Total
- Amount Received
- Outstanding Credit

### Example

"20 kilo daal 1000 rupaye mein kharidi."

If clearly a total purchase cost:

₹1,000 / 20 kg = ₹50 per kg.

Do not automatically set the selling price to ₹50.

### Example

"5 kilo aloo 200 rupaye mein beche."

Interpret ₹200 as the total sale amount when context supports that meaning.

Implied rate: ₹40/kg.

Validate against existing pricing rules.

### If Ambiguous

Ask:

"₹1000 poore stock ka cost hai ya ek unit ka rate?"

Ask only when necessary.

Do not fabricate missing prices.

---

# 24. CONVERSATIONAL MISSING-FIELD HANDLING

The assistant must ask targeted follow-up questions.

### Bad Behaviour

"Your command belongs to another workflow."

"Say products and quantities."

"Complete all highlighted fields."

### Required Behaviour

Identify what is already known.

Ask only for genuinely missing details.

### Example

User:

"Chetna ka ₹200 bill bana do."

Assistant:

"Kaunsa samaan liya tha?"

User:

"5 kilo aloo."

Assistant:

"₹200 cash mila, UPI se mila ya udhaar hai?"

User:

"Cash."

Assistant:

Displays the validated sale draft.

### Important

Do not repeatedly request customer, quantity or amount once they are already supplied and resolved.

---

# 25. MULTI-TURN DRAFT MEMORY

Keep a temporary structured draft.

Store:

- Intent
- Resolved business
- Selected customer
- Product entries
- Units
- Quantities
- Prices
- Payment details
- Missing fields
- Clarification answers
- Current draft version
- Validation state

### Example Correction

"10 kilo nahi, 12 kilo pyaz karo."

Update the existing item.

Do not add a second product row.

### Customer Correction

"Chetna nahi, Neha ke naam se."

Update the intended customer reference and revalidate.

### Payment Correction

"Cash nahi, UPI hai."

Update the draft payment method.

Do not create any transaction until final confirmation.

---

# 26. ONE CONFIRMATION — NO UNNECESSARY FORMS

Do not make the merchant confirm every field separately.

Prepare the complete draft.

Then show one clear action.

### For Sales

**Confirm & Save Sale**

### For Stock

**Save All Stock**

### For Customer

**Save Customer**

### For Payment

**Confirm Payment**

### For Purchases

**Confirm Purchase / Receive Stock**, depending on the action

### For Daily Closing

**Confirm Close**

### Important

If the command is read-only, do not show a Save button.

If essential information is missing, keep the draft editable and explain what remains.

---

# 27. PREMIUM VOICEOS USER INTERFACE

Completely redesign the screenshot's Voice Billing component.

### Default Layout

Compact branded header.

Large microphone.

Short instruction.

Suggested examples.

Optional text entry.

### After User Speaks

Show:

**You Said**

A concise transcript.

**DukaanSet Understood**

The relevant business action.

**Details**

Structured editable draft.

**Need One More Detail?**

Targeted clarification when required.

**Primary Action**

Confirm & Save, only when valid.

### Visual Requirements

- Modern premium typography
- Deep teal and mint accents
- Compact cards
- Minimal instructional clutter
- Clear action hierarchy
- Microphone listening animation
- Sticky confirmation bar when useful
- No giant empty textarea as the default focus
- No awkward nested scrollbars
- No redundant workflow dropdowns
- Responsive desktop/mobile layouts

Do not let VoiceOS become a technical administration form.

---

# 28. GLOBAL VOICEOS + INLINE VOICEOS

The app may have a global assistant and contextual voice controls.

Both must reuse the same backend interpretation and execution system.

### Global Assistant

Available from the topbar across the application.

It supports cross-module commands.

### Contextual Voice Entry

A New Sale or Stock page may show a contextual microphone.

It can prefill the page's workflow.

### Critical Rule

If the user clearly requests a different module, the assistant must be able to route to that authorised workflow rather than rejecting it.

Do not build incompatible command parsers for global and contextual VoiceOS.

---

# 29. BUSINESS ACTION SERVICE REGISTRY

Create an explicit VoiceActionRegistry.

Each action definition must contain:

- Intent
- Input schema
- Required fields
- Supported entities
- Entity resolvers
- Business rules
- Permission requirements
- Draft builder
- Confirmation policy
- Backend service mapping
- Idempotency behaviour
- Error handling
- Audit rules

### Example

CREATE_SALE maps to the existing sale service.

ADD_STOCK maps to the correct inventory batch service.

RECORD_PAYMENT maps to the existing ledger/payment service.

RECORD_MISSED_DEMAND maps to DemandPulse.

PREPARE_DAILY_CLOSING maps to the closing preview service.

Never allow unrestricted LLM-generated SQL or arbitrary backend function execution.

---

# 30. VOICEOS MUST PERFORM REAL BACKEND ACTIONS

A command is not complete merely because it was recognised.

### For a Confirmed Sale

The system must correctly:

1. Resolve the customer.
2. Resolve products and variants.
3. Validate stock.
4. Validate prices and totals.
5. Validate payments.
6. Create the invoice.
7. Create correct line items.
8. Deduct inventory.
9. Record customer purchase history.
10. Record payment allocations.
11. Record outstanding balance.
12. Update affected dashboard/report data.
13. Record an audit event.
14. Return actual success.

Use the existing authorised sale domain service.

### For Stock Entry

- Match or prepare new products.
- Validate units.
- Apply correct stock movements.
- Handle prices separately.
- Prevent duplicates.
- Commit through the inventory service.

### For Customer Payments

- Resolve customer.
- Validate amount.
- Record the correct payment.
- Update the customer ledger.
- Avoid creating another sale.

### For Purchases

- Distinguish purchase creation from goods receipt.
- Update inventory only through valid receiving operations.
- Keep supplier payment records separate.

---

# 31. FINANCIAL AND INVENTORY INTEGRITY

Maintain all core invariants.

### Sales

One confirmed sale must create one logical sale transaction.

### Stock

Stock quantity must be updated correctly for the exact SKU and unit.

### Payments

Do not double-count split payments.

### Udhaar

Existing customer credit payments must not create new sales.

### Purchases

A purchase order must not automatically imply goods received.

### Returns

Refunds and returns must follow the existing authorised correction workflow.

### Daily Closing

Voice commands must not bypass finalisation permissions or cash verification.

### Idempotency

Repeated submissions, retries or duplicated speech transcripts must not duplicate business transactions.

Use backend-generated or validated stable idempotency keys.

---

# 32. CLASSIFY READ, WRITE AND HIGH-RISK COMMANDS

## READ-ONLY

Examples:

"Aaj ki sale batao."

"Neha ke kitne paise pending hain?"

"Kitna aloo stock mein hai?"

Return actual authorised data.

No Save confirmation.

## NAVIGATION

Examples:

"Customers kholo."

"Bills dikhao."

Open the authorised destination.

## NORMAL WRITE

Examples:

"Customer add karo."

"Stock add karo."

"Bill banao."

Prepare draft and require confirmation.

## HIGH-RISK WRITE

Examples:

"Refund karo."

"Purane financial record ko correct karo."

"Aaj ka shop close karo."

"User ki permission badlo."

Apply stronger policy-specific checks.

Do not automatically perform destructive or sensitive actions on transcription alone.

---

# 33. ERROR HANDLING — NO GENERIC DEAD ENDS

The user wants VoiceOS to be useful rather than repeatedly displaying errors.

Implement:

**Clarification First. Actionable Error When Necessary.**

### If Product Is Missing During Stock Addition

Prepare a new product.

Do not display a blocking catalogue-match error when automatic creation is appropriate.

### If Product Identity Is Ambiguous

Ask which product is intended.

### If Payment Method Is Missing

Ask Cash, UPI, Credit or supported Split.

### If Stock Is Insufficient for a Sale

Show the actual available stock and a relevant resolution.

### If User Lacks Permission

Explain that the action requires an authorised user.

### If Backend Is Unavailable

Show a genuine retryable error and preserve the draft.

### If Speech Recognition Fails

Offer retry or typed input.

### Important

Do not hide genuine errors or invent success to make the assistant appear intelligent.

Errors should be specific, understandable and recoverable.

---

# 34. VOICEOS STATE MANAGEMENT

Fix the screenshot's confusing:

"This transcript was already applied."

Design a clear state machine.

Suggested states:

- IDLE
- LISTENING
- TRANSCRIBING
- INTERPRETING
- CLARIFYING
- DRAFT_READY
- VALIDATING
- AWAITING_CONFIRMATION
- EXECUTING
- SUCCEEDED
- FAILED
- CANCELLED

### Important Distinction

Transcript processed is not the same as:

- Draft prepared
- User confirmed
- Backend saved

Display accurate language for each.

### Duplicate Protection

Reprocessing the same transcript must not accidentally execute a second operation.

Editing the transcript must properly invalidate outdated draft interpretations.

A later correction must create a revised draft, not become permanently blocked by an "already applied" state.

---

# 35. SMART RECOGNITION OF REPEATED WORDS

Speech recognition may produce duplicate fragments.

Examples:

"Add kar do kar do."

"10 kilo kilo aloo."

"Payment payment record karo."

Handle likely repetition safely.

Do not simply delete every repeated word mechanically.

Use context and structured validation.

For example, "do do kilo" may legitimately mean two kilograms of each item in colloquial speech.

Preserve meaningful quantities and ask when ambiguous.

---

# 36. REAL VOICE BILLING WORKFLOW

Implement a complete working billing flow.

### Example

"Chetna ko 5 kilo aloo ₹200 mein beche, ₹100 cash aur ₹100 udhaar."

Expected structured draft:

Customer: Chetna

Product: Aloo

Quantity: 5 kg

Invoice Total: ₹200

Cash Received: ₹100

Udhaar: ₹100

### Save Behaviour

After confirmation:

- Create one invoice.
- Deduct 5 kg from the correct product.
- Record ₹100 cash collection.
- Record ₹100 customer credit.
- Update the customer ledger.
- Update Dashboard and Reports.
- Show the real saved invoice number.

### Additional Requirements

Support:

- Existing customer
- New customer creation when required and authorised
- Walk-in customer if the existing billing rules support it
- Multiple products
- Different quantities
- Mixed units
- Price overrides with permissions
- Discounts
- Partial payments
- Split payments
- Credit sales
- Returns and corrections through their appropriate workflows

Do not assume Cash when payment is unspecified.

---

# 37. REAL VOICE STOCK WORKFLOW

Example:

"10 kilo pyaz, 2 kilo aloo aur 20 kilo daal stock mein add karo."

Expected draft:

Pyaz — 10 kg

Aloo — 2 kg

Daal — 20 kg

Each entry must indicate whether it uses an existing product or prepares a new product.

### Important

A generic "Daal" entry may require variety clarification if the business has distinct dal products.

Do not randomly choose Moong Dal or Chana Dal.

### Final Action

**Save All Stock**

After confirmation:

- Create missing products where authorised.
- Increment existing product inventory.
- Save inventory movements.
- Trigger image enrichment for newly created products.
- Refresh Stock and Dashboard.

No separate manual product-creation screens for confidently identified missing products.

---

# 38. VOICEOS FOR EVERY CORE BUSINESS MODULE

Implement representative full workflows for:

### Customers

Create, find, review and update permitted customer information.

### Billing

Prepare and save multi-item sales.

### Stock

Add stock, create missing products and review quantities.

### Purchases

Prepare purchases and receive goods.

### Suppliers

Find suppliers, review payables and record authorised payments.

### Expenses

Record expenses with amount, category, payment method and relevant date.

### Payments

Record customer and supplier payments correctly.

### Udhaar

Show outstanding money and record collections.

### DemandPulse

Capture unavailable products, quantities and customer requests.

### Invoices

Open existing invoices and generate authorised PDFs.

### WhatsApp

Prepare and confirm supported document sharing.

### Reports

Answer actual business-data queries.

### Daily Closing

Prepare a closing summary and finalise only with appropriate confirmation.

### Settings

Support appropriate low-risk changes, while maintaining secure manual or reauthenticated controls for sensitive operations.

---

# 39. SMART INVOICE & WHATSAPP INTEGRATION

Examples:

"Chetna ka last bill PDF kholo."

"Neha ka monthly hisaab banao."

"Rahul ka payment receipt generate karo."

"Chetna ko invoice WhatsApp ke liye prepare karo."

### Requirements

Use actual existing documents and transaction records.

Do not regenerate a new sale when opening an old invoice.

Do not fabricate PDF contents.

Do not send private documents without appropriate authorisation.

Manual WhatsApp sharing and official direct PDF delivery are distinct.

Use actual delivery status events for connected integrations.

---

# 40. VOICEOS & SMART SHOP CLOSING

Example:

"Aaj ki dukaan close kar do."

Expected:

1. Identify active business session.
2. Fetch actual daily financial data.
3. Show Sales, Cash, UPI, Udhaar and Expenses.
4. Present cash reconciliation status.
5. Show outstanding review items.
6. Require explicit final confirmation.
7. Execute authorised closing.
8. Save actual timestamp and closing snapshot.
9. Show the genuine result.

Do not automatically close the day from an unconfirmed voice transcript.

---

# 41. BUSINESS CONTEXT AND PERSONALISATION

Use actual shop context.

### Grocery

Handle kilograms, packets, litres and fast billing.

### Clothing

Handle size, colour and variant inventory.

### Hardware

Handle pieces, boxes, metres and supplier workflows.

### Vegetables

Handle weight, pricing and wastage.

### Mobile Accessories

Handle branded items, models and variants.

### Important

Use one shared action architecture.

Adapt product resolution and draft fields to the business category.

Do not create inconsistent VoiceOS implementations for each shop type.

---

# 42. VOICEOS PRIVACY AND SECURITY

Voice commands may involve private business records.

Implement:

- Authenticated access
- Tenant-scoped lookups
- Role-based permissions
- Schema validation
- Backend authorisation
- Protected AI credentials
- Speech provider transparency
- Minimal transcript retention
- Safe audio handling
- Audit trails
- Idempotency
- Rate limiting
- Secure error handling

Treat transcripts and model outputs as untrusted until validated.

Do not send entire customer databases to external language models.

Only provide the minimum necessary authorised context.

Do not allow malicious instructions embedded in customer names, product names or notes to override execution rules.

Never retain raw microphone audio without an appropriate, disclosed reason and permission.

---

# 43. PRODUCT IMAGES AND MEDIA ENHANCEMENT

Retain the existing automatic product-image requirement.

### Examples

Pyaz → Suitable onion photo

Aloo → Suitable potato photo

Maggi → Appropriate permitted product image

Coca-Cola → Appropriate bottle variant

Aashirvaad Atta → Accurate branded image when an authorised source exists

### Requirements

- Asynchronous image enrichment
- Accurate product identity matching
- Correct variants
- Appropriate usage rights
- Merchant-upload priority
- High-quality fallbacks
- Cached product images
- One shared ProductImage component

Do not block product creation because an image source is unavailable.

Do not show developer-style licensing diagnostics as prominent merchant-facing content.

---

# 44. COMPLETE MOBILE EXPERIENCE

Optimise for actual Android devices.

### Main Requirements

- Clear global microphone
- Quick voice access
- Compact VoiceOS sheet
- Readable transcripts
- Editable drafts
- Visible confirmation button
- Correct keyboard behaviour
- Accessible microphone states
- No horizontal scrolling
- No overlapping controls
- No excessive modal nesting

### Test Widths

320px

360px

375px

390px

412px

430px

768px

1024px

1440px

1920px

The desktop experience should remain premium.

The mobile experience must not be a shrunken version of the desktop interface.

---

# 45. PERFORMANCE AND RELIABILITY

VoiceOS should feel responsive.

Optimise:

- Assistant launch
- Transcription feedback
- Intent routing
- Product matching
- Customer lookup
- Draft rendering
- Backend validation
- Save operations
- UI refresh

Use scoped queries.

Do not send entire shop databases in AI prompts.

Do not refresh every page unnecessarily.

Use appropriate server-side caching, queueing and timeouts.

Show meaningful progress rather than indefinite spinners.

Handle unstable network connections.

If an operation's result is uncertain after a timeout, reconcile its idempotency key and backend state before submitting again.

---

# 46. MANDATORY REAL-WORLD VOICE TEST MATRIX

Build a comprehensive VoiceOS test matrix across:

- Three languages
- Voice and typed input
- Different modules
- Different business types
- Complete commands
- Incomplete commands
- Ambiguous commands
- Repeated speech
- Corrections
- Offline/network failures
- Different permissions
- Existing and missing catalogue records

### TEST 1 — CUSTOMER CREATION

"Chetna customer add karo."

Expected:

Duplicate check, editable draft, real customer creation.

### TEST 2 — INCOMPLETE BILL

"Chetna ka ₹200 bill banao."

Expected:

Ask for missing products.

### TEST 3 — COMPLETE BILL

"Chetna ko 5 kilo aloo ₹200 mein beche, cash mila."

Expected:

Actual sale draft and validated save.

### TEST 4 — SPLIT PAYMENT

"Chetna ko ₹200 ka bill banao, 100 cash aur 100 udhaar."

Expected:

Clarify missing products, then correct payment split.

### TEST 5 — MULTI-PRODUCT SALE

"Rahul ko 2 kilo aloo aur 3 kilo pyaz beche."

Expected:

Resolve prices and payment details as necessary.

### TEST 6 — VOICE STOCK

"10 kilo pyaz aur 20 kilo aloo add karo."

Expected:

Correct stock workflow based on intent/context, with clarification if necessary.

### TEST 7 — MISSING PRODUCT

"15 kilo bhindi stock mein add karo."

Expected:

Create product draft and stock addition without forcing a separate product page.

### TEST 8 — SCREENSHOT FAILURE COMMAND

"10 kilo Aashirwad Aata 2 kilo basmati rice aur 10 kilo daal add kar do kar do cash."

Expected:

Extract known items, detect ambiguity, ask whether Stock or Cash Sale, then continue within the same VoiceOS session.

No generic wrong-workflow dead end.

### TEST 9 — CUSTOMER PAYMENT

"Neha ke ₹100 udhaar payment record karo."

Expected:

Correct customer and ledger validation.

### TEST 10 — CUSTOMER BALANCE

"Neha ke kitne paise baaki hain?"

Expected:

Actual authorised outstanding balance.

### TEST 11 — STOCK CHECK

"Kitna Aashirvaad Atta bacha hai?"

Expected:

Real inventory quantity.

### TEST 12 — PURCHASE

"Gupta Traders se 10 kilo chawal receive hua."

Expected:

Resolve supplier/receipt workflow correctly.

### TEST 13 — EXPENSE

"Aaj 500 rupaye electricity ka expense add karo."

Expected:

Valid expense draft and confirmation.

### TEST 14 — DEMANDPULSE

"Teen customers ko blue shirt XL chahiye, total paanch pieces."

Expected:

One correct demand interpretation without quantity multiplication.

### TEST 15 — INVOICE PDF

"Neha ka last bill dikhao."

Expected:

Open the correct authorised invoice.

### TEST 16 — WHATSAPP

"Rahul ka last bill WhatsApp ke liye prepare karo."

Expected:

Actual PDF and recipient confirmation.

### TEST 17 — DAILY CLOSING

"Aaj ka shop closing prepare karo."

Expected:

Accurate summary, no premature close.

### TEST 18 — VOICE CORRECTION

"10 nahi 12 kilo pyaz karo."

Expected:

Modify the existing draft row.

### TEST 19 — DUPLICATE SPEECH

"Add kar do kar do."

Expected:

No duplicate transaction.

### TEST 20 — CUSTOMER AMBIGUITY

Two customers named Chetna.

Expected:

Ask which customer.

### TEST 21 — PRODUCT AMBIGUITY

Multiple dal varieties.

Expected:

Request selection.

### TEST 22 — PRICE AMBIGUITY

"20 kilo daal 1000 rupaye ki add karo."

Expected:

Clarify cost/rate interpretation if not sufficiently established.

### TEST 23 — LOW STOCK

Attempt to sell more quantity than available.

Expected:

Actual stock validation, no invalid write.

### TEST 24 — PERMISSION

Staff attempts an owner-only financial correction.

Expected:

Backend denies the action.

### TEST 25 — NETWORK FAILURE

Save request times out.

Expected:

Preserve draft, reconcile operation status and prevent duplicate save.

### TEST 26 — HINDI SPEECH

"पाँच किलो आलू स्टॉक में जोड़ दो।"

Expected:

Correct entity and unit extraction.

### TEST 27 — HINGLISH SPEECH

"Rahul ka 500 rupaye payment record karo."

Expected:

Correct payment workflow.

### TEST 28 — ENGLISH SPEECH

"Create a sale for two packets of noodles."

Expected:

Appropriate sale draft and missing-field handling.

### TEST 29 — CROSS-MODULE ROUTING

User is on Bills page and commands:

"20 kilo pyaz stock mein add karo."

Expected:

Stock workflow without manual navigation.

### TEST 30 — FINANCIAL INTEGRITY

Confirm a sale and inspect:

- Invoice
- Inventory
- Payment
- Customer ledger
- Dashboard

Expected:

All records consistent and no duplicate transactions.

---

# 47. AUTOMATED TESTING REQUIREMENTS

Add appropriate:

- Unit tests
- Parser tests
- Intent classification tests
- Schema validation tests
- Entity resolution tests
- Business-service integration tests
- Database transaction tests
- Idempotency tests
- Multi-tenant isolation tests
- Role permission tests
- VoiceOS state-machine tests
- React component tests
- Localization tests
- Browser E2E tests
- Visual regression tests
- Accessibility tests

### Speech Provider Testing

Use deterministic transcripts for routine automated regression tests.

Separately test actual microphone-to-transcription behaviour in supported browsers and configured provider environments.

Do not claim that transcript-based tests prove live speech recognition quality.

### Financial Testing

Test authoritative ledger and inventory changes after actual backend commits.

Do not accept frontend-only success as proof of business correctness.

---

# 48. VISUAL REGRESSION AND SCREENSHOT REVIEW

Inspect the actual rendered application.

Capture redesigned screens for:

1. Stock Details
2. DemandPulse
3. Customer Details
4. DukaanSet AI
5. Settings
6. VoiceOS Idle
7. VoiceOS Listening
8. VoiceOS Clarification
9. VoiceOS Draft Ready
10. VoiceOS Saving
11. VoiceOS Success
12. VoiceOS Error Recovery

Compare them against the supplied screenshot problems and the approved Dashboard design system.

### Review Criteria

- Visual hierarchy
- Readability
- Typography
- Spacing
- Card quality
- Whitespace
- Action discoverability
- Status clarity
- Mobile layout
- Consistent colours
- Clear navigation
- Reduced form complexity

Do not stop once the CSS compiles.

Review actual screenshots and correct visible defects.

---

# 49. ACTUAL CODEBASE DEBUGGING STRATEGY

Before replacing VoiceOS, diagnose why the current flow rejects or fails to save commands.

Inspect:

- Speech transcription result handling
- Intent classification
- Current page intent restrictions
- Command parsing
- Parsed entity schemas
- Customer/product lookup
- Form population
- Draft state transitions
- Required-field validators
- Backend action mapping
- Save handlers
- Network requests
- Authentication
- Permissions
- Database writes
- Error responses
- Query invalidation
- Duplicate prevention

### Specifically Investigate

Why does the Bill Voice screen reject a stock-like instruction?

Why does it ask for quantities already spoken?

Why is "cash" considered before the sale-versus-stock decision?

Why does the transcript show an applied state without a completed action?

Why is the system unable to continue naturally into the correct workflow?

Find and fix the actual causes.

Do not merely suppress visible warnings.

---

# 50. OBSERVABILITY AND DEBUGGING

Implement development-friendly structured diagnostics.

For each voice command, record appropriate non-sensitive execution metadata:

- Command request ID
- Current workflow state
- Detected intent
- Parser/provider used
- Confidence or ambiguity indicators
- Entity resolution status
- Missing-field summary
- Draft version
- Confirmation state
- Backend action reference
- Final result
- Failure category
- Timing metrics

Do not log sensitive full transcripts unnecessarily.

Do not expose raw internal logs to shopkeepers.

Use development tooling to diagnose real failures.

Make debugging reproducible.

---

# 51. USER ACCEPTANCE CRITERIA

Test common tasks with the goal that a first-time merchant can complete them without developer knowledge.

### Customer

Can the merchant see pending money and add a payment?

### Stock

Can they see the available quantity and add stock by voice?

### DemandPulse

Can they record missed demand and understand what happens next?

### Billing

Can they create a complete sale by speaking naturally?

### Business Assistant

Can they ask a simple financial question and receive an accurate answer?

### Settings

Can they find VoiceOS and shop settings without understanding technical integrations?

### Daily Closing

Can they review their daily hisaab and confirm closing?

Do not confuse minimal design with hiding the core functionality.

---

# 52. CI/CD AND ENVIRONMENT REQUIREMENTS

Use the existing DukaanSet development process.

Recommended flow:

`feature/* → dev → main`

Integrate relevant:

- Lint
- Type checking
- Unit tests
- Backend integration tests
- Voice intent tests
- Financial invariants
- Inventory consistency checks
- Localization validation
- Browser E2E
- Visual regression
- Accessibility checks
- Production build verification

### Staging

Use isolated staging/demo businesses.

Do not perform tests against actual merchant financial records.

Keep AI/STT provider credentials server-side.

Do not expose API keys.

Confirm actual staging behaviour before reporting deployment success.

---

# 53. IMPLEMENTATION PRIORITY

## PHASE 1 — AUDIT AND ROOT-CAUSE ANALYSIS

- Inspect seven screenshots.
- Inspect the existing repository.
- Identify all affected routes.
- Audit manual workflows.
- Audit VoiceOS parsers.
- Inspect the broken billing command path.
- Create the voice capability matrix.
- Preserve the approved Dashboard design.

## PHASE 2 — PREMIUM UI FOUNDATION

- Refine shared design tokens.
- Update reusable page components.
- Redesign Stock Details.
- Redesign DemandPulse.
- Redesign Customer Details.
- Redesign DukaanSet AI.
- Redesign Settings.
- Replace form-heavy VoiceOS UI.

## PHASE 3 — GLOBAL VOICEOS ROUTING

- Central action registry.
- Automatic intent detection.
- Cross-module handoff.
- Entity extraction.
- Customer/product resolution.
- Hindi/Hinglish normalization.
- Missing-field clarification.
- Draft session management.

## PHASE 4 — REAL BACKEND EXECUTION

- Customer creation.
- New Sale.
- Multi-item Billing.
- Stock Auto Product Creation.
- Stock Updates.
- Customer Payments.
- Purchases and Receiving.
- Supplier Payments.
- Expenses.
- DemandPulse.
- Reports.
- PDF generation.
- WhatsApp preparation.
- Daily Closing.

## PHASE 5 — ADVANCED CONVERSATIONAL EXPERIENCE

- Multi-turn context.
- Spoken corrections.
- Ambiguous intent resolution.
- Multiple products.
- Price interpretation.
- Payment splitting.
- Duplicate speech handling.
- Error recovery.
- Typed command parity.

## PHASE 6 — PRODUCTION QUALITY

- English, Hindi and Hinglish.
- Real microphone/provider verification.
- Security.
- Financial consistency.
- Idempotency.
- Mobile responsiveness.
- Accessibility.
- Performance.
- Automated tests.
- Browser E2E testing.
- Visual regression.
- Staging verification.

Do not spend excessive time on decorative effects while core VoiceOS commands remain broken.

---

# 54. FINAL REQUIRED DELIVERABLES

Deliver a functional implementation containing:

1. Premium Stock Details.
2. Premium DemandPulse.
3. Premium Customer Details.
4. Premium DukaanSet Business Assistant.
5. Premium Settings.
6. Redesigned microphone-first VoiceOS.
7. Working global VoiceOS launcher.
8. Cross-module intent routing.
9. Central action registry.
10. Structured command parsing.
11. Hindi speech support.
12. English speech support.
13. Hinglish speech support.
14. Real customer lookup.
15. Real product lookup.
16. Automatic product drafting for stock.
17. Multi-product extraction.
18. Correct quantity/unit interpretation.
19. Selling price and purchase cost distinction.
20. Natural missing-field questions.
21. Multi-turn conversations.
22. Spoken draft corrections.
23. Editable action previews.
24. One final confirmation for normal write actions.
25. Real customer creation.
26. Real sale creation.
27. Correct stock mutations.
28. Correct payment recording.
29. Correct customer ledger integration.
30. Purchases and supplier support.
31. DemandPulse voice support.
32. Invoice/PDF voice support.
33. WhatsApp preparation.
34. Daily Closing voice support.
35. Read-only business questions.
36. Financial safety validation.
37. Backend permission enforcement.
38. Idempotent transaction execution.
39. Secure speech integration.
40. Typed-input fallback.
41. Centralised multilingual UI.
42. Product image improvements.
43. Responsive desktop/mobile experience.
44. Accessible interactions.
45. Comprehensive automated tests.
46. Actual browser workflow verification.
47. Before/after screenshots.
48. Voice capability matrix.
49. Staging verification where available.
50. Final implementation and QA report.

---

# 55. FINAL ACCEPTANCE CRITERIA

Do not consider this work complete until:

- All seven screenshot-identified screens are visually improved.
- The approved Dashboard design language remains consistent.
- Stock Details are compact and understandable.
- DemandPulse provides clear next steps.
- Customer activities use readable transaction labels.
- DukaanSet AI looks and behaves like a useful business assistant.
- Settings are visually organised and usable.
- The VoiceOS form-heavy design is replaced.
- The global microphone works.
- VoiceOS correctly detects cross-module commands.
- The screenshot's previously rejected instruction can proceed through clarification to the appropriate workflow.
- Products and quantities already spoken are not unnecessarily requested again.
- Missing details are requested individually and clearly.
- The merchant can correct an existing draft naturally.
- Normal write actions require explicit confirmation.
- Read-only questions return accurate business data.
- Sales are saved through real backend services.
- Inventory changes are accurate.
- Customer payments update the correct ledger.
- Missing products can be safely prepared during stock addition.
- Product creation and stock addition do not produce duplicates.
- Split payments and udhaar are correct.
- VoiceOS does not claim success after a failed backend operation.
- Transcript processing state is distinct from saved transaction state.
- Duplicate transcript events do not cause duplicate writes.
- English, Hindi and Hinglish commands have verified coverage.
- All major existing manual workflows have corresponding tested voice action definitions or documented genuine limitations.
- Tenant isolation and permissions are enforced.
- Mobile UI is usable.
- Actual rendered screens pass visual review.
- Critical end-to-end tests pass.
- Unverified external provider functionality is not misrepresented as working.

---

# 56. FINAL EXECUTION DIRECTIVE

You are responsible for transforming DukaanSet into a premium, voice-first business management product.

### FIRST

Analyse all seven screenshots.

### SECOND

Inspect the real source code and identify the existing VoiceOS failure points.

### THIRD

Preserve the approved Dashboard design and apply its premium visual language to the screenshot-identified modules.

### FOURTH

Rebuild VoiceOS around a central global intent router and safe business action registry.

### FIFTH

Fix cross-module commands so users do not have to manually navigate to the correct page.

### SIXTH

Implement natural Hindi, English and Hinglish command understanding with contextual clarification.

### SEVENTH

Connect each supported action to the existing authoritative business service.

### EIGHTH

Require explicit confirmation for financial and inventory writes.

### NINTH

Test the complete journey from microphone input to real database mutation and refreshed business records.

### TENTH

Perform actual browser visual inspection and end-to-end testing.

## MOST IMPORTANT EXAMPLE

The merchant speaks:

"10 kilo Aashirwad Aata, 2 kilo Basmati Rice aur 10 kilo Daal add kar do, cash."

DukaanSet should not show a generic workflow rejection.

It should identify the products and quantities, determine whether the user intends stock addition or a cash sale, ask one clarification if required, preserve the extracted information, prepare the correct authorised draft, and complete the operation after merchant confirmation.

If the merchant provides all required details in the first instruction, do not ask unnecessary questions.

## ULTIMATE PRODUCT EXPERIENCE

**Merchant Speaks**

↓

**DukaanSet Understands**

↓

**Correct Workflow Identified**

↓

**Actual Records Matched**

↓

**Missing Details Clarified**

↓

**Editable Preview Prepared**

↓

**Merchant Confirms**

↓

**Real Backend Operation Executes**

↓

**Business Records Update**

↓

**Accurate Result Displayed**

## FINAL PRODUCT DESIGN RULE

**A shopkeeper must not need to understand the application's modules to tell DukaanSet what they want done.**

## FINAL TECHNICAL RULE

**Every voice operation must use the same authoritative business rules, validation, permissions and transactional safety as its manual equivalent.**

## FINAL USER EXPERIENCE RULE

**Never leave the merchant at a generic error when a short clarification or safe alternative can move the task forward. Never hide a genuine failure or invent a successful action.**

## FINAL QUALITY STANDARD

Premium SaaS Design.

Maximum Simplicity.

Natural Multilingual Conversation.

Complete Business Workflow Coverage.

Reliable Backend Execution.

Safe Financial and Inventory Operations.

Extensive Edge-Case Testing.

## FINAL PRODUCT PROMISE

**DukaanSet VoiceOS — Aap Bolo, DukaanSet Kaam Sambhale.**

**BEGIN THE COMPLETE IMPLEMENTATION INSIDE THE EXISTING DUKAANSET REPOSITORY. FIX ACTUAL WORKFLOW FAILURES, IMPLEMENT REAL END-TO-END VOICE OPERATIONS, REDESIGN THE SCREENSHOT-IDENTIFIED PAGES, AND VERIFY THE RESULT THROUGH BROWSER AND BACKEND TESTING. DO NOT STOP AT PLANNING, UI MOCKUPS, HARDCODED COMMAND DEMOS OR UNVERIFIED CLAIMS.**
