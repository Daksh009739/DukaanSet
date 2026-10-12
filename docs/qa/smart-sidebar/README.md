# V16.2 smart sidebar review

The supplied Sidebar Design Showcase guides one shared navigation component and registry. Expanded navigation uses a white surface, mint active rows, consistent Lucide icons, the approved storefront identity, a real shop selector, a teal plan-information card and authenticated user footer. Desktop width is 264px (280px on larger screens); the persistent icon rail is 80px. Mobile uses a left Radix dialog drawer, while retaining the existing bottom navigation.

The navigation region scrolls independently of the brand, shop context and footer. Shop rows come from the authenticated session; only the current shop has available location and trading-session metadata. Other shops show their actual names and initials. No physical-store “Online” badge is inferred from connectivity. Demand badges count real ready follow-ups, and AI labels require the enabled assistant feature. There is no subscription-entitlement service in the existing application: the Pro card opens the actual pricing information and makes no checkout or paid-access claim.

Collapse preference is an account-specific cookie read by the authenticated server layout. Its value never affects authorization. All switch entry points use the existing application provider. The provider validates session membership, warns about registered unfinished work, blocks switching during writes, loads the authorized destination and commits its identity and records together. Failed loads preserve the original shop. A modal loading state prevents new edits while a destination is being fetched; Close, Escape or outside dismissal abort that read and keep the original shop. Mobile draft warnings appear above the navigation drawer. Sale, stock and conversational drafts retain their existing account/shop storage keys. Financial operation forms, editors, closing forms and pending request recovery register unfinished work. VoiceOS continues to remount and abort capture at the business boundary.

Business Tools contains the actual Today's Work, DukaanSet AI and Help routes. Its expansion is independent of the overall sidebar state; the current child opens its parent. Plan-specific routes are not invented. Backend membership and permission enforcement remain authoritative.

## Visual evidence

- [Expanded desktop](expanded-desktop.png)
- [Collapsed desktop](collapsed-desktop.png)
- [Shop switcher](shop-switcher.png)
- [English mobile drawer](mobile-drawer-en.png)
- [Hindi mobile drawer](mobile-drawer-hi.png)
- [Hinglish mobile drawer](mobile-drawer-hinglish.png)
- [Hindi expanded sidebar](expanded-hi.png)
- [Hinglish expanded sidebar](expanded-hinglish.png)
- [Compiled review results](review.json)
- [Compiled VoiceOS integration results](voice-integration-review.json)

The four states were visually compared with the reference. The final footer truncates long emails instead of widening the sidebar, and logo/collapse controls occupy separate layout cells. The mobile reference's lower links remain available by scrolling its navigation region. Real record names and missing location metadata explain differences from the illustrative shop photos and example branch labels. The dashboard hero, date/weather, charts, action positions and financial cards retain their approved implementation.

Compiled local production verification covers all 33 combinations of English, Hindi and Hinglish at 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1920px. Five WCAG A/AA scans have no violations; invoices, stock and payments are unchanged, and no browser runtime errors occurred. Test data is fictional and lives in an isolated database. This is local production-mode verification, not a claim that a hosted staging deployment is healthy.

## Repeatable checks

```sh
npm run typecheck
npm run lint
npm run test:locales
npm test
npm run test:e2e -- tests/e2e/smart-sidebar.spec.ts
npm run test:e2e -- tests/e2e/product.spec.ts
npm run test:e2e -- tests/e2e/approved-dashboard-v16.spec.ts
npm run test:e2e -- tests/e2e/voiceos.spec.ts
npm run test:e2e -- tests/e2e/v3-demand.spec.ts
npm run build
node scripts/qa/sidebar-production-review.mjs
```

The sidebar suite covers persisted server-rendered width, registry consistency, nested-route active state, keyboard tooltips, profile/plan routes, draft cancellation and restoration, failed switches, VoiceOS scoping, drawer Escape/focus/route closing, multilingual responsiveness and short-screen footer reachability. Quality CI retains all existing gates and adds sidebar browser/compiled checks. Its job timeout is 45 minutes to accommodate the added coverage and existing production request-budget pauses; application rate limits are unchanged.

Local validation passed type checking, lint, all 2,397 translation keys, 259 unit tests and 42 browser regressions across the sidebar, auth/inventory/sales, approved V16 dashboard, VoiceOS, DemandPulse roles, premium modules, contextual voice heroes and mobile sale recovery. The final switch and drawer checks additionally verified cancelled slow loads, warnings for edited closing cash without warning on saved defaults, and mobile draft confirmations above the drawer. The production build and the compiled review linked above passed on the final source. Existing mobile logout and compiled VoiceOS checks now use the profile footer and shared shop selector.

## Collapsed rail overlap fix

The desktop breakpoint inherited expanded padding inside the 80px rail, narrowing the active buttons. Compact padding now takes precedence, and the compact row selector targets the actual component hierarchy. The rail hides its native scrollbar while retaining wheel and keyboard scrolling. Expanded and mobile navigation keep their scrollbars.

The follow-up production build, type checking, lint and three existing navigation/drawer/module browser checks passed. [Six desktop layout checks](rail-overlap-review.json) cover 1280, 1440 and 1920px at 600 and 900px height: icons remain centered and inside their buttons, wheel scrolling works, Settings remains reachable by keyboard, and no browser runtime errors occur. The existing multilingual module audit now expands Business Tools before opening its child routes on desktop or mobile, matching the shared submenu. [Corrected rail screenshot](rail-overlap.png).
