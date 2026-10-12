# Workspace dialogs and dashboard controls

The search, updates, dashboard date/weather controls and VoiceOS entry panel now share a restrained mint/teal palette, consistent rounded surfaces, clearer hierarchy and phone layouts. The existing merchant workflows remain the source of all actions and record counts.

- Search has a full-width focused field, one clear control, permission-aware quick links, grouped live product/customer/invoice results, loading and empty states, a result count, Ctrl/Cmd+K, and focus restoration after dismissal.
- Updates have live category counts, stock/payment/other filters, compact icon cards, direct record links, a fixed footer and an internally scrolling list. Closing notices and saved notification preferences are retained. The panel does not invent unread or dismissed state.
- Dashboard date, accounting date and weather use readable surfaces above the illustration. Missing-city setup links to shop settings for authorized users. The VoiceOS action has a clear label and short process hint.
- VoiceOS has a shop-scope pill, prominent microphone, responsive suggestion cards, focused text composer and review-before-saving hint. Speech capture, explicit financial confirmation, pending recovery and mobile stock save behavior use the existing implementations.

The display language remains available in the application header and account menu; the search and update dialogs omit the duplicate selector. English, Hindi and Hinglish include all new copy.

## Verification

The attached reports use isolated fictional shops. Browser checks exercise actual search navigation, category filtering, focus/keyboard dismissal, real read-only reports, unchanged financial/inventory records and three display languages. The compiled-production review verifies CSS ordering and captures the final desktop/phone screens. Existing VoiceOS, dashboard/weather and closing/detail tests cover the affected shared dialogs and merchant workflows.

All 13 focused/regression browser tests passed. The UI suite covers 60 layouts and 18 accessibility scans; the final compiled review covers 63 layouts and 27 accessibility scans with no runtime errors. Typecheck, source lint, 2,448-key locale parity and production build pass. The existing local app and health endpoint return HTTP 200.

See [browser layout report](browser-report.json), [compiled production report](production-report.json) and [check summary](checks.json). Weather readiness/failure states are simulated in the dashboard regression suite; the compiled review preserves the real unconfigured-weather response. These visual changes do not establish live microphone, AI-provider or hosted-deployment verification.

| Section | Desktop | Phone |
| --- | --- | --- |
| Search | [Screenshot](search-en-1440.png) | [Screenshot](search-en-390.png) |
| Updates | [Screenshot](updates-en-1440.png) | [Screenshot](updates-en-390.png) |
| VoiceOS | [Screenshot](voice-en-1440.png) | [Screenshot](voice-en-390.png) |
| Dashboard controls | [Screenshot](hero-en-1440.png) | [Screenshot](hero-en-390.png) |

The [earlier accounting date with ready weather](hero-accounting-ready-390.png) is a simulated layout case. Additional phone examples: [Hindi VoiceOS](voice-hi-390.png) and [Hinglish updates](updates-hinglish-390.png).
