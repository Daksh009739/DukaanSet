# DUKAANSET V16.1 — ULTIMATE PIXEL-FAITHFUL DASHBOARD IMPLEMENTATION

## FINAL APPROVED WEB + MOBILE DESIGN MASTER PROMPT

### EXACT REFERENCE REPLICATION • REAL FUNCTIONALITY • GLOBAL VOICEOS • LIVE DATE & WEATHER • PREMIUM RESPONSIVENESS • ZERO UNAPPROVED DESIGN CHANGES

---

# PROJECT INFORMATION

**Product Name:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Application:** Existing DukaanSet Multi-Business SaaS

**Reference:** Latest approved Desktop + Mobile Dashboard image attached with this prompt.

**Primary Goal:** Reproduce the approved design inside the EXISTING application as faithfully as technically possible, while retaining fully working business features and real dynamic data.

**Implementation Type:** Production-oriented frontend implementation and integration.

## THE MOST IMPORTANT INSTRUCTION

**THE DESIGN IS ALREADY APPROVED. DO NOT REDESIGN IT.**

The uploaded image is the final visual authority.

Your responsibility is to implement it, not reinterpret it.

Do not change the colour system, layout, hero placement, icons, sidebar appearance, microphone position or approved mobile composition.

Only make adaptations that are technically necessary for responsiveness, accessibility and real data while preserving the approved visual appearance.

---

# 1. YOUR ROLE

Act as a complete senior implementation team:

- Principal UI/UX Engineer
- Senior Product Designer
- React/Next.js Specialist
- Frontend Architect
- Responsive Design Engineer
- SaaS Application Architect
- Full-Stack Integration Engineer
- Accessibility Specialist
- Performance Engineer
- Visual Regression Engineer
- QA Automation Engineer

Work inside the existing DukaanSet repository.

Do not create a separate demonstration application.

Do not rebuild the entire backend.

Do not replace real components with static screenshot elements.

Do not deliver only JSX, mockup HTML or a nonfunctional prototype.

Implement the actual working Dashboard.

---

# 2. SOURCE OF TRUTH — APPROVED IMAGE

Before implementation:

1. Inspect the full uploaded image.
2. Identify its Desktop section.
3. Identify its Mobile section.
4. Determine the reference viewport dimensions or closest reproducible dimensions.
5. Analyse layout proportions.
6. Inspect colours, spacing and typography.
7. Identify all visible UI elements.
8. Locate existing matching assets in the repository.
9. Create a visual implementation checklist.
10. Start implementation only after the reference is understood.

### Design Reference Priority

1. Latest approved Desktop + Mobile image.
2. Existing approved DukaanSet logo and branding.
3. Current working business functionality.
4. Required responsive and accessibility behaviour.

When older screenshots conflict with the latest approved image, use the latest image.

### IMPORTANT

The current approved Desktop design uses a **LIGHT/WHITE SIDEBAR**.

Do not accidentally reintroduce the older dark teal sidebar.

The current approved Desktop VoiceOS control sits at the **TOP-RIGHT INSIDE THE HERO**.

Do not reintroduce the previously rejected large microphone bar in the centre of the Desktop hero.

---

# 3. STRICT VISUAL DESIGN LOCK

Preserve exactly as shown:

- Overall Desktop composition
- Overall Mobile composition
- Sidebar colour and width
- Sidebar branding
- Navigation icons
- Active navigation highlight
- Topbar height
- Search field
- Notification placement
- Profile section
- Hero background
- Greeting hierarchy
- Store name
- Calendar card
- Weather card
- Microphone placement
- Storefront illustration
- Quick-action cards
- Financial cards
- Charts
- Product list
- Bill list
- Low-stock alerts
- Mobile bottom navigation
- Rounded corners
- Card shadows
- Icon proportions
- Spacing hierarchy

Do not introduce decorative features that are absent from the approved image.

Do not add extra marketing banners.

Do not introduce unrelated gradients or animations.

Do not replace the approved design with a generic SaaS template.

---

# 4. EXACT BRAND DESIGN TOKENS

Use the approved visual colour system.

### Primary

Deep Teal: #103B36

Forest Teal: #062F29

Mint: #22C99D

Off-White: #F7FAF8

Charcoal: #1A2624

White: #FFFFFF

### Supporting Colours

Use the reference's restrained:

- Soft blue
- Soft green
- Light mint
- Light red
- Pastel orange
- Neutral grey

Do not over-saturate the interface.

### Typography

Match the image's overall typography closely.

Reuse existing app fonts where compatible.

Maintain:

- Strong headings
- Clear supporting descriptions
- Premium metric numerals
- Consistent button labels
- Readable table content
- Proper Hindi and Hinglish text rendering

Use central design tokens instead of scattered hardcoded values.

---

# 5. GLOBAL DESKTOP SIDEBAR

Implement the LIGHT premium sidebar shown in the latest reference.

### Branding

At the top:

DukaanSet logo

DukaanSet wordmark

Tagline:

Apni Dukaan, Sab Set.

Use the approved logo asset.

### Navigation

Display according to the approved reference:

- Dashboard
- New Sale
- Bills
- Products & Stock
- Customers
- Payments
- Purchases
- Suppliers
- Expenses
- DemandPulse
- Reports
- Shop Closing
- ProfitPilot AI
- Business Tools
- Settings

Use actual existing destinations.

### Visual Requirements

- Light sidebar
- Correct proportions
- Teal/mint icons
- Mint active selection
- Rounded active row
- Consistent indentation
- Clean hover behaviour
- Matching text weights
- Premium spacing

### Lower Area

Preserve the approved DukaanSet Pro card when the feature is applicable.

Do not fabricate subscription availability.

### RECOMMENDATION — NAVIGATION SAFETY

If some modules use different internal route names, keep the approved visual labels while mapping them to actual existing routes.

Do not modify backend route behaviour simply to match a label.

---

# 6. DESKTOP TOP NAVIGATION

Match the screenshot exactly.

### Search

Use the premium rounded search bar.

Suggested placeholder:

"Search customers, products, bills..."

Connect to the existing working Global Search.

### Right Controls

- Notifications
- User avatar
- Active business name
- Branch/business subtitle
- Account dropdown

Preserve proportions and alignment.

### IMPORTANT

Do not place the main large VoiceOS search pill in the Desktop topbar.

The primary Dashboard VoiceOS control belongs inside the hero, at the approved top-right position.

Keep existing globally accessible VoiceOS behaviour on other pages without duplicating the Dashboard's main control.

---

# 7. DESKTOP HERO — PRIMARY DESIGN PRIORITY

This is the most important visual area.

Reproduce the approved dark teal hero faithfully.

### HERO BACKGROUND

- Deep teal surface
- Subtle gradient depth
- Scenic landscape elements
- Decorative hills/clouds
- Warm storefront illustration
- Premium rounded outer container

Match the reference's visual hierarchy.

### HERO LEFT

Show:

- Greeting icon
- Good Morning / Afternoon / Evening
- Actual business name
- Small business dropdown where supported
- Short supporting line

Example content:

Good Morning!

Shivam Store

Aaj bhi ek shandaar din, apne business ke liye!

The actual implementation must use the merchant's selected language and authenticated business data.

Do not permanently hardcode Shivam Store.

### HERO UPPER MIDDLE

Date card.

### HERO UPPER MIDDLE-RIGHT

Weather card.

### HERO TOP-RIGHT

Compact white VoiceOS pill.

### HERO RIGHT

Approved shop illustration.

### HERO BOTTOM

Five white quick-action cards.

### STRICT

Do not move the VoiceOS pill into the centre.

Do not enlarge it beyond the reference's proportions.

Do not change the hero into a different split layout.

Do not create an additional second VoiceOS banner below the hero.

---

# 8. DESKTOP VOICEOS — EXACT PLACEMENT

Implement the approved compact white VoiceOS pill inside the hero's upper-right region.

### Style

- White background
- Rounded pill
- Deep teal microphone icon
- Text: Bolo DukaanSet...
- Small arrow
- Subtle premium shadow
- Clean compact proportions

### Functional Behaviour

On click:

Open the existing Global VoiceOS assistant.

Support:

- Speech
- Typed fallback
- Real action recognition
- Structured draft
- Clarification
- Confirm & Save

### Example

"Rahul ke naam se 10 kilo daal ka bill banao."

The assistant must distinguish:

Customer: Rahul

Product: Daal

Quantity: 10 kg

Do not create a product called Rahul Daal.

### Another Example

"10 kilo daal stock mein add karo."

The assistant must prepare an inventory stock addition, not a bill.

### CRITICAL

Do not build a duplicate microphone or voice-processing engine.

Reuse the existing Global VoiceOS service.

---

# 9. RECOMMENDATION — KEEP DESKTOP HERO VISUALLY BALANCED

The Desktop VoiceOS pill, date card and weather card should coexist without crowding.

Use a robust CSS grid or equivalent layout that preserves the approved element positions.

Avoid absolute positioning that breaks at nearby desktop widths.

The hero should retain:

- Clear greeting area
- Readable date/weather
- Small top-right microphone
- Visible store illustration
- Unobstructed background
- Fully visible quick actions

The appearance must match the reference while remaining structurally stable.

---

# 10. STOREFRONT ILLUSTRATION

Reuse the closest matching approved illustration asset.

Preserve:

- Small store building
- Green awning
- Warm interior lighting
- Trees
- Soft clouds
- Teal scenic background
- Right-side placement
- Reference scale

### Asset Rule

First search the existing repository for the original illustration.

If available, reuse it.

If unavailable, create a visually faithful original illustration.

Do not use an unrelated stock photo.

Do not use the entire Dashboard screenshot as one flattened background image.

All interactive controls must remain genuine UI components.

---

# 11. DATE CARD — LIVE AND ACCURATE

Show:

- Calendar icon
- Weekday
- Day
- Month
- Year

Use the active business timezone.

### Example

Sunday

11 October 2026

Actual runtime values must come from the current business date.

Never hardcode sample image dates.

### Recommendation

Use a central time/date utility consistent with Smart Shop Closing.

The displayed Dashboard date and the active business-day accounting policy must not contradict each other.

Handle locale-specific formatting.

---

# 12. WEATHER CARD — REAL INTEGRATION

Show:

- Temperature
- Weather icon
- Weather condition
- City

### Example

24°C

Sunny

Delhi

### Data Source

Use a real configured weather API.

Never invent weather values.

### LOCATION PRIORITY — RECOMMENDATION

1. Merchant-configured shop city/location.
2. Explicit city preference selected by the merchant.
3. Device location only after permission, if needed.

### Other Requirements

- Celsius by default for Indian users
- Show last updated time where useful
- Cache responses appropriately
- Refresh responsibly
- Correct loading state
- Neutral unavailable fallback
- No browser permission spam

### CRITICAL

Weather provider failure must never break the Dashboard.

Keep the card's visual dimensions stable during loading and errors.

---

# 13. DESKTOP QUICK ACTIONS

Reproduce the exact five quick-action cards along the bottom of the hero.

### Actions

1. New Sale
2. Add Product
3. Add Customer
4. Record Payment
5. Add Purchase

### Design

- White cards
- Correct reference width
- Rounded corners
- Circular icon background
- Heading
- Small subtitle
- Balanced spacing
- Subtle hover state

### Actual Functionality

New Sale → Existing billing workflow

Add Product → Existing product-creation workflow

Add Customer → Existing customer workflow

Record Payment → Existing payment workflow

Add Purchase → Existing purchase workflow

### Recommendation

Use route navigation or the existing working modal/sheet for the destination.

Do not invent separate quick-action forms that duplicate domain logic.

---

# 14. FINANCIAL SUMMARY — FOUR EXACT CARDS

Reproduce the approved cards beneath the hero.

### Card 1

Today's Sales

### Card 2

Total Bills

### Card 3

Cash Collected

### Card 4

Pending Udhaar

### Design Requirements

- Four-column desktop grid
- White cards
- Soft pastel icons
- Large financial values
- Compact supplementary information
- Small subtle trend visualisations when supported
- Consistent heights and gaps

### CRITICAL FINANCIAL RULES

Use real records.

Today's Sales is not the same as Cash Collected.

Pending Udhaar represents actual customer receivables under the established ledger definition.

Do not count supplier payables inside customer udhaar.

Do not invent percentage increases.

If historical comparison data is missing, omit the comparison instead of showing fake values.

---

# 15. SALES OVERVIEW

Reproduce the teal line/area chart shown in the approved reference.

### Visual Elements

- Sales Overview heading
- Last 7 Days filter
- Soft grid
- Teal trend line
- Subtle mint area fill
- Correct axis labels
- Rounded white container

### Real Data

Use actual sales records.

Support existing date-range controls.

Use correct business timezone.

Handle no data.

Avoid fabricating sales.

### Recommendation

The chart should show a clean zero-data experience for new shops.

Do not invent a healthy growth graph merely because the screenshot contains one.

---

# 16. TOP PRODUCTS

Reproduce the approved right-side Top Products panel.

Show:

- Product image
- Product name
- Sold quantity
- Sales value or actual supported metric
- Horizontal performance indicator

### PRODUCT IMAGES

Use the existing automatic product-image system.

Examples:

- Maggi → correct available Maggi asset
- Aloo → potato image
- Daal → suitable lentil image
- Coca-Cola → relevant branded package image

### IMPORTANT

Do not fetch external images every time the Dashboard renders.

Use stored approved product-media references.

Never show misleading product images when the match is uncertain.

Use a polished fallback.

---

# 17. RECENT BILLS

Reproduce the approved card layout.

Show:

- Invoice identifier
- Customer name
- Item count
- Invoice amount
- Payment status

Use compact rows.

Preserve the View All action.

Clicking an invoice must open the correct actual Bill Detail.

### Status Examples

- Paid
- Partially Paid
- Udhaar / Pending

Status must reflect real payment records.

---

# 18. LOW STOCK ALERT

Reproduce the approved Low Stock Alert panel.

Show:

- Product image
- Product name
- Remaining quantity
- Correct unit
- Low Stock status

Use actual configured thresholds.

Keep matching row heights, spacing and style.

### Important

Low-stock quantities must respect variants and inventory units.

Do not show a false alert because an image is missing.

Do not confuse stock-on-order with physically available stock.

---

# 19. EXACT MOBILE EXPERIENCE

Treat the mobile portion of the approved image as a separate visual reference.

Do not use a scaled desktop screenshot.

### MOBILE HEADER

Preserve:

- Dark teal background
- Menu icon
- DukaanSet logo
- Notification icon
- User avatar

### MOBILE HERO

Preserve:

- Good Morning greeting
- Business name
- Date
- Temperature
- Weather condition
- Store illustration
- Dark teal scenic background

### VOICEOS

Use a full-width white VoiceOS pill beneath the greeting/weather area.

This placement is specific to mobile.

### QUICK ACTIONS

Use the approved 3-column × 2-row quick-action grid.

Actions:

- New Sale
- Add Product
- Add Customer
- Record Payment
- Add Purchase
- More

### FINANCIAL CARDS

Use the approved 2 × 2 arrangement:

- Today's Sales
- Total Bills
- Cash Collected
- Pending Udhaar

### BELOW

Sales Overview and other relevant Dashboard content.

### BOTTOM NAVIGATION

- Home
- Sale
- Stock
- Customers
- More

Match the approved icon order and styling.

---

# 20. RECOMMENDATION — MOBILE VOICEOS SHOULD FEEL NATIVE

On mobile, tapping the white VoiceOS bar should open a polished bottom sheet or full-screen assistant, depending on the existing working design.

Maintain:

- Large microphone
- Clear listening indicator
- Transcript
- Editable draft
- Accessible Stop
- Sticky final Save
- Safe keyboard handling

Do not open a huge desktop-style modal inside a small mobile viewport.

Do not cover the bottom navigation improperly.

---

# 21. RESPONSIVE IMPLEMENTATION RULES

Test:

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

### Critical

The exact reference appearance is the target at matching reference viewports.

At other viewport widths, maintain the same design identity and approved hierarchy.

Avoid:

- Horizontal overflow
- Cut-off cards
- Overlapping weather elements
- Colliding microphone and illustration
- Cropped customer names
- Unreadable chart labels
- Hidden quick actions
- Broken Hindi typography

### RECOMMENDATION

Do not shrink everything proportionally.

Use purposeful responsive grid changes that preserve the approved Desktop and Mobile compositions.

---

# 22. RECOMMENDATION — ASSET-LEVEL FIDELITY

A common reason AI-generated implementations look different from approved images is mismatched assets.

Therefore:

- Identify exact icon sources.
- Reuse existing logo.
- Reuse approved illustration if available.
- Match thumbnail aspect ratios.
- Use correct icon stroke weights.
- Match approved font weights.
- Avoid substituting emojis for UI icons.
- Preserve visual alignment.

If a source asset is unavailable, document the replacement and evaluate its visual similarity.

Do not use random online assets just because they are easy to access.

---

# 23. RECOMMENDATION — COMPONENT ARCHITECTURE

Implement reusable components appropriate to the existing stack.

Suggested components:

- DashboardPage
- DashboardSidebar
- DashboardTopbar
- PremiumDashboardHero
- HeroGreeting
- HeroDateCard
- HeroWeatherCard
- HeroVoiceOSButton
- HeroQuickActions
- DashboardMetricCard
- SalesOverviewChart
- TopProductsPanel
- RecentBillsPanel
- LowStockPanel
- MobileDashboardHeader
- MobileQuickActions
- MobileBottomNavigation

Reuse existing components where their design and behaviour already match.

### Important

Do not create multiple sources of truth for financial data.

UI components must consume real domain services.

Keep view styling separate from financial calculations.

---

# 24. RECOMMENDATION — LOADING STATES MUST LOOK PREMIUM

The actual application will have loading periods.

Create skeletons that match the approved card shapes.

### Examples

- Hero date placeholder
- Weather-card skeleton
- Financial-card number skeleton
- Chart loading state
- Product-image placeholder
- Recent Bill rows

### Rules

Loading should not cause major layout shifts.

The hero height must remain stable.

Do not jump the VoiceOS button around while weather loads.

Do not show fake business numbers during loading.

---

# 25. RECOMMENDATION — MICROANIMATIONS WITHOUT VISUAL CHANGES

Use subtle, purposeful interactions:

- Button hover
- Navigation highlight transition
- Card focus
- VoiceOS microphone active pulse
- Chart tooltip
- Loading transitions
- Weather icon transition where appropriate

### Do Not

- Add heavy moving backgrounds
- Add random 3D animation
- Make cards bounce
- Add excessive glow
- Animate the entire hero continuously

Respect reduced-motion preferences.

The initial resting appearance must remain faithful to the screenshot.

---

# 26. DATA INTEGRITY AND AUTHENTICATION

All visible information must belong to the active authenticated business.

Use:

- Real user
- Real business
- Real sales
- Real customer records
- Real payments
- Real inventory
- Real bills
- Real product rankings
- Real low-stock information

Preserve:

- Role permissions
- Tenant isolation
- Existing session handling
- Financial integrity
- Inventory accuracy

### IMPORTANT

The screenshot uses sample data for visual demonstration.

Those names, values and dates must not become hardcoded production data.

Use clearly marked demo data only in the isolated demo workspace.

---

# 27. BUSINESS-DAY AND WEATHER ACCURACY

Use a common timezone-aware date utility.

Distinguish:

- Calendar date
- Business date
- Shop closing cutoff

### Example

A shop may close after midnight.

Dashboard operational information must follow the application's existing business-day rules.

Weather must follow the merchant-configured physical location, not necessarily the user's travel location.

Do not automatically use device location when the merchant already configured their shop city.

---

# 28. RECOMMENDATION — KEEP THE REST OF THE APPLICATION SAFE

The current task is implementation of the approved Dashboard design.

Do not unnecessarily redesign:

- Customers
- Bills
- Stock
- Purchases
- Payments
- DemandPulse
- Reports
- VoiceOS internals
- Intelligence Suite
- Settings

Preserve the premium shared design system and functionality.

Only modify shared components as required for the approved Dashboard implementation.

Avoid accidental changes to unrelated screens.

Any required shared-layout changes should be tested against other application routes.

---

# 29. VOICEOS CORRECTNESS CHECKS

Even though this task is visual, the approved VoiceOS action must remain functional.

Test commands:

### Sale

"Rahul ke naam se 10 kilo daal ka bill banao."

Expected:

Customer Rahul.

Product Daal.

Quantity 10 kg.

Missing financial information clarified.

### Stock

"10 kilo daal stock mein add karo."

Expected:

Inventory addition draft.

### Payment

"Rahul ke ₹500 cash payment record karo."

Expected:

Customer payment draft.

### Report

"Aaj ki sale batao."

Expected:

Read-only authoritative summary.

### IMPORTANT

Do not allow UI changes to break these existing flows.

---

# 30. EXACT SCREENSHOT COMPARISON PROCESS

This is mandatory.

### STEP 1

Render the implemented Desktop Dashboard at the reference viewport.

### STEP 2

Capture screenshot using the existing browser testing setup.

### STEP 3

Compare it with the Desktop portion of the approved image.

### STEP 4

Identify differences in:

- Sidebar width
- Topbar height
- Hero bounds
- Date card position
- Weather card position
- Microphone position
- Illustration size
- Quick-action row
- Metric cards
- Chart
- Tables
- Shadows
- Typography

### STEP 5

Fix meaningful differences.

### STEP 6

Repeat until fidelity is satisfactory.

### STEP 7

Repeat the same workflow for the Mobile reference.

### RECOMMENDATION

Use image overlays and visual-regression screenshots where available.

A pixel-difference score can assist review but should not be the only acceptance criterion because text rendering and dynamic data may differ.

Do not claim exact visual reproduction without actual screenshots.

---

# 31. FUNCTIONAL QA MATRIX

Verify:

### Desktop

- Sidebar routes
- Topbar search
- Notifications
- Profile menu
- Hero greeting
- Date
- Weather
- VoiceOS
- Quick actions
- Financial cards
- Chart controls
- Product rows
- Invoice links
- Low-stock links

### Mobile

- Menu
- Header
- Greeting
- Weather
- VoiceOS pill
- Quick actions
- Financial cards
- Sales chart
- Bottom navigation
- Scrolling
- Safe-area spacing

### Global

- English
- Hindi
- Hinglish
- Keyboard accessibility
- Screen-reader labels
- Reduced motion
- Correct business scope
- Data loading
- Network failures
- Responsive behaviour

---

# 32. ACCESSIBILITY

Preserve the approved appearance while implementing:

- Semantic HTML
- Keyboard accessibility
- Focus indicators
- Accessible microphone labels
- Image alt text
- Appropriate colour contrast
- Readable text
- Screen-reader-friendly statuses
- Proper button semantics
- Accessible mobile navigation

Do not make functionality inaccessible just to match the static image.

---

# 33. PERFORMANCE REQUIREMENTS

Optimise:

- Dashboard initial rendering
- Hero asset loading
- Illustration size
- Chart rendering
- Product-image loading
- Financial API requests
- Responsive layout calculations

Use:

- Appropriate caching
- Optimised images
- Lazy loading where appropriate
- Stable card dimensions
- Efficient backend queries
- Minimal unnecessary rerenders

### CRITICAL

Weather failure must not block financial data.

Product-image failure must not block the Dashboard.

VoiceOS provider initialization should not block hero rendering.

---

# 34. DEVELOPMENT AND STAGING WORKFLOW

Use the existing repository workflow.

feature/* → dev → main

### Tasks

1. Create an implementation branch.
2. Audit existing source.
3. Build visual changes.
4. Integrate real services.
5. Run lint.
6. Run type checks.
7. Run tests.
8. Capture Desktop screenshot.
9. Capture Mobile screenshot.
10. Compare reference.
11. Fix differences.
12. Test existing modules.
13. Verify staging where available.

Do not deploy directly to production without normal review.

Do not claim successful deployment if staging access is unavailable.

---

# 35. IMPLEMENTATION PHASES

## PHASE 1 — DESIGN REFERENCE ANALYSIS

Inspect reference image.

Record exact visual rules.

Locate source assets.

Lock visual requirements.

## PHASE 2 — GLOBAL APP SHELL

Implement:

- White desktop sidebar
- Premium desktop topbar
- Mobile header
- Mobile bottom navigation

Preserve actual routes.

## PHASE 3 — DESKTOP HERO

Implement:

- Dark teal hero
- Greeting
- Business name
- Date card
- Weather card
- Top-right VoiceOS
- Storefront illustration
- Five quick-action cards

Screenshot-review this phase before proceeding.

## PHASE 4 — MOBILE HERO

Implement the approved mobile layout.

Keep:

- Dark teal header
- Date/weather
- Illustration
- White VoiceOS pill
- Six quick actions

Screenshot-review before proceeding.

## PHASE 5 — DASHBOARD DATA PANELS

Implement:

- Four financial cards
- Sales Overview
- Top Products
- Recent Bills
- Low Stock Alert

Connect real services.

## PHASE 6 — FUNCTIONAL INTEGRATION

Connect:

- Global VoiceOS
- Search
- Weather
- Business date
- Notifications
- Quick actions
- Actual backend metrics
- Product images
- Navigation

## PHASE 7 — VISUAL REFINEMENT

Compare screenshots against the approved reference.

Fix differences.

## PHASE 8 — FINAL QA

Verify responsive widths.

Test functionality.

Check permissions.

Run regression tests.

Provide screenshots and implementation report.

---

# 36. STRICT PROHIBITIONS

DO NOT CHANGE THE APPROVED DESIGN.

DO NOT CREATE A NEW HERO CONCEPT.

DO NOT USE THE OLD DARK DESKTOP SIDEBAR.

DO NOT MOVE THE DESKTOP MICROPHONE TO THE CENTRE.

DO NOT TURN THE DESKTOP MICROPHONE INTO A LARGE SEARCH BAR.

DO NOT MOVE THE MOBILE MICROPHONE AWAY FROM ITS APPROVED WHITE PILL LOCATION.

DO NOT REMOVE DATE OR WEATHER.

DO NOT REPLACE THE STOREFRONT ILLUSTRATION WITH RANDOM PHOTOGRAPHY.

DO NOT CHANGE QUICK-ACTION COUNT OR ORDER.

DO NOT CHANGE FINANCIAL CARD ORDER.

DO NOT ADD NEW DASHBOARD SECTIONS.

DO NOT ADD A SECOND VOICEOS HERO.

DO NOT HARDCODE SAMPLE FINANCIAL DATA.

DO NOT INVENT WEATHER CONDITIONS.

DO NOT BREAK GLOBAL VOICEOS.

DO NOT BREAK EXISTING BUSINESS MODULES.

DO NOT SUBSTITUTE STATIC IMAGES FOR FUNCTIONAL UI.

DO NOT STOP AT A NONFUNCTIONAL DEMO.

DO NOT CLAIM PIXEL-PERFECT OUTPUT WITHOUT VISUAL REVIEW.

---

# 37. FINAL REQUIRED DELIVERABLES

Deliver:

1. Faithfully reproduced Desktop Dashboard.
2. Faithfully reproduced Mobile Dashboard.
3. Approved white Desktop sidebar.
4. Working navigation.
5. Premium topbar.
6. Exact Desktop hero composition.
7. Correct top-right Desktop VoiceOS pill.
8. Correct Mobile VoiceOS bar.
9. Correct greeting.
10. Actual business identity.
11. Live date.
12. Real weather integration where configured.
13. Faithful storefront illustration.
14. Five Desktop hero quick actions.
15. Six Mobile quick actions.
16. Four accurate financial cards.
17. Real Sales Overview.
18. Real Top Products.
19. Real Recent Bills.
20. Real Low Stock.
21. Actual product images or safe fallbacks.
22. Working mobile bottom navigation.
23. Responsive styles.
24. Premium loading skeletons.
25. Accessibility improvements.
26. Performance optimisation.
27. Functional backend integration.
28. Desktop reference comparison.
29. Mobile reference comparison.
30. Automated and browser tests.
31. Screenshots of actual implementation.
32. Final QA and limitations report.

---

# 38. FINAL ACCEPTANCE CRITERIA

The work is complete only when:

- The Desktop UI matches the latest approved reference closely.
- The Mobile UI matches the latest approved reference closely.
- The Desktop sidebar is the correct light design.
- The Desktop VoiceOS is at the exact intended top-right hero location.
- The Mobile VoiceOS appears as the approved white hero bar.
- Date and weather cards have the correct placement.
- Storefront illustration is faithful.
- Quick-action layouts are correct.
- Financial cards follow the approved order.
- Charts and lower panels preserve the approved composition.
- Visible controls are genuinely functional.
- Backend data is accurate.
- No financial figures are fabricated.
- Mobile navigation works.
- Existing VoiceOS commands still work.
- Existing application modules remain safe.
- No unapproved UI additions exist.
- All three display languages remain supported.
- Responsive testing passes.
- Actual implementation screenshots have been reviewed.
- Significant visual discrepancies have been fixed.
- Remaining unavoidable differences are clearly disclosed.

---

# 39. FINAL EXECUTION DIRECTIVE

You are implementing the FINAL APPROVED DukaanSet Dashboard.

The latest Desktop + Mobile screenshot is the visual source of truth.

Your job is to reproduce its appearance faithfully using real reusable UI components.

### DESKTOP MUST HAVE

- White sidebar
- Premium search topbar
- Dark teal scenic hero
- Left-side greeting
- Date and weather cards near top
- Compact VoiceOS pill at hero top-right
- Store illustration on right
- Five quick-action cards across hero bottom
- Four summary cards
- Sales Overview
- Top Products
- Recent Bills
- Low Stock Alert

### MOBILE MUST HAVE

- Dark teal header
- Greeting and business name
- Date/weather
- Store illustration
- Wide white VoiceOS bar
- Six quick actions
- 2 × 2 summary cards
- Sales Overview
- Five-item bottom navigation

### DO NOT

Reimagine the design.

Reposition the microphone.

Change the approved theme.

Introduce extra visual clutter.

Break working features.

Use fake backend responses.

### MANDATORY QUALITY APPROACH

Inspect Reference → Build Components → Connect Real Data → Capture Screenshots → Compare → Refine → Test → Deliver.

## FINAL PRODUCT STANDARD

**Exact Approved Visual Direction + Real Working Business Functionality + Premium Responsive Quality.**

## DUKAANSET PROMISE

**DukaanSet — Apni Dukaan, Sab Set.**

### START NOW

BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY.

DO NOT STOP AT PLANNING, STATIC MOCKUPS OR APPROXIMATE UI RECREATION.

PROVIDE THE ACTUAL IMPLEMENTED DESKTOP AND MOBILE SCREENSHOTS AND VERIFY THEM AGAINST THE APPROVED REFERENCE BEFORE MARKING THE TASK COMPLETE.
