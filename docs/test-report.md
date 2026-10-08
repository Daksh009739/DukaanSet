# DukaanSet delivery QA

Completed **9 October 2026** against the delivered local development slice. Environment: Windows, Node.js **24.18.0**, Next.js **16.4.0**, headless Microsoft Edge **154.0.4258.62**. Browser records were fictional, with a separate `.data/e2e.sqlite`; production smoke used `.data/prod-smoke.sqlite`. Private databases, sessions and traces are excluded from Git.

## Final commands and outcomes

| Command | Observed result |
| --- | --- |
| `npm run typecheck` | Passed, exit 0 |
| `npm test` | **26 passed**, zero failed/skipped |
| `npm run build` | Passed, exit 0; 28 static pages generated; runtime database tracing warning resolved |
| `npm run test:e2e` | **7 passed**, zero failed; final complete run took approximately 1.4 minutes |
| `npm run test:production` | **7 checks passed**, zero failed, against the local production bundle on port 3002 |

## Connected browser scenarios

1. Public routes, metadata and real 404 handling; homepage layouts from 320px to 1440px; selected automated WCAG rules.
2. Empty account onboarding, product/customer creation, a ₹1,000 invoice with ₹600 received, ₹400 repayment, stock deduction and persistence across refresh/logout/login.
3. Business selection, selecting the same business again, English/Hindi/Hinglish and document language, narrow layouts, mobile bill review and preservation through language changes.
4. A 0.500kg sale with exact rounding, full cancellation, one signed refund and restored inventory.
5. An expense and cash closing, retained closing after refresh, and rejection of another same-day financial entry.
6. Anonymous route/API rejection, independent demo tenants, cross-tenant 404 and foreign-origin mutation rejection.
7. Supplier creation, received purchase with ₹15 payable, matching inventory receipt, wastage movement and business JSON download without credential fields.

Backend/client tests additionally exercise rollback on shortage and cross-tenant lines, whole-piece constraints, idempotent replay and changed-payload rejection, oldest-first repayment/overpayment, cash/refund/purchase closing arithmetic, Asia/Kolkata midnight boundaries, secure cookies, normalized Host/Origin binding, isolated reconciled demo ledgers and database reopen persistence.

## Responsive, accessibility and visual review

An additional **62 Axe audits** of the application reported zero violations in the selected WCAG 2 A/AA and WCAG 2.2 AA rules. Thirteen app pages were inspected at 320, 390 and 1366px with no observed horizontal overflow or runtime page errors. Extra checks covered billing, four operation sheets, the More menu and header states. At 320×568, dialog actions stayed reachable, 25 successive Tab presses remained within each dialog, and Escape closed it.

Public review covered the homepage at 320/360/375/390/412/430/768/1366px, six category previews, menu/keyboard/FAQ behavior, Hindi and 18 detailed pages. The tested public accessibility scans had zero violations; real pages returned 200 and unknown public routes returned 404.

Evidence: [app report](qa/app-report.json), [short-phone report](qa/short-phone-report.json), [header report](qa/header-report.json), [marketing report](qa/marketing-report.json), [detail-page report](qa/public-details-report.json).

Original rendered screenshots use fictional demo records: [desktop dashboard](qa/dashboard-desktop.png), [mobile dashboard](qa/dashboard-mobile.png), [mobile billing](qa/billing-mobile.png), [homepage](qa/home-desktop.png). Screenshots are visual evidence; financial acceptance comes from the scenarios and assertions above.

Issues found and corrected during integration included the local Origin mismatch, repeated session fetching, same-business selection clearing the screen, language changes resetting billing steps, imprecise parsing of pasted whitespace, inaccessible select names, low-contrast text, clipped metric explanations and hidden mobile action icons. Final required checks above passed after the relevant fixes.

## Production and offline smoke

The production smoke verified homepage/assets, CSP and other response headers, anonymous `/app` redirection, session 401/no-store, actual controlling service-worker registration, and an offline navigation fallback. Cache Storage contained only six expected public offline/icon/manifest assets. API responses and authenticated HTML were excluded; an API request was unavailable offline. This is a narrow offline fallback, not offline billing or financial synchronization.

To reproduce after building, start a separate local server with `DATABASE_PATH` pointing to a disposable test database and `npm start -- --port 3002`, then run `npm run test:production`. An optional origin can be passed after `--`. Production authentication requires a reviewed HTTPS ingress; the smoke used an anonymous loopback context.

## Limits and remaining work

- Headless Edge and emulated viewports were tested. Physical phones, Android installation, Safari/iOS, real soft keyboards and assistive technology require follow-up.
- No production domain/HTTPS ingress, cloud deployment, merchant acceptance, throughput/load test, Core Web Vitals measurement or backup/restore drill was performed.
- PostgreSQL, forward migrations, granular staff permissions, account recovery, tax/GST, partial returns, supplier repayment and category depth remain staged work.
- AI, OCR/voice, automated messaging, verified payments and subscriptions are unavailable. Environment keys alone do not implement those adapters.

Full status and acceptance gates remain in [progress](progress.md), [requirements](requirements.md) and [deployment preparation](deployment.md). Automated scans are not a claim of complete accessibility conformance or commercial readiness.
