# Premium application header — 13 October 2026

The top bar now uses an emerald gradient, a translucent search surface with a keyboard-shortcut badge, compact notification/language controls and a mint profile tile. The profile control displays the authenticated user’s name and initials; the second line remains the actual active-shop selector. This replaces the duplicated shop name while retaining the existing account and shop-switching handlers.

Hover, keyboard focus and loading states are visible against the darker background. Dashboard and inner-page mobile layouts preserve their existing navigation, search and voice entry points. The language control uses a language icon rather than a country flag.

## Verification

- Two new browser scenarios passed across targeted runs: real-record keyboard search, updates, persisted language, account focus and active-shop switching; responsive dashboard/stock header controls.
- 36 browser layouts and 12 accessibility scans passed: English/Hindi/Hinglish on dashboard and stock pages at 320, 390, 768, 1100, 1440 and 1920 px.
- Protected shop-switching regression passed: saved local drafts, explicit unfinished-work decisions, atomic scope changes, failed/late requests and unauthenticated access remain protected. Its obsolete closing-strip locator now checks the visible open-session status.
- Production build, typecheck, lint and whitespace checks passed.
- Compiled header review: 36 layouts / 12 accessibility scans; no runtime errors or CSP violations, and unchanged invoices, payments, stock movements, products, purchases and expenses.

Screenshots and JSON results in this directory use an isolated fictional shop database. The user’s local demo was not reset. Automated checks do not establish complete manual accessibility or physical-device acceptance.

Reproduce in a disposable verification checkout:

```powershell
npm run test:e2e -- tests/e2e/application-header.spec.ts
npm run test:e2e -- tests/e2e/smart-sidebar.spec.ts --grep "shop switches protect"
npm run build
node scripts/qa/application-header-production.mjs
```
