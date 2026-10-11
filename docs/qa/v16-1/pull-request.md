The dashboard previously used a dark sidebar, a separate voice banner, different summary cards and extra session/work/AI panels. It now follows the approved desktop and phone composition: light desktop navigation, scenic teal hero with one VoiceOS pill, the existing quick-action workflows, four ordered metrics, an area chart and the products/bills/low-stock panels. Mobile uses the dark branded header, six actions, two-column metrics and five-item navigation.

Cash Collected reads net cash receipts rather than cash plus UPI. Total Bills counts all non-cancelled invoices beyond the visible record limit. Calendar charts and accounting-session dates stay distinct. Optional shop weather uses a server-only key and saved location; errors or missing configuration leave a neutral card and never block business data. The shared VoiceOS engine and write confirmation paths stay connected.

The demo strip is removed from the application layout. Demo information, reset, closing-demo and shop registration controls remain in the account menu.

Assistant and Help remain accessible through Business Tools on desktop and More on mobile.

Validation: 259 unit tests, locale parity across English/Hindi/Hinglish, source lint/typecheck, semantic voice regression, production build, dashboard/action/weather checks, 30 multilingual viewport layouts with accessibility checks, and the existing module/closing/voice suites. Actual implementation screenshots and reference comparison are saved under `docs/qa/v16-1`.

Weather is currently unconfigured; provider-ready cases are mocked explicitly in tests. Product photos use stored associations or safe fallback icons. The scenic illustration follows the approved composition as original artwork. This PR targets `dev`; production follows the normal `dev` → `main` review.
