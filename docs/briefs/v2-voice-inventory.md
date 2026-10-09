# DUKAANSET V2 — FINAL AI VOICE INVENTORY IMPLEMENTATION PROMPT

## YOUR ROLE

Act as a Principal Full-Stack Engineer, AI Engineer, Speech Recognition Specialist, Senior UI/UX Designer, Database Architect, and QA Automation Engineer.

You are working on an existing mobile-first, multi-business SaaS product named **DukaanSet**.

**Tagline:** Apni Dukaan, Sab Set.

Your mission is to implement a complete, production-oriented **Multilingual AI Voice Inventory Management System** directly into the existing application.

This must be a real working feature, not a static UI, decorative microphone button, or disconnected demonstration.

Preserve the existing application architecture, visual identity, business logic, and functionality.

## 1. CORE PRODUCT VISION

Allow shopkeepers to manage products and stock by speaking naturally.

Example:

"Bhai, 4 doodh ke packet add kar do, 2 kilo dal, 5 kilo pyaz, 10 kilo aloo aur 3 packet biscuit bhi add kar do."

DukaanSet should:

1. Listen to the user's voice.
2. Convert speech into text.
3. Understand the spoken instruction.
4. Identify multiple products.
5. Extract quantities and units.
6. Match products with the existing inventory.
7. Resolve ambiguity and missing details.
8. Display an editable preview.
9. Request confirmation.
10. Update the actual inventory safely.
11. Refresh the dashboard and stock history.
12. Show a success summary.

The main objective is to eliminate unnecessary typing and repeated navigation.

## 2. MULTILINGUAL VOICE SUPPORT

Support:

- English
- Hindi
- Hinglish (Romanized Hindi / code-switched speech)

Users may speak in any supported language regardless of the application's selected display language.

The selected application language determines the labels, buttons, instructions, review screen, error messages, and displayed unit descriptions.

Example:

English: "Add four milk packets."

Hindi: "चार दूध के पैकेट जोड़ दो।"

Hinglish: "Char doodh ke packet add kar do."

All three should produce the same structured inventory instruction when product matching is unambiguous.

Use a tested speech recognition provider suitable for Indian English, Hindi, and mixed-language utterances.

Provide a spoken-language override and a manual fallback where recognition is unreliable.

Do not assume that Hinglish is a universally supported dedicated speech-recognition locale.

## 3. MULTI-PRODUCT VOICE ENTRY

One voice command must support multiple products.

Recognise:

- Product names
- Quantities
- Units
- Hindi number words
- English number words
- Mixed-language sentences
- Common abbreviations
- Natural pauses
- Repeated product mentions

Support examples such as:

- 2 kg
- Do kilo
- दो किलो
- Half kilo
- Aadha kilo
- Dedh kilo
- Dhai kilo
- 500 grams
- Four packets
- Ek dozen

Normalise quantities accurately without losing unit information.

## 4. SMART PRODUCT MATCHING

Match recognised product names against the authenticated business's existing product catalogue.

Support:

- Exact matching
- Search aliases
- Hindi/English synonyms
- Phonetic matching
- Fuzzy matching
- Variant recognition
- Brand recognition

Do not automatically select a product when multiple plausible matches exist.

Example:

If the shop contains Toor Dal, Moong Dal, and Masoor Dal, and the owner says "2 kilo dal", ask which product they mean.

If no matching product exists, offer a guided product-creation flow.

Never silently create duplicate catalogue products.

## 5. SMART PRODUCT VOICE ALIASES

Allow shopkeepers to register familiar spoken names for existing products.

Example:

Actual product: Amul Taaza Milk 500ml

Saved alias: Doodh

Another example:

Actual product: Red Onion Premium

Saved aliases: Pyaz, Onion, Pyaaz

The system must use aliases to improve matching.

Aliases should be editable, scoped to the business, and must not unintentionally override another product.

If an alias matches multiple products, request clarification.

## 6. SMART VOICE CORRECTION

Allow users to correct their commands naturally.

Examples:

"10 kilo aloo add karo... nahi, 5 kilo aloo."

"4 milk packets... sorry, 6 packets."

"Pyaz hata do."

"Dal ki quantity 2 se 3 kilo kar do."

Interpret the latest clear correction.

Show the corrected information in the review screen.

Never double-count corrections or repeated interim speech transcripts.

When the correction is ambiguous, request clarification.

## 7. MISSING INFORMATION FOLLOW-UP

When the user forgets important information, the system must ask for it without requiring them to restart the entire entry.

Example:

User: "5 kilo pyaz, 2 kilo dal aur aloo add kar do."

DukaanSet: "Aloo kitna add karna hai?"

User: "10 kilo."

The system must update the existing draft with 10 kg of potatoes.

Other examples:

- Missing quantity
- Missing unit
- Ambiguous product
- Unknown product variant
- Missing product information

Only ask for missing information that is necessary to complete the operation safely.

## 8. STOCK IN VS NEW PRODUCT

Maintain two separate operations:

**Stock In:** Increase the quantity of an existing product.

**Create Product:** Create a new catalogue product with the necessary details.

If the instruction is ambiguous, ask the user to choose.

Do not invent selling prices, purchase costs, GST classifications, expiry dates, or suppliers.

## 9. UNIT CONVERSION

Support appropriate units such as:

- Piece
- Packet
- Box
- Kilogram
- Gram
- Litre
- Millilitre
- Dozen
- Metre

Convert units only when valid conversion rules exist for that product.

For example, converting boxes into packets requires a saved pack-size configuration.

Support decimal quantities safely.

Prevent zero, negative, invalid, or unreasonable quantities.

## 10. PREMIUM MOBILE UI/UX

Redesign the Inventory screen to include a clearly visible:

**Bolkar Stock Jodo**

action.

Create a polished microphone workflow with the following states:

- Ready
- Microphone Permission
- Listening
- Processing
- Matching Products
- Review
- Needs Clarification
- Saving
- Success
- Error

Use DukaanSet's existing brand identity:

- Deep Teal
- Mint
- Off-White
- Simple typography
- Responsive cards
- Clean icons
- Smooth, lightweight interactions

The experience must look and behave like a polished Android application.

Keep primary actions accessible with one hand.

Ensure microphone controls are clearly visible and recording can be stopped immediately.

Support accessible feedback and reduced-motion preferences.

## 11. EDITABLE VOICE REVIEW

Never automatically save stock after speech recognition.

Show a review screen containing:

- Matched product name
- Recognised quantity
- Unit
- Stock operation
- Any ambiguity or warning

Provide:

- Edit Quantity
- Change Product
- Remove Item
- Add Another Item
- Record Correction
- Confirm & Add Stock

Do not enable final confirmation for unresolved invalid rows.

If a user intentionally chooses to save only resolved rows, make that choice explicit.

## 12. REAL INVENTORY INTEGRATION

Integrate the feature with DukaanSet's existing inventory services and database.

On confirmation:

1. Authenticate the user.
2. Verify business membership.
3. Check inventory permissions.
4. Validate product IDs.
5. Validate quantities and units.
6. Create an inventory transaction.
7. Create stock movement records.
8. Update stock balances atomically.
9. Record the operation source as voice-assisted.
10. Write audit history.
11. Refresh dashboard and inventory data.
12. Return an accurate confirmation.

Use database transactions and idempotency protection to prevent partial or duplicate stock updates.

Do not create a second independent inventory system.

## 13. BUSINESS-SPECIFIC VOICE SUPPORT

Adapt voice inventory behaviour to the shop type.

**Grocery:** Packets, loose goods, expiry and batches.

**Hardware:** Pieces, boxes, metres and unit conversions.

**Vegetable:** Kilograms, grams, daily prices and wastage.

**Clothing:** Sizes, colours and product variants.

**Mobile Accessories:** Models, variants and warranty-related product attributes.

Use the existing business configuration engine.

## 14. SMART ADDITIONAL FEATURES

Implement these improvements where compatible with the existing architecture.

### A. Voice Entry History

Show recent voice-assisted stock entries with timestamps and stock movement references.

### B. Repeat Previous Entry

Allow a user to prepare a new entry from a previous stock-in transaction, then review and confirm it.

Never repeat stock updates automatically.

### C. Frequent Products

Prioritise commonly selected products in matching suggestions without bypassing ambiguity checks.

### D. Voice + Manual Hybrid Entry

Allow the shopkeeper to speak some items and manually add others in the same draft.

### E. Draft Recovery

If the network disconnects, preserve the draft safely where feasible.

Make it clear that unsaved stock has not been updated.

### F. Confirmation Summary

After successful saving, show:

- Products updated
- Total stock lines
- Quantities added
- Any items not saved
- Link to stock history

### G. Optional Spoken Feedback

Prepare the architecture for future text-to-speech feedback in supported languages.

Never use voice feedback as the only way to communicate important information.

## 15. SECURITY AND PRIVACY

Microphone activation must require deliberate user interaction.

Provide clear recording indicators and a Stop control.

Use secure transport and protected API credentials.

Do not retain raw audio unnecessarily.

If audio retention is required, obtain appropriate consent and implement retention and deletion controls.

Protect customer and merchant data.

Every stock operation must remain isolated to the authorised business.

## 16. DEMONSTRATION MODE

Create an isolated demo workspace using fictional business data.

Example business:

Sharma Kirana Store.

Preload sample products such as:

- Milk
- Dal
- Onion
- Potato
- Biscuit

Allow the presenter to demonstrate:

1. Opening Voice Stock Entry.
2. Speaking multiple products.
3. Viewing the transcript.
4. Reviewing matched products.
5. Correcting a quantity.
6. Resolving an ambiguous product.
7. Confirming stock.
8. Viewing updated quantities.
9. Viewing stock movement history.
10. Switching between English, Hindi, and Hinglish.

Provide a Reset Demo Data action.

If real microphone recognition is unavailable, offer a clearly labelled sample-command simulator. Do not represent it as live speech processing.

## 17. TESTING REQUIREMENTS

Test:

- English speech
- Hindi speech
- Hinglish speech
- Mixed-language phrases
- Multiple products
- Corrected quantities
- Missing information
- Product aliases
- Multiple matching products
- Unknown products
- Unit conversions
- Duplicate transcripts
- Recording interruptions
- Network failure
- Microphone permission denial
- Unsupported browsers
- Duplicate save requests
- Tenant isolation
- Accurate stock history
- Mobile layout
- Language switching
- Demo reset

Use automated tests for parsing, stock logic, permissions, and API behaviour.

Test real speech recognition separately with realistic shopkeeper utterances and supported mobile devices.

Never claim perfect voice recognition accuracy.

## 18. IMPLEMENTATION RULES

Inspect the existing project first.

Reuse existing components and services where practical.

Do not break current billing, customers, reports, inventory, or multi-business workflows.

Use maintainable TypeScript modules and structured API contracts.

Keep business logic out of presentation components.

Do not implement fake success states.

Do not silently update stock.

Do not expose speech-provider secrets in client code.

If any provider or external API is unavailable, document the integration requirements and its actual status.

## 19. FINAL ACCEPTANCE CRITERIA

Consider the feature complete only when:

- Voice recording works on supported devices.
- Multiple products can be extracted.
- Quantities and units can be normalised.
- Existing products can be matched.
- Ambiguous matches are handled safely.
- Missing details can be completed.
- Voice corrections update the draft correctly.
- All rows remain editable.
- The user confirms before saving.
- The real inventory database updates correctly.
- Stock movements are recorded.
- Dashboard totals refresh appropriately.
- Three-language display works.
- Mobile layouts are tested.
- Permission and failure cases are handled.
- Demo data remains isolated from real business data.
- Automated tests pass for core business logic.

Provide a clear report describing implemented functionality, test results, external integration requirements, limitations, and remaining work.

---

# FINAL PRODUCT VISION

**DukaanSet Voice Stock Entry**

Shopkeeper Bolega → AI Samjhega → Product Match Hoga → Quantity Check Hogi → User Confirm Karega → Stock Update Ho Jayega.

The experience should be simple enough for a shopkeeper with minimal technical knowledge.

Prioritise accuracy, speed, mobile usability, simple language, and reliable inventory records.

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET PROJECT.**
