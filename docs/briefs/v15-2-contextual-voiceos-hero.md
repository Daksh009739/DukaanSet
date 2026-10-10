# DUKAANSET V15.2 — FINAL PREMIUM CONTEXTUAL VOICEOS HERO

## GLOBAL VOICEOS DISCOVERY BANNER — COMPLETE UI/UX & FUNCTIONAL IMPLEMENTATION

### PRODUCT

DukaanSet — Apni Dukaan, Sab Set.

### MAIN OBJECTIVE

Add a beautiful, ultra-modern, compact, context-aware VoiceOS Hero Banner at the top of all relevant authenticated DukaanSet pages.

The banner should instantly communicate:

**"Ab Ye Kaam Bolkar Bhi Kar Sakte Ho!"**

VoiceOS is the core pillar of DukaanSet. Every merchant should easily discover its capabilities while using the application.

The banner must be integrated with the existing Global VoiceOS, not implemented as a separate voice system.

---

# 1. DESIGN — EXACTLY MATCH APPROVED DASHBOARD

Use the approved DukaanSet premium design system.

Colours:

- Deep Teal: #103B36
- Mint: #22C99D
- Off-White: #F7FAF8
- Charcoal: #1A2624

Use:

- Beautiful typography
- Soft mint highlights
- Elegant borders
- Rounded corners
- Minimal premium illustrations/icons
- Subtle microphone animation
- Proper spacing
- Clean responsive layout

Do not use a massive hero section.

The banner should be approximately 80–120px tall on desktop where content fits naturally.

On mobile, adapt its height to content rather than clipping text.

The result should look like a native part of the approved DukaanSet application.

---

# 2. POSITION ON EVERY PAGE

Place the VoiceOS Hero just below the global topbar or page title, before the page's main content.

Show it on:

- Dashboard
- Customers
- Customer Details
- New Sale
- Bills
- Bill Details
- Stock
- Product Details
- Voice Stock Entry
- Purchases
- Purchase Details
- Suppliers
- Payments
- Expenses
- DemandPulse
- Reports
- Smart Shop Closing
- ProfitPilot AI
- Smart Reorder Planner
- Purchase Bill Intelligence
- What-If Simulator
- Smart Action Center
- Other applicable business pages

For detail pages, use a slimmer variation.

Do not show the banner in login, registration, printable reports, PDFs or unrelated public marketing screens.

On the approved Dashboard, integrate it without disrupting the approved visual composition; use an existing suitable region or a very compact integrated variation.

Avoid inserting two competing VoiceOS banners on a single page.

---

# 3. ONE REUSABLE COMPONENT

Build:

`ContextualVoiceOSHero`

Support variants:

- Default
- Compact
- Minimal

Use a central configuration driven by routes, page context and the actual VoiceOS action registry.

Do not hardcode separate duplicated components into every page.

The shared component must handle:

- Localization
- Page-specific content
- Current entity context
- Collapse preference
- Microphone launch
- Example command prefill
- Responsive rendering

---

# 4. DYNAMIC PAGE-WISE HEADINGS

The banner must automatically adapt to the current page.

### Dashboard

Heading:

**DukaanSet Se Pucho, Aaj Kya Chal Raha Hai!**

Examples:

"Aaj ki sale batao."

"Kaunse products low stock hain?"

### Customers

Heading:

**Customer Ka Kaam Ab Bolkar!**

Examples:

"Rahul naam ka customer add karo."

"Rahul ka pending paisa batao."

### New Sale / Bills

Heading:

**Bill Banana Ab Aur Bhi Easy!**

Examples:

"Rahul ko 10 kilo daal ka bill banao."

"Chetna ko 5 kilo aloo beche."

### Stock

Heading:

**Stock Add Karna? Bas Bolo!**

Examples:

"10 kilo daal stock mein add karo."

"20 packet Maggi stock mein jodo."

### Purchases

Heading:

**Purchase Ka Kaam Voice Se Karo!**

Examples:

"Gupta Traders se purchase draft banao."

"Pending purchase dikhao."

### Payments

Heading:

**Payment Record Karo, Bas Bolkar!**

Examples:

"Rahul ke ₹500 cash payment record karo."

"Customer pending payments dikhao."

### DemandPulse

Heading:

**Customer Ki Demand Bolkar Record Karo!**

Example:

"Blue Shirt XL ki 5 pieces demand record karo."

### Reports

Heading:

**Reports Chahiye? DukaanSet Se Pucho!**

Examples:

"Is mahine ki sale batao."

"Low stock report kholo."

### Smart Shop Closing

Heading:

**Aaj Ka Hisaab Bolkar Dekho!**

Examples:

"Aaj ka closing summary dikhao."

"Cash collection batao."

### ProfitPilot AI

Heading:

**Apne Business Ki Smart Advice Pucho!**

Example:

"Aaj kis cheez par dhyan dena hai?"

### Smart Reorder Planner

Heading:

**Kya Mangwana Hai? Bas Pucho!**

Example:

"Maggi ka kitna stock mangwana chahiye?"

### Purchase Bill Intelligence

Heading:

**Supplier Bill Scan Karna Ab Easy!**

Example:

"Supplier ka bill scan karna hai."

### What-If Simulator

Heading:

**Faisla Lene Se Pehle Hisaab Pucho!**

Example:

"Agar daal ₹60 mein kharidun aur ₹75 mein bechu toh?"

### Smart Action Center

Heading:

**Apne Pending Kaam Bolkar Dekho!**

Example:

"Mere pending smart actions dikhao."

Only advertise commands actually supported by the installed VoiceOS capabilities.

---

# 5. PREMIUM MICROPHONE ACTION

Each banner should have one primary CTA:

**Bolo Abhi**

The microphone button must:

1. Open the existing Global VoiceOS assistant.
2. Pass current page context.
3. Pass the active business.
4. Pass the selected entity where relevant and permitted.
5. Keep the existing VoiceOS session rules.
6. Allow speaking or typing.

Do not create another transcription engine.

Do not add a second independent action parser.

Explicit spoken intent must override the current page.

---

# 6. CLICKABLE VOICE EXAMPLES

Show one or two examples in compact chips.

Clicking a chip must:

- Open the existing VoiceOS.
- Prefill the suggested command.
- Allow merchant review or editing.
- Follow the existing command-processing workflow.

Do not immediately execute state-changing commands.

Never create a sale, payment, purchase or stock movement merely because an example chip was clicked.

---

# 7. SMART CONTEXT AWARENESS — IMPORTANT RECOMMENDATION

Make examples more useful when the user opens an entity detail page.

### Example: Rahul Customer Profile

Suggested:

"Is customer ka pending paisa batao."

### Example: Daal Product Details

Suggested:

"Is product ke 10 kilo stock mein add karo."

### Example: Particular Invoice

Suggested:

"Is bill ka PDF kholo."

Resolve the referenced entity through secure page context.

Never insert customer names into product-title fields.

Never assume a product is the customer or vice versa.

Keep the global VoiceOS semantic entity separation rules intact.

---

# 8. SMART COLLAPSE AND VISIBILITY

Do not annoy users with an oversized banner on every visit.

Provide:

- Small collapse/dismiss icon.
- Persisted preference per user.
- Compact reminder state when collapsed.
- Easy reopening through the banner's compact control or global microphone.

Recommended behaviour:

New users see the full compact banner initially.

Frequent VoiceOS users may keep it collapsed.

Do not force-hide the banner automatically in the middle of a task.

Do not reset the preference on every page navigation.

Allow the merchant to reopen it.

---

# 9. MOBILE-FIRST PREMIUM DESIGN

On mobile:

- Compact heading
- One short example
- Clear microphone button
- Responsive spacing
- No giant artwork
- No horizontal scrolling
- No overlapping header controls
- No hidden primary action

Use meaningful touch targets and safe-area spacing.

Ensure the banner works on common Android screen widths from 320px upward.

Avoid making the merchant scroll through a large promotional area before reaching the actual page functionality.

---

# 10. MULTILINGUAL SUPPORT

Use the existing global DukaanSet language selector.

Support:

- English
- Hindi in Devanagari
- Hinglish in Roman script

Translate all:

- Headings
- Descriptions
- Example commands
- Buttons
- Tooltips
- Accessibility labels

Preserve user-created product and customer names.

Use the selected UI language, independently from microphone recognition language.

---

# 11. MY ADDITIONAL UX RECOMMENDATIONS

Implement these improvements:

### A. Make VoiceOS Feel Native

Use the same cards, colours, typography and microinteractions as the approved Dashboard.

### B. Keep It Short

The banner must explain a benefit in seconds.

Avoid three or four paragraphs of marketing text.

### C. Use Contextual Examples

A Stock page should never default to an irrelevant customer-payment example.

### D. Show Real Capabilities Only

Do not advertise commands that have no backend implementation.

### E. No Duplicate Assistants

Every button must open the same global VoiceOS action system.

### F. Preserve Page State

Opening VoiceOS must not wipe unsaved form data.

### G. Fast Loading

Do not cause new expensive AI calls every time a page renders just to populate the banner.

Use lightweight registered command examples.

### H. Accessibility

Support keyboard activation, focus indicators, readable contrast and reduced motion.

### I. Safe Confirmation

VoiceOS must continue to validate and confirm all financial, inventory and customer mutations before saving.

---

# 12. QUALITY ASSURANCE

Test:

- Banner placement across every supported route
- Correct page-specific heading
- Correct example commands
- Global microphone opening
- Example prefill
- Selected customer/product context
- No customer/product confusion
- Collapse and reopen
- Preference persistence
- English
- Hindi
- Hinglish
- Desktop
- Tablet
- Mobile
- Keyboard accessibility
- Reduced motion
- Existing form-state preservation
- No duplicate voice systems
- No accidental execution of state-changing actions

Capture screenshots and verify visual consistency with the approved DukaanSet theme.

---

# 13. FINAL ACCEPTANCE CRITERIA

The feature is complete only when:

1. Every supported main page has an appropriate contextual VoiceOS Hero.
2. The design looks premium and matches the approved Dashboard.
3. The banner is compact and does not obstruct primary page functionality.
4. The correct examples appear for each module.
5. The microphone opens the existing working VoiceOS.
6. Example chips safely prefill commands.
7. Current entity context is handled correctly.
8. User collapse preferences persist.
9. English, Hindi and Hinglish work.
10. Desktop and mobile layouts are polished.
11. Existing business operations remain unaffected.
12. No unsupported voice commands are advertised.
13. All relevant interactions and QA tests pass.

---

# FINAL EXECUTION DIRECTIVE

Implement a single reusable, premium Contextual VoiceOS Hero component throughout DukaanSet.

Preserve the approved Dashboard design.

Integrate every hero with the existing Global VoiceOS action engine.

Display page-specific, practical voice examples.

Make microphone interaction immediate and discoverable.

Provide compact, responsive, multilingual UI.

Allow collapsing without permanently losing access.

Do not duplicate voice architecture.

Do not execute financial or inventory actions without proper confirmation.

## FINAL PRODUCT EXPERIENCE

**Open Any Page → See What You Can Say → Tap Microphone → Speak → Review → Confirm → Done**

## FINAL PRODUCT MESSAGE

**"Har Page Par VoiceOS — Ab Kaam Karne Ke Liye Bas Bolo!"**

**BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY.**
