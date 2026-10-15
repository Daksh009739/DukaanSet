Voice turns could remain open or lose finalized text, VoiceOS ignored the app's default language, and old report data could appear in a newer request. This change adds configurable automatic endpointing with unique final receipts, scopes asynchronous results to their command/user/shop, and reads a saved customer back before announcing success. Interim speech never commits a record; existing confirmation, tenant, permission, idempotency and atomic-ledger safeguards remain in use.

The assistant now has specific customer/bill previews and confirmation actions, a clear subtitle/status, minimize/settings controls and timestamped accessible history. The approved dashboard/sidebar are preserved, including the dashboard interaction polish already on this feature branch.

Validation: 316 unit/backend tests, 42 distinct browser scenarios across targeted suites, production build, 30 compiled responsive layouts/18 accessibility scans, semantic/language corpora, typecheck/lint and full locale parity. [QA report](docs/qa/voice31/REPORT.md) documents root causes, evidence and configuration.

Audio tests use simulated native callbacks and synthetic encoded audio with mocked provider responses and real database writes. Live human microphone/noisy-shop/Android/iOS/provider validation is pending configuration; this PR does not claim production audio sign-off or promote production domains.

This feature branch includes the existing sidebar/workspace baseline from PR #13 while targeting `dev`; review that dependency with the cumulative diff.
