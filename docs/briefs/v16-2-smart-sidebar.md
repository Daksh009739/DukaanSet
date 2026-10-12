# DUKAANSET V16.2 — ULTIMATE PREMIUM SMART SIDEBAR

## FINAL MASTER IMPLEMENTATION PROMPT
### PREMIUM DESIGN • COLLAPSIBLE NAVIGATION • MULTI-SHOP SWITCHER • MOBILE DRAWER • SMART BADGES • VOICEOS INTEGRATION • REAL BACKEND

---

# 0. PROJECT IDENTITY

**Product:** DukaanSet

**Tagline:** Apni Dukaan, Sab Set.

**Existing Application:** DukaanSet Multi-Business SaaS

**Feature:** Premium Smart Sidebar Navigation System

**Primary Visual Reference:** The latest approved DukaanSet Sidebar concept image attached with this prompt.

**Implementation Target:** The EXISTING DukaanSet repository.

## MAIN OBJECTIVE

Transform the current ordinary sidebar into a premium, modern, highly functional, responsive navigation system while preserving the approved DukaanSet Dashboard and all existing business functionality.

The provided design concept contains multiple presentations of the SAME sidebar system:

1. Collapsed Sidebar — Icon Only
2. Expanded Sidebar — Normal
3. Expanded Sidebar — With Shop Switcher Open
4. Mobile Sidebar — Drawer

These are not four separate sidebars to render together.

Implement them as states of ONE reusable global navigation component.

## ABSOLUTE RULE

**Do not redesign the approved Dashboard Hero, financial cards, Sales Overview or existing business modules.**

Only improve the global sidebar/navigation experience and its necessary layout integration.

---

# 1. YOUR ROLE

Act as:

- Principal SaaS UI/UX Designer
- Senior Product Designer
- Frontend Architect
- Senior React/Next.js Engineer
- Design System Engineer
- Interaction Designer
- Accessibility Engineer
- Multi-Tenant SaaS Architect
- Security Engineer
- Performance Engineer
- QA Automation Engineer

Inspect the existing codebase first.

Implement complete functionality, not a static sidebar mockup.

Use the project's existing framework, routing, state management, UI libraries and domain services.

Do not duplicate established business or authentication logic.

---

# 2. STRICT VISUAL REFERENCE

The uploaded latest Sidebar concept is the main visual authority.

Reproduce its distinctive:

- White premium sidebar surface
- DukaanSet storefront logo
- Clean typography
- Soft mint icon backgrounds
- Teal active navigation state
- Rounded menu items
- Subtle borders
- Modern navigation spacing
- Multi-Shop selector
- Elegant arrow/chevron controls
- Dark teal Pro upgrade card
- Bottom user profile
- Collapsed navigation rail
- Responsive mobile drawer

Maintain the existing brand:

Deep Teal: #103B36

Forest Teal: #062F29

Mint Green: #22C99D

Off-White: #F7FAF8

Charcoal: #1A2624

White: #FFFFFF

Use subtle supporting colours only for meaningful badge states.

Avoid unrelated redesigns.

---

# 3. FIRST — AUDIT THE EXISTING SIDEBAR

Inspect:

- Global AppShell
- Current Sidebar
- Header
- Mobile Navigation
- Route configuration
- Business context provider
- Business switching
- Authentication
- Roles and permissions
- Notifications
- Plan/subscription information
- VoiceOS launcher
- Language selector
- User profile dropdown
- Responsive layout styles

Identify existing components that can be reused.

Do not introduce a second competing navigation system.

Preserve working routes.

---

# 4. MAIN EXPANDED SIDEBAR

Implement the expanded sidebar matching the design concept.

## TOP BRAND SECTION

Display:

- Approved DukaanSet logo
- DukaanSet wordmark
- Brand tagline
- Sidebar collapse icon

The logo must be sharp and appropriately scaled.

Do not distort the wordmark.

Use approved brand assets.

## SIDEBAR WIDTH

Use a comfortable width consistent with the approved reference, approximately 260–300px as permitted by the actual dashboard layout.

Do not blindly increase the sidebar width to match an enlarged concept poster.

Maintain correct usable content width in the real application.

## COLLAPSE BUTTON

Place the collapse control near the brand header.

On click, switch to icon-only mode with a smooth animation.

---

# 5. COLLAPSED SIDEBAR — ICON ONLY

Implement a premium compact navigation rail.

## DESIGN

- White background
- Approximately 64–80px wide
- Centre-aligned icons
- Soft mint active icon surface
- Slim mint active indicator
- Consistent vertical spacing
- Brand icon at top
- User/avatar near bottom
- Expand control

## BEHAVIOUR

When collapsed:

- Hide navigation labels.
- Preserve icons.
- Keep every visible icon clickable.
- Provide accessible tooltips.
- Highlight the current route.
- Keep profile/settings access available.
- Preserve logical keyboard navigation.

## IMPORTANT

Do not leave invisible text occupying horizontal space.

Do not allow tooltips to be clipped by the sidebar container.

Do not cause the main Dashboard to overflow horizontally.

The expanded/collapsed state must update the AppShell layout correctly.

---

# 6. PERSIST USER SIDEBAR PREFERENCE

MY RECOMMENDATION:

Remember whether the user prefers expanded or collapsed navigation.

Use the application's existing user-preference mechanism or a suitable client-side preference.

### Requirements

- Restore preferred state on refresh.
- Do not flash an incorrect width unnecessarily.
- Respect responsive breakpoints.
- Do not treat mobile drawer visibility as the same persisted preference.
- Avoid resetting the preference on every route transition.

If preference synchronisation across devices is already supported, integrate with it.

Otherwise local persistence is acceptable.

---

# 7. PREMIUM MULTI-SHOP SWITCHER

This is an important advanced feature.

Directly below the brand header, create a premium active-business selector.

## COLLAPSED STATE

Show a compact current-business icon/avatar with an appropriate tooltip or accessible opening mechanism.

## EXPANDED STATE

Display:

- Actual active shop name
- Branch or location, if available
- Shop avatar/logo
- Dropdown indicator

Example:

Sharma Kirana Store

Main Branch • Delhi

Use actual authenticated business information.

## IMPORTANT

Do not permanently hardcode Sharma Kirana Store or any fictional shop shown in the reference.

---

# 8. SHOP SWITCHER DROPDOWN

Clicking the active shop should open a compact, polished dropdown or popover.

### TOP

Search field:

"Search shop or branch..."

### LIST

Display only businesses/branches accessible to the current user.

Each shop row may contain:

- Business avatar
- Shop name
- Branch/location
- Selection state
- Appropriate operational status when genuinely available

### SELECTED SHOP

Highlight the current business with mint background and checkmark.

### OPTIONAL ACTION

Add New Shop

Show only when the current user is authorised to create another business and the feature is actually supported.

## UI REQUIREMENTS

- Searchable when multiple shops exist
- Keyboard accessible
- Correct focus behaviour
- Proper dropdown positioning
- Scrollable shop list
- No overflow outside viewport
- Smooth open/close animation
- Appropriate loading state

---

# 9. CRITICAL MULTI-TENANT SHOP SWITCHING

Switching businesses must update the actual authenticated business context.

Do not merely change the displayed name.

### On Confirmed Switch

- Update active business reference.
- Refresh business-scoped queries.
- Refresh Dashboard data.
- Refresh Customers.
- Refresh Products/Stock.
- Refresh Bills.
- Refresh Purchases.
- Refresh Payments.
- Refresh Reports.
- Refresh business-specific notifications.
- Update VoiceOS active-business context.
- Update business permissions and feature entitlements.

### DATA SAFETY

Never show the previous shop's records under the new shop's identity.

Invalidate or separate business-scoped caches correctly.

### UNSAVED WORK

If a user has an unfinished sale, stock draft or financial form, warn before switching.

Do not silently discard important unsaved work.

Do not transfer a VoiceOS draft from one business to another.

Never silently commit a pending transaction during a shop switch.

---

# 10. STORE STATUS — NO FAKE ONLINE BADGES

The reference concept includes an Online status.

Implement status truthfully.

If the application has reliable store-session status, show an accurate label such as:

Store Open

Store Closed

If the application genuinely tracks connectivity/synchronisation, distinguish that from shop opening status.

Do not display "Online" simply because a user is logged in.

Do not invent physical store status.

If no relevant status service exists, omit the status rather than showing misleading information.

---

# 11. PREMIUM NAVIGATION ITEMS

Create a consistent navigation item component.

Each expanded item may contain:

- Icon
- Navigation label
- Optional real badge
- Optional submenu chevron

### DEFAULT STYLE

White/neutral surface.

Dark readable icon.

Simple text.

### HOVER STYLE

Soft mint/neutral background.

Subtle icon emphasis.

### ACTIVE STYLE

Mint-highlighted surface.

Strong label.

Deep teal icon.

Thin teal accent on the left.

### FOCUS STYLE

Visible keyboard focus.

### IMPORTANT

Avoid styling every item as a heavy card.

Reserve stronger backgrounds for hover and active states.

Keep the sidebar elegant, light and readable.

---

# 12. MENU ORDER AND STRUCTURE

Use the actual existing DukaanSet navigation.

Primary visible items:

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

Preserve authorised routes and access.

Do not silently delete modules because they are absent from the concept.

Do not invent separate pages that duplicate existing functionality.

---

# 13. MY RECOMMENDATION — SMART NAVIGATION GROUPING

The sidebar should remain simple even as DukaanSet grows.

Keep common workflows easy to access.

Use Business Tools as a grouping mechanism for specialised capabilities.

Potential Business Tools subitems, where actually implemented:

- Intelligence Suite
- Smart Reorder Planner
- Purchase Bill Intelligence
- What-If Simulator
- Smart Action Center
- Other approved secondary tools

### RULES

Do not add all these tools as additional permanent top-level navigation items.

Use a clean expandable submenu.

Keep the current route's parent group expanded when relevant.

Preserve a reasonable scroll position during route changes.

Support collapsing the group independently from collapsing the whole sidebar.

---

# 14. SMART BADGES — RELEVANT DATA ONLY

The visual concept shows examples such as:

- New
- 12
- 320
- AI
- Pro

Implement badges only when meaningful.

### Examples

Bills:

Show a count only if it represents a real, clearly defined actionable status.

Customers:

Do not show the total customer count permanently just for decoration.

DemandPulse:

Show a count of genuine pending demand tasks if useful.

ProfitPilot:

Use an AI label only when it accurately describes the implemented feature.

Pro:

Show premium status or locked-feature indicator according to actual entitlements.

### IMPORTANT

Never hardcode the screenshot's badge numbers.

Avoid more than one badge per ordinary navigation item.

Do not make every item look urgent.

---

# 15. ICON SYSTEM — PREMIUM CONSISTENCY

Use one consistent icon library or the project's approved icon assets.

Maintain:

- Consistent stroke width
- Consistent size
- Correct vertical alignment
- Consistent spacing
- Appropriate icon backgrounds

### Suggested Icon Mapping

Dashboard → Layout Dashboard

New Sale → Shopping Cart

Bills → Receipt

Products & Stock → Package

Customers → Users

Payments → Wallet

Purchases → Truck / Shopping Basket

Suppliers → Truck / Contact

Expenses → Receipt / Wallet

DemandPulse → Message / Activity

Reports → Chart

Shop Closing → Clock

ProfitPilot AI → Brain Circuit

Business Tools → Grid

Settings → Sliders

Use exact icons supported by the installed library.

Avoid mixing unrelated icon styles.

---

# 16. PREMIUM PRO UPGRADE CARD

Reproduce the premium lower-sidebar upgrade card.

### VISUAL STYLE

- Dark teal background
- Restrained emerald accents
- Crown icon
- Premium rounded corners
- Clear text
- Arrow action
- Subtle hover feedback

### CONTENT

DukaanSet Pro

"Unlock more business tools and insights."

### ACTION

Open the actual plan information or upgrade workflow.

### IMPORTANT

Do not claim that paid plans or checkout functionality are active if they are not.

If the current user already has the relevant entitlement, adapt the card or suppress the upsell appropriately.

Do not show a fake upgrade-success message.

---

# 17. USER PROFILE FOOTER

Add the premium profile section from the concept.

Show:

- User avatar or initials
- Actual display name
- Email or relevant account detail when appropriate
- More-menu control

### MENU

Include supported:

- My Profile
- Account Settings
- Switch Business, when relevant
- Help & Support
- Logout

### IMPORTANT

Use the authenticated user.

Do not hardcode demo account identities.

Logout must use the real secure authentication workflow.

The profile section must remain easy to reach.

---

# 18. MY RECOMMENDATION — PREVENT FOOTER OVERFLOW

The existing DukaanSet sidebar has many navigation items.

Do not make the entire expanded sidebar excessively tall just to match the long concept image.

Instead, divide it into:

1. Fixed brand header.
2. Fixed or appropriately positioned business switcher.
3. Independently scrollable navigation region.
4. Lower Pro/profile region.

On shorter laptop screens, the navigation list should scroll naturally.

Ensure Settings and all authorised links remain reachable.

Do not cover navigation items with the Pro card.

Do not create multiple confusing nested scrollbars.

---

# 19. MOBILE SIDEBAR — PREMIUM DRAWER

Implement the mobile version matching the latest concept.

### MOBILE HEADER

Show:

- DukaanSet logo
- Close button

### BUSINESS SELECTOR

Show active shop context.

Allow switching through the same real business-switcher logic.

### NAVIGATION

Display the authorised navigation items.

### FOOTER

Show:

- Optional Pro card
- User profile
- Settings/Logout access

### DRAWER BEHAVIOUR

- Opens from mobile navigation.
- Has a proper overlay.
- Closes on Escape.
- Closes on outside tap when appropriate.
- Closes after successful route navigation.
- Locks background page scrolling while open.
- Restores focus appropriately.
- Supports screen readers.

Do not render the desktop collapsed navigation rail behind the mobile drawer unnecessarily.

---

# 20. DESKTOP, TABLET AND MOBILE RULES

Recommended behaviour:

### Large Desktop

Expanded or user-selected collapsed sidebar.

### Medium Desktop / Tablet

Allow compact mode where space is limited.

### Mobile

Use the approved drawer pattern.

Respect existing mobile bottom navigation.

### TEST WIDTHS

320px

360px

375px

390px

412px

430px

768px

1024px

1280px

1440px

1920px

### IMPORTANT

Do not force the full expanded sidebar onto a small mobile viewport.

Do not create horizontal scrolling in the application.

Do not cover the approved Dashboard hero.

---

# 21. KEEP THE APPROVED DASHBOARD UNCHANGED

The previous DukaanSet Dashboard design is already approved.

Preserve its:

- White premium sidebar direction
- Topbar
- Dark teal scenic hero
- Greeting
- Date and weather
- Hero VoiceOS control
- Store illustration
- Quick actions
- Financial summary cards
- Sales chart
- Product sections
- Bills
- Low-stock information

This task upgrades global navigation only.

Do not modify the hero composition.

Do not reposition the VoiceOS microphone.

Do not change dashboard card dimensions unless a necessary responsive AppShell adjustment requires it.

---

# 22. GLOBAL VOICEOS INTEGRATION

VoiceOS is DukaanSet's core product pillar.

The sidebar must remain compatible with it.

### Optional Navigation Entry

If the existing app has a dedicated VoiceOS or DukaanSet AI destination, preserve its supported navigation route.

Do not insert redundant global VoiceOS buttons throughout the sidebar if the approved Dashboard and global shell already expose it.

### Shop Switching

When the active shop changes, VoiceOS must use the new business scope.

Do not let an unfinished financial voice draft execute in the wrong business.

### Navigation

VoiceOS should continue working across all authorised modules after sidebar changes.

---

# 23. MULTILINGUAL SUPPORT

Use the existing global localization engine.

Supported:

- English
- Hindi in Devanagari
- Hinglish in Roman script

Translate:

- Navigation labels
- Store selector
- Search placeholder
- Badge descriptions
- Upgrade card
- User menu
- Collapse/expand tooltips
- Mobile drawer labels
- Empty states
- Errors

### Important

Preserve proper script rendering.

Allow longer Hindi labels without clipping.

Do not change customer/shop names automatically.

Do not create a separate sidebar-only translation system.

---

# 24. PREMIUM MICROINTERACTIONS

Implement subtle, purposeful animations.

### Recommended

- Sidebar expand/collapse transition
- Active-item highlight
- Hover background transition
- Shop dropdown opening
- Chevron rotation
- Tooltip appearance
- Mobile drawer slide-in
- Profile-menu opening
- Pro-card hover
- Focus states

### Avoid

- Heavy 3D animations
- Aggressive glow
- Constant pulsing
- Dramatic zoom effects
- Unnecessary bouncing
- Long delays

Use restrained motion consistent with the approved DukaanSet design.

Respect reduced-motion settings.

---

# 25. MY RECOMMENDATION — SMART ACTIVE ROUTE BEHAVIOUR

When the merchant opens a page, show the correct active navigation state.

Examples:

`/app/customers` → Customers active

`/app/customers/[id]` → Customers active

`/app/stock` → Products & Stock active

`/app/stock/voice` → Products & Stock active

`/app/bills/[id]` → Bills active

`/app/purchases/[id]` → Purchases active

Use actual repository route patterns.

Do not use fragile string matching that highlights multiple unrelated menu items.

Nested Business Tools routes should highlight their parent group and relevant child.

---

# 26. MY RECOMMENDATION — ONE CENTRAL NAVIGATION REGISTRY

Do not define different navigation arrays independently for:

- Expanded sidebar
- Collapsed sidebar
- Mobile drawer

Create one typed, permission-aware navigation configuration.

Each entry should define:

- Stable ID
- Label translation key
- Icon
- Actual route
- Route-match rules
- Feature permission
- Optional submenu
- Optional badge provider
- Optional entitlement requirement

Render the same source through responsive variants.

This prevents missing routes and inconsistent labels.

---

# 27. PERMISSIONS AND PLAN ENTITLEMENTS

Respect actual user roles.

Examples:

Owner

Manager

Staff

### Requirements

Hide or appropriately disable navigation destinations the user is not authorised to access.

Do not rely only on frontend visibility for security.

The backend must enforce permissions.

### Pro Features

Use actual subscription or feature entitlement state where implemented.

Do not label features Pro only because the visual concept shows a Pro badge.

Do not falsely unlock restricted functionality.

---

# 28. PERFORMANCE

The Sidebar is present throughout the authenticated application.

It must be lightweight.

### Requirements

- Fast route transitions
- Efficient rendering
- No unnecessary backend requests
- Cached shop list when appropriate
- Efficient badge queries
- Minimal layout shifts
- Smooth collapse/expand
- No repeated icon-library loading
- Controlled dropdown rendering

### Important

Do not refetch the entire business list whenever a navigation item is hovered.

Do not allow a notification API failure to break the sidebar.

Use stable loading and fallback states.

---

# 29. ACCESSIBILITY

Implement:

- Semantic navigation
- Correct button elements
- Keyboard navigation
- Visible focus indicators
- Tooltips for collapsed icons
- Accessible submenu state
- Accessible drawer behaviour
- Focus trapping where required
- Escape-key handling
- Appropriate colour contrast
- Reduced motion
- Screen-reader-friendly labels

Avoid using only colour to indicate the active page.

Ensure every icon-only navigation control has an accessible name.

---

# 30. SECURITY AND MULTI-SHOP RELIABILITY

Multi-shop support is a security-sensitive workflow.

Test:

- Switching between businesses
- Restricted business access
- Expired sessions
- Missing business records
- Role changes
- Cached data isolation
- Pending transaction drafts
- VoiceOS context switching
- Business-specific notifications
- Business-specific reports

### Critical

The sidebar must never expose records or actions belonging to an unauthorised shop.

Do not trust business IDs provided only by the frontend.

All business-scoped requests must be validated server-side.

---

# 31. PREMIUM EMPTY AND ERROR STATES

### NO EXTRA SHOPS

Show the active shop without an unnecessary long switcher list.

### NO BUSINESS LOGO

Show a high-quality generated-initials or neutral shop avatar.

### SHOP LIST LOADING

Use a compact skeleton.

### SHOP SWITCH FAILED

Show a short, useful error.

Preserve the current active business.

### PROFILE DATA MISSING

Use a reasonable placeholder without inventing personal information.

### BADGE DATA UNAVAILABLE

Omit the badge.

Do not display arbitrary zeros or fake counts.

---

# 32. VISUAL IMPLEMENTATION CHECKLIST

Compare the rendered Sidebar against the uploaded concept.

Check:

- Logo size
- Sidebar width
- Header spacing
- Business-switcher position
- Icon container size
- Text alignment
- Active-state gradient/colour
- Badge dimensions
- Chevron alignment
- Menu row height
- Sidebar scrolling
- Pro card
- User footer
- Collapsed rail
- Mobile drawer

Do not declare visual completion merely because all menu labels are present.

---

# 33. FUNCTIONAL ACCEPTANCE TESTS

### Test A — Expanded Sidebar

All authorised navigation items visible and working.

### Test B — Collapsed Sidebar

Icons remain usable.

Tooltips work.

Active state remains clear.

### Test C — Preference Persistence

Collapsed state survives navigation and refresh.

### Test D — Shop Switcher

User can switch between authorised businesses.

Correct business records load.

### Test E — Tenant Isolation

No data from the previous shop remains exposed.

### Test F — Unsaved Work

Switching businesses with an active financial draft triggers appropriate protection.

### Test G — Mobile Drawer

Open, navigate, close and restore focus correctly.

### Test H — Business Tools

Submenu expands.

Correct child route highlights.

### Test I — Badges

Actual values render.

No hardcoded fake counts.

### Test J — User Profile

Menu opens.

Settings and Logout use real workflows.

### Test K — Upgrade Card

Opens a genuine relevant destination when configured.

### Test L — Languages

English, Hindi and Hinglish render correctly.

### Test M — VoiceOS

Existing Global VoiceOS remains functional after navigation and shop switching.

### Test N — Responsive

No overflow across required viewport sizes.

### Test O — Accessibility

Keyboard and screen-reader interactions remain usable.

---

# 34. IMPLEMENTATION PHASES

## PHASE 1 — CODEBASE AUDIT

Inspect existing sidebar, layout, routes, business context and permissions.

## PHASE 2 — DESIGN FOUNDATION

Create reusable navigation components and approved design tokens.

## PHASE 3 — EXPANDED SIDEBAR

Implement logo, nav rows, active states, badges, Pro card and profile.

## PHASE 4 — COLLAPSED SIDEBAR

Implement icon rail, tooltips, expand action and preference persistence.

## PHASE 5 — MULTI-SHOP SWITCHER

Implement searchable shop list, actual business switching and secure data refresh.

## PHASE 6 — MOBILE DRAWER

Implement the approved responsive mobile navigation.

## PHASE 7 — ADVANCED INTEGRATION

Connect:

- Real routes
- Permissions
- Business switching
- Dynamic badges
- User profile
- Pro entitlements
- Localization
- VoiceOS context

## PHASE 8 — QUALITY

Run automated tests.

Capture screenshots.

Compare against the design.

Fix visual differences.

Verify other application pages are unaffected.

---

# 35. CI/CD AND QA

Follow the existing DukaanSet workflow:

feature/* → dev → main

Run:

- Lint
- Type checking
- Component tests
- Route tests
- Business-switch tests
- Tenant-isolation tests
- Permissions tests
- Localization checks
- Responsive Playwright tests
- Keyboard accessibility tests
- Visual regression tests
- Build verification

Do not claim tests passed unless actually executed.

Verify staging where available.

Keep production business records isolated from test operations.

---

# 36. REQUIRED DELIVERABLES

Deliver:

1. Premium expanded sidebar.
2. Premium collapsed navigation rail.
3. Persistent collapse state.
4. Searchable Multi-Shop Switcher.
5. Actual shop switching.
6. Correct business-data refresh.
7. Business isolation safeguards.
8. Premium active-navigation styling.
9. Consistent icon containers.
10. Dynamic badge support.
11. Business Tools submenu.
12. Premium Pro card.
13. User profile footer.
14. Real profile dropdown.
15. Premium mobile drawer.
16. Keyboard and screen-reader accessibility.
17. English localization.
18. Hindi localization.
19. Hinglish localization.
20. VoiceOS context compatibility.
21. Responsive AppShell integration.
22. Loading and error states.
23. Performance improvements.
24. Automated tests.
25. Desktop expanded screenshot.
26. Desktop collapsed screenshot.
27. Shop-switcher screenshot.
28. Mobile drawer screenshot.
29. Final implementation and QA report.

---

# 37. FINAL ACCEPTANCE CRITERIA

Do not mark this feature complete until:

- Expanded Sidebar matches the approved premium concept.
- Collapsed Sidebar functions correctly.
- Current navigation item is accurately highlighted.
- Navigation routes work.
- Multi-Shop Switcher uses real authorised businesses.
- Switching businesses updates the actual application context.
- Business-scoped data is isolated.
- Unsaved transaction drafts are protected.
- Badge values are meaningful and accurate.
- Business Tools expands correctly.
- Pro card behaviour is truthful.
- User profile and logout work.
- Mobile drawer is responsive and accessible.
- Collapse preference persists.
- English, Hindi and Hinglish work.
- Global VoiceOS continues to work.
- Existing Dashboard Hero remains unchanged.
- No unrelated business page is broken.
- Visual screenshots are compared to the reference.
- Relevant automated tests pass.

---

# 38. STRICT NON-NEGOTIABLE RULES

DO NOT REDESIGN THE APPROVED DASHBOARD HERO.

DO NOT CHANGE THE APPROVED BRAND LOGO.

DO NOT CREATE FOUR SEPARATE SIDEBAR IMPLEMENTATIONS.

DO NOT HARDCODE DEMO SHOP NAMES.

DO NOT HARDCODE BADGE COUNTS.

DO NOT DISPLAY FAKE ONLINE STATUS.

DO NOT INTRODUCE DUPLICATE BUSINESS SWITCHERS WITH SEPARATE STATE.

DO NOT EXPOSE CROSS-BUSINESS DATA.

DO NOT DISCARD UNSAVED FINANCIAL WORK SILENTLY.

DO NOT CREATE DEAD NAVIGATION LINKS.

DO NOT FABRICATE PRO SUBSCRIPTIONS.

DO NOT BREAK GLOBAL VOICEOS.

DO NOT MAKE THE SIDEBAR IMPOSSIBLE TO SCROLL ON SMALL LAPTOP SCREENS.

DO NOT STOP AT A STATIC UI MOCKUP.

---

# 39. FINAL EXECUTION DIRECTIVE

Implement the ultimate premium DukaanSet Sidebar navigation system within the EXISTING application.

Use the uploaded reference image as the visual authority.

Create ONE responsive, reusable, permission-aware navigation architecture with:

- Expanded Desktop Sidebar
- Collapsed Icon-Only Sidebar
- Multi-Shop Switcher
- Mobile Drawer
- Smart Navigation
- Contextual Badges
- Premium Pro Card
- User Profile
- English/Hindi/Hinglish
- VoiceOS Compatibility
- Secure Multi-Business Behaviour

Maintain the approved white/mint sidebar aesthetic.

Preserve the existing Dashboard Hero, its microphone position, date/weather, charts and financial cards.

All visible functionality must connect to the actual application.

Use meaningful transitions and professional accessibility patterns.

### FINAL EXPERIENCE

**Merchant Opens DukaanSet**

↓

**Premium Sidebar Displays the Active Shop**

↓

**Merchant Navigates with Minimal Effort**

↓

**Can Collapse Sidebar When More Workspace Is Needed**

↓

**Can Securely Switch Between Shops**

↓

**All Modules Show Correct Business Data**

↓

**Global VoiceOS and Existing Workflows Continue Seamlessly**

## FINAL QUALITY STANDARD

**PREMIUM DESIGN + SIMPLE NAVIGATION + SECURE MULTI-SHOP WORKFLOWS + COMPLETE RESPONSIVENESS.**

## PRODUCT PROMISE

**DukaanSet — Apni Dukaan, Sab Set.**

### START IMPLEMENTATION

BEGIN IMPLEMENTATION IN THE EXISTING DUKAANSET REPOSITORY.

DO NOT STOP AT DESIGN MOCKUPS OR STATIC COMPONENTS.

VERIFY THE EXPANDED SIDEBAR, COLLAPSED SIDEBAR, SHOP SWITCHER AND MOBILE DRAWER AGAINST THE APPROVED REFERENCE BEFORE COMPLETION.
