# DUKAANSET V11.1 — ULTIMATE GLOBAL VOICEOS 2.0

## FINAL PREMIUM CONVERSATIONAL AI BUSINESS ASSISTANT — COMPLETE IMPLEMENTATION MASTER PROMPT

### TRANSFORM THE EXISTING DUKAANSET VOICEOS INTO A UNIVERSAL, INTELLIGENT, MOBILE-FIRST BUSINESS ACTION SYSTEM

---

# PROJECT IDENTITY

**Product:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Feature Name:** Global VoiceOS 2.0

**Product Promise:** Aap Bolo, DukaanSet Kaam Sambhale.

**Core User Experience:** Speak → Understand → Prepare → Review → Confirm → Save

**Target Audience:** Nontechnical Indian shopkeepers operating grocery, clothing, hardware, vegetable, mobile accessory and other retail businesses.

## PRIMARY GOAL

Build one intelligent global VoiceOS assistant that allows merchants to manage business activities using natural spoken or typed instructions.

The user should not need to understand the application's internal module structure.

They should be able to ask DukaanSet to:

- Add customers
- Prepare bills
- Record sales
- Add inventory
- Record customer payments
- View outstanding balances
- Record purchases
- Receive supplier stock
- Record expenses
- Track missing customer demand
- Open invoices and reports
- Prepare PDF documents
- Prepare WhatsApp invoice sharing
- Review daily business activity
- Prepare shop closing

All actions must use real, authorised DukaanSet business services.

The frontend must remain exceptionally simple.

The backend must remain secure, reliable and financially accurate.

---

# 1. YOUR ROLE

Act as an integrated team of:

- Principal AI Product Architect
- Conversational AI Engineer
- Speech Recognition Specialist
- Senior Full-Stack Engineer
- SaaS Solutions Architect
- Financial Systems Engineer
- Senior Product Designer
- Mobile UI/UX Designer
- Internationalization Engineer
- Security Engineer
- QA Automation Engineer

Work inside the EXISTING DukaanSet repository.

Inspect the actual application architecture before implementation.

Do not create a disconnected chatbot.

Do not replace existing business modules with duplicate VoiceOS implementations.

Do not stop after creating a visually attractive mockup.

Implement real functionality, backend integration, data validation, permissions and tests.

---

# 2. CURRENT SCREENSHOT AUDIT — MANDATORY

Use the provided VoiceOS screenshot as the baseline.

The current screenshot shows a VoiceOS modal open above the Customers page.

## Identified Problems

- The modal is too tall and visually cluttered.
- It has an awkward internal scrollbar.
- Important actions may appear below the visible screen.
- Too many instructions are shown together.
- The user is asked to choose what they want to do.
- Spoken language and display language controls compete for attention.
- The microphone action is not visually prominent.
- A large empty textarea occupies unnecessary space.
- Technical wording such as "Fill draft" feels unfamiliar.
- The layout resembles a complicated configuration form.
- The assistant does not clearly communicate what it understood.
- The next action is not immediately obvious.

## Required Outcome

Replace the existing form-heavy popup with a premium, conversational assistant.

The default screen should feel simple enough for a first-time shopkeeper.

The user should see:

1. DukaanSet VoiceOS branding.
2. Active shop context.
3. One large microphone action.
4. A short instruction.
5. Two or three example commands.
6. Optional typing input.

Everything else should appear contextually after a command is understood.

Do not solve the problem by merely shrinking existing fields.

Redesign the underlying interaction model.

---

# 3. PRIMARY PRODUCT PHILOSOPHY

## THE SHOPKEEPER SHOULD NOT NEED TO KNOW WHERE A FEATURE LIVES

VoiceOS must automatically understand the intended action.

### Example

The merchant is on the Customers page.

They say:

"Chetna ke naam se ₹200 ka bill bana do."

VoiceOS must identify a billing request.

It must not interpret it as customer creation simply because the current page is Customers.

### Another Example

The merchant is on the Inventory page.

They say:

"Rahul ke 500 rupaye udhaar payment record karo."

VoiceOS must prepare a customer payment.

### Another Example

The merchant is on the Dashboard.

They say:

"Aloo ka 20 kilo stock add karo."

VoiceOS must prepare an inventory operation.

### Non-Negotiable Rule

**VoiceOS is global, not module-limited.**

Page context may help interpretation, but the user's explicit instruction takes priority.

---

# 4. NEW PREMIUM VOICEOS UI

Create a modern assistant panel matching DukaanSet branding.

## Visual Identity

Primary Deep Teal: #103B36

Mint Accent: #22C99D

Off-White: #F7FAF8

Charcoal: #1A2624

Amber: #F5B942

Use the existing DukaanSet typography and component system.

## Desktop

Use a compact floating assistant panel or responsive dialog.

Requirements:

- Comfortable readable width.
- Clear visual hierarchy.
- Minimal initial content.
- Expandable structured previews.
- No unnecessary nested scrollbars.
- Important controls remain accessible.
- The underlying page remains recognisable.

## Mobile

Use a polished responsive bottom sheet or appropriate full-screen assistant view.

Requirements:

- Large microphone button.
- Readable conversation.
- Keyboard-aware layout.
- Sticky confirmation area when needed.
- Accessible close action.
- No overlapping navigation.
- No hidden Save button.
- Excellent performance on affordable Android devices.

---

# 5. DEFAULT VOICEOS EXPERIENCE

The initial screen must remain minimal.

## Header

DukaanSet VoiceOS

**Speak. Review. Save.**

Below the header:

Active Business: Sharma Kirana Store

Use actual active-business context.

## Main Area

Large central microphone.

Headline:

**What would you like to do?**

Supporting text:

"Speak or type your request."

## Quick Suggestions

Display at most three relevant examples.

Examples:

"Create a bill."

"Add a customer."

"Show today's sales."

These examples should vary based on relevant business context.

## Optional Text Input

Provide:

"Type your request..."

Do not show the full action form until the system understands the user's intent.

Keep speech settings behind a compact control.

---

# 6. GLOBAL VOICEOS LAUNCHER

VoiceOS must be accessible throughout the authenticated application.

Supported locations include:

- Home Dashboard
- Customers
- Bills
- Stock
- Purchases
- Suppliers
- Expenses
- Payments
- DemandPulse
- Reports
- Daily Closing

Implement one global launcher in the authenticated application shell.

Do not duplicate separate incompatible assistants across modules.

On desktop, place the launcher consistently in the navigation or header.

On mobile, make it easily accessible without covering essential bottom-navigation actions.

Support keyboard access and clear accessible labels.

Opening the assistant should not reset the current page's unsaved data.

---

# 7. AUTOMATIC INTENT DETECTION

Remove the requirement to manually choose the action category.

Create an intelligent intent-routing layer.

Examples of intents:

CREATE_CUSTOMER

FIND_CUSTOMER

CREATE_SALE

VIEW_SALE

ADD_STOCK

VIEW_STOCK

RECORD_CUSTOMER_PAYMENT

RECORD_PURCHASE

RECEIVE_PURCHASE_STOCK

RECORD_SUPPLIER_PAYMENT

RECORD_EXPENSE

RECORD_MISSED_DEMAND

GENERATE_INVOICE_PDF

GENERATE_CUSTOMER_STATEMENT

GENERATE_PAYMENT_RECEIPT

PREPARE_WHATSAPP_SHARING

GET_DAILY_SUMMARY

OPEN_PAGE

PREPARE_DAILY_CLOSING

## Implementation Requirement

Each intent must map to an explicitly supported action.

The AI must not be allowed to call arbitrary database operations.

Use:

- Intent classification
- Structured entity extraction
- Schema validation
- Real record lookup
- Permission checks
- Missing-field resolution
- Existing backend service mapping

Use an LLM, deterministic parser or hybrid approach appropriate to the actual repository.

Do not pretend AI understanding works when the necessary service is not configured.

---

# 8. CUSTOMER CREATION COMMAND

## Example

"Chetna ke naam se customer add kar do."

Expected interpretation:

Intent: CREATE_CUSTOMER

Customer Name: Chetna

## Workflow

1. Search existing customers in the active business.
2. Detect possible duplicates.
3. If an appropriate existing customer is found, offer to use that record.
4. If none exists, prepare a new customer draft.
5. Ask only for genuinely required missing information.
6. Display the draft.
7. Wait for confirmation.
8. Use the existing Customer creation service.
9. Show success after backend confirmation.

## Draft Preview

Action: New Customer

Name: Chetna

Phone: Optional, if permitted by the existing data model

Status: Ready to Create

Primary Action:

**Confirm & Save**

Do not force phone entry when it is optional.

Do not create duplicate customers from ambiguous name matches.

---

# 9. INCOMPLETE BILL COMMAND

## Example

"Chetna ke naam se ₹200 ka bill bana do."

Expected understanding:

Customer: Chetna

Bill Total: ₹200

Product: Not specified

Payment Method: Not specified

VoiceOS must respond naturally:

"Chetna ka ₹200 ka bill bana dete hain. Kaunsa samaan liya tha?"

Do not invent a product.

Do not invent a quantity.

Do not silently assign the bill to Cash, UPI or Udhaar.

Maintain the existing draft while asking for additional details.

---

# 10. COMPLETE BILL COMMAND

## Example

"Chetna ko 5 kilo aloo ₹200 mein beche."

Expected interpretation:

- Customer: Chetna
- Product: Aloo
- Quantity: 5
- Unit: kg
- Total Amount: ₹200
- Implied Rate: ₹40/kg
- Payment Method: Missing

## Validation

Check:

- Existing customer record.
- Existing Aloo inventory product.
- Product unit.
- Available stock.
- Active selling price.
- Permission to override pricing.
- Actual invoice amount.
- Payment details.

If the amount represents the total for five kilograms, calculate the implied unit rate.

If that rate differs from configured pricing, present the difference clearly and request appropriate confirmation.

Then ask:

"₹200 cash mila, UPI se mila, ya udhaar hai?"

## Final Draft

Customer: Chetna

Product: Aloo

Quantity: 5 kg

Unit Rate: ₹40, when valid and authorised

Total: ₹200

Payment: Merchant-selected mode

Primary Action:

**Confirm & Save Sale**

Only after confirmation should the real sale be recorded.

---

# 11. COMPLETE BILL WITH PAYMENT

## Example

"Chetna ko 5 kilo aloo ₹200 mein beche, ₹100 cash mila aur ₹100 udhaar hai."

Expected result:

Sale Total: ₹200

Cash Received: ₹100

Customer Credit: ₹100

Inventory Deduction: 5 kg

Customer Purchase History: Updated

Customer Outstanding: Updated by the correct ledger movement

Invoice: Created once

The system must:

1. Resolve the customer.
2. Resolve the product.
3. Validate stock and unit.
4. Validate pricing and amount.
5. Validate the payment split.
6. Display the draft.
7. Require confirmation.
8. Commit through the existing sale service.
9. Refresh all affected business views.

Do not execute disconnected payment and inventory operations that can leave inconsistent records.

Use atomic, idempotent backend operations.

---

# 12. MULTIPLE ACTIONS IN ONE COMMAND

Support instructions that contain dependent business actions.

## Example

"Chetna naam ki customer add karo aur uska 5 kilo aloo ka ₹200 bill bana do."

VoiceOS should understand:

Action 1: Create customer if required.

Action 2: Prepare a sale.

Action 3: Record the confirmed payment information.

Show one combined, understandable preview.

If the customer already exists, reuse the appropriate authorised record.

Do not create the same customer twice.

Do not save the customer and abandon a failed sale without a clearly defined recoverable transaction policy.

Prefer atomic execution for dependent operations where feasible.

For workflows that cannot safely be atomic, use an explicitly designed staged process with clear partial-completion reporting and recovery.

Never falsely claim the entire operation succeeded after only one step completed.

---

# 13. SUPPORT MULTI-PRODUCT COMMANDS

## Example

"Rahul ko 2 kilo aloo 40 rupaye kilo aur 3 kilo pyaz 30 rupaye kilo beche."

Expected draft:

Aloo: 2 kg × ₹40 = ₹80

Pyaz: 3 kg × ₹30 = ₹90

Grand Total: ₹170

VoiceOS must correctly associate:

- Product names
- Quantities
- Units
- Unit rates
- Line totals

Then ask for missing payment details.

Support multiple variants and units.

Do not combine unrelated product quantities.

Do not infer a discount or additional tax without authoritative settings and applicable sale data.

---

# 14. MULTI-TURN CONVERSATION

VoiceOS must support natural conversation.

### Example

Merchant:

"Chetna ka bill banao."

Assistant:

"Kaunsa samaan liya tha?"

Merchant:

"5 kilo aloo."

Assistant:

"Kitne rupaye ka?"

Merchant:

"200 rupaye."

Assistant:

"Cash, UPI ya udhaar?"

Merchant:

"Cash."

Assistant:

Displays the complete bill draft.

The merchant confirms.

## Critical Behaviour

Retain previously confirmed draft information.

Do not restart the process after every spoken response.

Ask only the specific missing question.

Do not repeatedly ask for information already provided.

---

# 15. NATURAL COMMAND CORRECTIONS

Support corrections inside the same draft.

Examples:

"5 kilo nahi, 4 kilo aloo karo."

"Customer Chetna nahi, Rahul karo."

"Cash nahi, UPI payment hai."

"Do shirts ki jagah teen shirts karo."

## Expected Behaviour

Update the existing draft.

Do not append duplicate line items.

Recalculate totals when the correction requires it.

If the original total is now inconsistent, clarify the intended pricing.

Revalidate the customer, inventory, payment and permissions after a meaningful correction.

Never save an earlier draft that no longer matches the latest confirmed information.

---

# 16. SMART CUSTOMER MATCHING

Use the actual customer database.

Support:

- Hindi names
- English names
- Romanized Hindi names
- Approved aliases
- Existing customer references
- Phone-number matching where explicitly supplied

Examples:

Chetna

चेतना

Chetna Sharma

Do not automatically assume similarly named customers are identical.

If multiple possible matches exist, display a simple choice.

Do not select a financial customer record based only on an uncertain name match.

Preserve original customer names.

All searches must be restricted to the active business.

---

# 17. SMART PRODUCT MATCHING

Resolve products using the real inventory catalogue.

Examples:

Aloo

आलू

Potato

These can map to the same product where configured aliases or verified matching rules support it.

Use:

- Product name
- Approved aliases
- Variant
- Unit
- SKU
- Business category
- Active inventory records

## Ambiguity Example

"Blue Shirt"

Available variants:

Blue Shirt M

Blue Shirt L

Blue Shirt XL

Ask for the correct variant.

Do not randomly select one.

## Missing Inventory

If a product is not in the catalogue, do not silently invent an inventory product or complete a stock-linked sale.

Ask whether the merchant wants to add or select a product, using the existing authorised workflow.

Do not use AI image recognition or automatic photo matching as a hidden prerequisite.

Keep sale-photo attachments optional and purely documentary where supported.

---

# 18. GLOBAL BUSINESS ACTIONS

Build one reusable action registry supporting the existing application's capabilities.

## Customers

- Create Customer
- Find Customer
- Open Customer Details
- Show Purchase History
- Show Pending Balance

## Sales

- Prepare New Sale
- Prepare Multi-Product Sale
- Find Invoice
- Show Bill Details
- Open Invoice PDF

## Inventory

- Check Stock
- Prepare Stock Addition
- Show Low Stock
- Open Product Details
- Show Stock Movement

## Payments

- Record Customer Payment
- Show Outstanding Balance
- Find Payment History
- Generate Payment Receipt

## Purchases

- Prepare Supplier Purchase
- Receive Goods
- Show Purchase Details
- Record Supplier Payment

## Expenses

- Record Expense
- View Expense Summary

## DemandPulse

- Record Missing Product Demand
- View Unmet Demand
- Open Reorder Suggestions

## Reports

- Today's Sales
- Cash Collections
- UPI Collections
- Customer Outstanding
- Daily Business Summary

## Smart Invoice Studio

- Generate Existing Invoice
- Generate Customer Hisaab
- Generate Payment Receipt

## WhatsApp

- Prepare Invoice Sharing
- Open Recipient Confirmation

## Smart Shop Closing

- Review Today's Closing
- View Closing History
- Prepare Closing PDF
- Finalise Closing with explicit confirmation

Only advertise actions that have actual implemented backend support.

---

# 19. ACTIONS MUST HAVE DIFFERENT SAFETY LEVELS

Separate VoiceOS commands into three groups.

## A. READ-ONLY ACTIONS

Examples:

"Aaj ki total sale batao."

"Rahul ke kitne paise baaki hain?"

"Aloo ka stock kitna hai?"

These should return authorised information without a Save confirmation.

## B. NAVIGATION ACTIONS

Examples:

"Customers kholo."

"Sales history dikhao."

These may navigate immediately to authorised pages.

## C. STATE-CHANGING ACTIONS

Examples:

"Customer add karo."

"Bill save karo."

"Payment record karo."

"Stock add karo."

These require:

- Draft preparation
- Real record validation
- Permission checks
- Explicit confirmation
- Backend success verification

## HIGH-RISK ACTIONS

Refunds, reversals, destructive operations, financial corrections, user-permission changes and final shop closing must follow additional domain-specific safeguards.

VoiceOS must never bypass existing security rules.

---

# 20. MY MOST IMPORTANT RECOMMENDATION — GLOBAL BUSINESS ACTION ENGINE

Do not implement separate command parsers inside every module.

Create one central VoiceOS action engine.

Recommended architecture:

- GlobalVoiceOSLauncher
- VoiceOSPanel
- SpeechRecognitionAdapter
- VoiceIntentRouter
- StructuredEntityExtractor
- BusinessContextResolver
- CustomerResolver
- ProductResolver
- VoiceActionRegistry
- DraftManager
- ClarificationManager
- VoiceActionValidator
- VoiceConfirmationService
- VoiceActionExecutor
- VoiceResultPresenter
- VoiceAuditService

## Processing Pipeline

Voice or Text

→ Speech Transcription, if required

→ Intent Detection

→ Structured Entity Extraction

→ Active Business Resolution

→ Customer/Product Lookup

→ Missing Information Detection

→ Action Draft

→ Validation

→ Confirmation

→ Existing Domain Backend Service

→ Successful Database Commit

→ Updated UI

→ Final Result

The engine should be modular and extensible.

Do not allow arbitrary LLM-generated database queries or unrestricted tool execution.

---

# 21. SPEECH LANGUAGE AND DISPLAY LANGUAGE

These are separate settings.

## Display Language

Controls the UI and assistant responses.

Supported:

English

Hindi

Hinglish

## Spoken Language

Controls speech recognition preferences.

Examples:

Hindi

English

Mixed Hindi-English, when supported by the selected provider

## Recommended UX

Use the existing global display-language selection.

Do not repeat a large display-language selector in the VoiceOS panel.

Place microphone language settings behind a simple settings icon.

If the provider offers reliable multilingual language detection, enable it appropriately.

Otherwise, use an explicit speech-language preference.

Do not automatically change the app's display language because the merchant spoke in Hindi.

---

# 22. ACTUAL SPEECH INTEGRATION

Inspect the current implementation.

Determine whether it currently uses:

- Browser Web Speech API
- An actual transcription provider
- A backend speech service
- Hardcoded transcripts
- Placeholder logic

Implement a real speech adapter appropriate to the existing architecture.

Requirements:

- Request microphone permission
- Start recording
- Stop recording
- Show listening state
- Process transcription
- Handle failures
- Support manual input fallback
- Clean up recording resources
- Respect privacy settings

Do not claim always-on listening.

Do not leave the microphone active unexpectedly.

Do not claim mixed-language recognition is perfect.

---

# 23. BETTER MICROPHONE EXPERIENCE

The microphone must be the visual centre of VoiceOS.

## Idle

Large microphone button.

Text:

"Tap to speak."

## Listening

Show a subtle animated waveform or pulse.

Text:

"Listening..."

Show Stop.

## Processing

Text:

"Understanding your request..."

## Clarification

Show the assistant's targeted question.

## Draft Ready

Show the action summary.

## Saving

Show backend processing progress.

## Success

Show real confirmed result.

## Error

Display a useful explanation and a retry option.

Avoid unnecessary animations or long delays.

Respect reduced-motion preferences.

---

# 24. CONVERSATIONAL UI INSTEAD OF TECHNICAL FORMS

Replace technical-looking input groups with a clear conversational layout.

The assistant should visually distinguish:

- User instruction
- Assistant question
- Recognised information
- Editable draft
- Confirmed result

Use compact message cards and structured preview components.

Do not create a long generic chatbot history interface when the merchant only wants to complete one quick action.

Prioritise the current task.

Allow the merchant to reopen or edit the current draft when appropriate.

---

# 25. ONE CONFIRMATION FOR COMPLETE ACTIONS

Avoid asking for confirmation after every extracted field.

Collect necessary information first.

Then show one final action preview.

Example:

Customer: Chetna

Product: Aloo

Quantity: 5 kg

Total: ₹200

Payment: Cash

Primary Action:

**Confirm & Save**

### Important

If the merchant changes the product or quantity, validate the changed draft again.

Do not accidentally execute the earlier version.

If the backend rejects the operation, preserve the draft and show a useful recovery action.

---

# 26. REAL BACKEND AND FINANCIAL INTEGRATION

All committed actions must use existing domain services.

For a real sale:

- Resolve customer
- Resolve product SKU
- Validate stock
- Validate price
- Create invoice
- Save invoice items
- Record payments
- Record customer credit
- Update inventory
- Update customer history
- Update financial ledger
- Update dashboard
- Record audit information

Use transactionally safe operations.

Prevent duplicate writes from:

- Repeated speech
- Double-clicking Save
- Retry requests
- Network timeouts
- Reopened drafts

Use stable action identifiers and appropriate backend idempotency controls.

Do not display success until the authoritative backend confirms it.

---

# 27. PAYMENT SAFETY

Never silently assume a payment method.

Examples:

"₹200 ka bill banao."

This does not mean cash was received.

"₹200 udhaar pe bill banao."

This explicitly indicates credit.

"₹100 cash aur ₹100 UPI."

This indicates a split payment totalling ₹200.

Validate:

- Payment total
- Amount received
- Outstanding amount
- Supported payment methods
- Existing customer balance
- Relevant payment allocations

Never record a payment twice.

Do not claim a manually recorded UPI payment is externally verified unless supported by an actual payment integration.

---

# 28. CONTEXT AWARENESS

VoiceOS must understand the current application context without becoming restricted by it.

Useful context:

- Active business
- Current page
- Currently opened customer
- Currently opened product
- Selected invoice
- User role
- Supported actions

### Example

The merchant opens Chetna's profile.

Says:

"Is customer ka ₹200 bill bana do."

VoiceOS may use Chetna as the selected customer.

If the merchant instead says:

"Rahul ka bill banao."

The spoken customer name overrides the current page context.

Never silently use the wrong customer.

---

# 29. VOICEOS DRAFT SESSION

Maintain a temporary draft state.

Store relevant working information:

- Intent
- Customer
- Product
- Quantity
- Unit
- Price
- Payment details
- Missing fields
- Corrections
- Validation state

Provide:

- Edit
- Cancel
- Start New Command
- Clear Draft

Closing VoiceOS must not commit a pending action.

Use an appropriate session expiry policy.

Do not retain raw voice recordings unnecessarily.

If a merchant accidentally closes the panel, provide sensible draft recovery when safe and supported.

---

# 30. BUSINESS-SPECIFIC SUPPORT

Adapt interpretation to the active shop type.

## Kirana

"10 doodh packet stock mein add karo."

## Vegetables

"5 kilo aloo ₹200 mein beche."

## Clothing

"Rahul ko blue shirt XL ke 2 pieces beche."

## Hardware

"Gupta Traders se 10 pipe receive hue."

## Mobile Accessories

"2 Type-C cable ka bill banao."

Validate business-specific units and variants.

Do not assume kilograms for every product.

Do not silently convert incompatible units.

---

# 31. DEMANDPULSE INTEGRATION

Example:

"Teen customers ko XL blue shirt chahiye, total paanch pieces, stock mein nahi hai."

VoiceOS should prepare one accurately interpreted missed-demand record.

Capture:

- Product
- Variant
- Customer request count
- Requested total quantity
- Availability status
- Optional linked customers

Do not multiply five pieces by three customers.

Do not convert missed demand into a confirmed sale.

Use the existing DemandPulse service and customer-consent rules.

---

# 32. SMART INVOICE STUDIO INTEGRATION

Support:

"Chetna ka last bill PDF kholo."

"Rahul ka is month ka hisaab banao."

"Kal ki payment ki receipt dikhao."

Resolve the correct authorised records.

Use the existing Smart Invoice Studio.

Do not create another invoice when the merchant requests an existing invoice PDF.

Do not change financial values when generating documents.

---

# 33. WHATSAPP INTEGRATION

Example:

"Chetna ka bill WhatsApp kar do."

VoiceOS must:

1. Resolve the correct customer.
2. Resolve the correct invoice.
3. Prepare its existing PDF.
4. Identify the intended recipient.
5. Open the sending preview.
6. Show the actual sending mode.
7. Require explicit merchant confirmation.
8. Execute the authorised manual-share or official provider flow.

Do not pretend a normal WhatsApp link directly attaches a PDF.

Do not claim delivered status without genuine provider confirmation.

---

# 34. DAILY SHOP CLOSING INTEGRATION

Example:

"Aaj ki dukaan close kar do."

VoiceOS must:

1. Identify the current authorised business session.
2. Fetch the actual closing summary.
3. Show sales, collections, credit and cash reconciliation.
4. Display any required review items.
5. Ask for explicit confirmation.
6. Call the existing Smart Shop Closing service.
7. Display the real result.

Do not finalise the daily closing immediately from speech interpretation.

Do not mark physical cash verified without an actual count.

---

# 35. READ-ONLY BUSINESS QUESTIONS

VoiceOS should also answer simple business questions.

Examples:

"Aaj kitni sale hui?"

"Aaj cash kitna aaya?"

"Aaj UPI kitna mila?"

"Rahul ke kitne paise pending hain?"

"Aloo ka kitna stock bacha hai?"

"Kaunse products low stock hain?"

Use authoritative backend queries.

Do not hallucinate numeric values.

Clearly distinguish:

- Sales
- Collections
- Outstanding
- Supplier payables
- Stock quantities

If required information is unavailable, state that clearly.

---

# 36. ERROR AND CLARIFICATION DESIGN

Handle:

- Unclear speech
- Customer not found
- Duplicate customer matches
- Product not found
- Multiple product variants
- Invalid quantity
- Insufficient stock
- Price mismatch
- Missing payment mode
- Unsupported operation
- Permission denied
- Microphone denied
- Network disconnected
- Backend failure
- Provider unavailable
- Expired draft

Ask one useful clarification at a time.

Examples:

"Kaunsi Chetna? Do customers mil rahe hain."

"Blue Shirt ka kaunsa size?"

"₹200 cash mila ya udhaar hai?"

Avoid technical error messages.

Do not erase valid draft data when one field is incorrect.

---

# 37. PRIVACY AND SECURITY

All VoiceOS actions must respect:

- Authentication
- Active-business scope
- User permissions
- Customer privacy
- Secure API validation
- Financial authorization
- Rate limits
- Audit logs
- Data retention policies

Treat transcripts and AI-generated structured outputs as untrusted until validated.

Do not pass entire customer databases or sensitive unrelated records to external AI providers.

Minimise data exposure.

Do not let instructions embedded in product names, notes or retrieved records override action permissions.

All final write operations must be authorised by the backend.

---

# 38. PERFORMANCE

Optimise:

- VoiceOS opening speed
- Speech transcription
- Intent classification
- Customer lookup
- Product lookup
- Draft rendering
- Confirmation
- Backend execution

Use lightweight UI components.

Avoid unnecessary full-page reloads.

Avoid loading every business record into the assistant.

Use scoped lookups and efficient APIs.

Display understandable progress states.

Prioritise responsiveness on common Android devices.

---

# 39. COMPLETE UI/UX REQUIREMENTS

The new VoiceOS must:

- Feel premium
- Look consistent with DukaanSet
- Be instantly understandable
- Have one dominant microphone
- Have a clean conversational interface
- Show only relevant fields
- Avoid nested-scroll problems
- Use simple button labels
- Keep important actions accessible
- Support manual typing
- Provide safe error recovery
- Adapt to desktop and mobile
- Follow the three-language engine
- Respect reduced-motion preferences

Do not clutter the panel with developer-oriented controls.

---

# 40. TEST SCENARIOS

Create tests for all representative commands.

### Scenario A

"Chetna naam ka customer add karo."

Expected: Duplicate check, draft and authorised customer creation.

### Scenario B

"Chetna ka ₹200 bill banao."

Expected: Product clarification before a save-ready draft.

### Scenario C

"Chetna ko 5 kilo aloo ₹200 mein beche, cash mila."

Expected: Real product resolution, inventory validation, price validation and confirmed sale.

### Scenario D

"Chetna customer add karo aur ₹200 ka aloo bill bana do."

Expected: Safe dependent workflow with missing quantity clarification if needed.

### Scenario E

"Rahul ko 2 shirts 899 ki ek bechi. 1000 cash, 500 UPI, baaki udhaar."

Expected: ₹1,798 invoice and ₹298 outstanding, after product and customer resolution.

### Scenario F

"Rahul ke purane udhaar ka ₹500 cash payment record karo."

Expected: Authorised payment, correct ledger update and no duplicate sale.

### Scenario G

"20 kilo aloo stock mein add karo."

Expected: Valid stock receiving or adjustment workflow according to source and permissions.

### Scenario H

"Aaj ki sale batao."

Expected: Accurate read-only summary.

### Scenario I

"Blue Shirt XL nahi mili, teen customers ko total paanch pieces chahiye."

Expected: Correct DemandPulse draft.

### Scenario J

"Aaj ka shop closing prepare karo."

Expected: Accurate closing summary, no premature finalisation.

### Scenario K

"Chetna ka last bill WhatsApp ke liye prepare karo."

Expected: Correct invoice, actual PDF and recipient confirmation.

---

# 41. AUTOMATED QA

Add tests for:

- Global launcher
- Modal layout
- Mobile bottom sheet
- Microphone start and stop
- Permission failures
- Hindi input
- Hinglish input
- English input
- Typed commands
- Intent resolution
- Customer lookup
- Product lookup
- Price and unit validation
- Multi-step conversations
- Missing-field clarification
- Draft corrections
- Multi-item billing
- Payment allocation
- Insufficient stock
- Duplicate action prevention
- Backend authorisation
- Tenant isolation
- Read-only commands
- Write confirmation
- Financial integrity
- Language switching
- Voice session reset
- Keyboard accessibility
- Reduced motion
- Error recovery

Use actual integration and browser tests wherever possible.

Do not confuse mock intent tests with proof that a real speech provider works.

---

# 42. CI/CD AND STAGING

Follow the existing DukaanSet development process.

feature/* → dev → main

Run:

- Lint
- Type checking
- Unit tests
- Action-schema tests
- Customer/product resolver tests
- Financial safety tests
- Integration tests
- Localization validation
- UI tests
- Playwright smoke tests
- Build verification

Verify the feature on the configured staging environment.

Keep AI and speech provider secrets on the backend.

Use isolated test customer and inventory data.

Do not perform real production business writes during automated testing.

Do not claim working speech recognition or AI integration without actual verification.

---

# 43. IMPLEMENTATION ORDER

## PHASE 1 — PREMIUM UI REDESIGN

- Inspect existing VoiceOS.
- Remove form-heavy initial UI.
- Build compact global assistant.
- Add microphone-first design.
- Add conversation view.
- Add structured draft cards.
- Add accessible confirmation controls.

## PHASE 2 — INTELLIGENT GLOBAL COMMAND ENGINE

- Automatic intent detection.
- Action registry.
- Customer resolution.
- Product resolution.
- Missing-field questions.
- Multi-turn draft management.

## PHASE 3 — REAL BUSINESS OPERATIONS

- Customer creation.
- Sales and Billing.
- Inventory.
- Customer payments.
- Purchases.
- Expenses.
- DemandPulse.
- Reports.

## PHASE 4 — ADVANCED INTEGRATIONS

- Multi-product commands.
- Dependent multi-action workflows.
- Conversational corrections.
- Invoice PDFs.
- WhatsApp preparation.
- Daily Closing.
- Business-specific interpretation.

## PHASE 5 — PRODUCTION QUALITY

- Speech provider verification.
- English/Hindi/Hinglish.
- Security.
- Accessibility.
- Performance.
- Mobile responsiveness.
- Automated tests.
- Staging verification.

---

# 44. REQUIRED DELIVERABLES

Deliver:

1. Completely redesigned VoiceOS UI.
2. Global VoiceOS launcher.
3. Premium microphone experience.
4. Natural conversation interface.
5. Automatic intent detection.
6. Unified action registry.
7. Real customer resolution.
8. Real product resolution.
9. Missing-field clarification.
10. Editable structured drafts.
11. Multi-step conversations.
12. Natural corrections.
13. Multi-product bill preparation.
14. Safe customer creation.
15. Real billing integration.
16. Inventory integration.
17. Payment integration.
18. Purchase integration.
19. Expense integration.
20. DemandPulse integration.
21. Reports integration.
22. Smart Invoice Studio integration.
23. WhatsApp send preparation.
24. Smart Shop Closing integration.
25. English support.
26. Hindi support.
27. Hinglish support.
28. Separate spoken-language settings.
29. Manual typing fallback.
30. Backend permission enforcement.
31. Idempotent financial actions.
32. Automated tests.
33. Mobile UI verification.
34. Staging verification where available.
35. Final implementation-status report.

---

# 45. FINAL ACCEPTANCE CRITERIA

Do not mark VoiceOS complete until:

- The existing complicated modal has been redesigned.
- The default assistant interface is minimal.
- One global launcher is available across supported pages.
- A user can speak without selecting a module first.
- Commands are routed to the correct business workflow.
- Customer creation works through the existing backend.
- Incomplete bill requests trigger relevant clarification.
- Complete bill requests prepare an accurate draft.
- Real inventory products and quantities are validated.
- Payment methods are never silently invented.
- Multi-step conversations preserve context.
- Corrections modify existing drafts correctly.
- Multi-product billing works.
- Write actions require explicit confirmation.
- Read-only requests return actual authorised data.
- VoiceOS cannot bypass financial security rules.
- Duplicate sales and payments are prevented.
- Cross-business data isolation is enforced.
- Hindi, English and Hinglish are supported.
- Display language and speech language remain independent.
- Microphone failures have a manual typing fallback.
- UI works correctly on mobile and desktop.
- Save actions remain visible and understandable.
- Financial records stay consistent.
- Actual browser and backend tests pass.
- Unsupported capabilities are not presented as working.

---

# FINAL EXECUTION DIRECTIVE

Redesign and implement DukaanSet VoiceOS 2.0 as a universal conversational business assistant within the EXISTING DukaanSet application.

Use the supplied screenshot to identify and resolve the present UI/UX problems.

Replace the form-heavy modal with a clean premium microphone-first experience.

Remove mandatory module selection.

Automatically interpret natural business commands in Hindi, English and Hinglish.

Use real authorised business records.

Resolve customers, products, variants and financial details safely.

Ask only genuinely missing questions.

Prepare understandable, editable action drafts.

Require explicit confirmation before changing financial, inventory or customer records.

Execute through the existing backend services.

Prevent duplicate actions.

Preserve transaction integrity and auditability.

Integrate globally with Customers, Sales, Stock, Purchases, Payments, Expenses, DemandPulse, Reports, Smart Invoice Studio, WhatsApp and Smart Shop Closing.

### FINAL EXPERIENCE

**User Speaks**

↓

**DukaanSet Understands**

↓

**Correct Business Action Identified**

↓

**Real Records Verified**

↓

**Editable Draft Prepared**

↓

**User Confirms**

↓

**Backend Executes Safely**

↓

**Business Data Updates Correctly**

### NON-NEGOTIABLE PRODUCT PRINCIPLE

**The shopkeeper should not need to learn where every business action exists inside the application.**

### FINAL PRODUCT PROMISE

**DukaanSet VoiceOS — Aap Bolo, DukaanSet Kaam Sambhale.**

### IMPLEMENTATION COMMAND

**BEGIN THE COMPLETE IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY. DO NOT STOP AT PLANNING, UI MOCKUPS OR FAKE AI DEMONSTRATIONS.**
