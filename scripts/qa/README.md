# Local visual QA

These scripts reproduce the visual checks used during implementation. They use the project's Playwright and Axe dependencies, a running local app, and an isolated headless browser. App checks create a fictional demo session, set its language to English, and open forms or an unsent billing draft. They do not confirm invoices or purchases.

Start the app with `npm run dev`, then run the scripts from the repository root with Node 24:

```sh
node scripts/qa/marketing-review.cjs
node scripts/qa/marketing-details.cjs
node scripts/qa/app-review.cjs
node scripts/qa/app-short-phone.cjs
node scripts/qa/app-header.cjs
```

On Windows, Microsoft Edge is the default test browser. Other platforms use Playwright Chromium, which must already be installed. Set `DUKAANSET_QA_BROWSER=chrome`, `msedge`, or `chromium` to choose another installed browser. Set `DUKAANSET_QA_ORIGIN` to test a different local port; its default is `http://127.0.0.1:3000`. Remote origins are rejected because app checks create demo records.

Example in PowerShell:

```powershell
$env:DUKAANSET_QA_ORIGIN = 'http://127.0.0.1:3001'
$env:DUKAANSET_QA_BROWSER = 'msedge'
& 'C:\Program Files\nodejs\node.exe' scripts/qa/app-review.cjs
```

Screenshots and JSON reports are saved under `.local/visual-qa/<script-name>/`, which is ignored by Git. A script returns a nonzero exit code for failed Playwright assertions, reported accessibility violations, overflow, unexpected page status, or runtime page errors. Screenshots hide the Next.js developer indicator only.

Coverage:

- `marketing-review.cjs`: homepage at eight widths, navigation, category keyboard controls, language example, FAQ, accessibility, selected detail pages, and screenshots.
- `marketing-details.cjs`: six sample business previews at 320px, Hindi homepage, all 18 public detail pages, page metadata, accessibility, overflow, and a deliberate 404.
- `app-review.cjs`: 13 workspace pages at 320/390/1366px, billing add/review, four forms at 390px, accessibility, overflow, runtime errors, and screenshots.
- `app-short-phone.cjs`: four forms at 320×568 and 390×844, sticky action positioning, 25 Tab key presses per dialog, Escape, accessibility, and the mobile More menu.
- `app-header.cjs`: desktop/tablet/phone navigation visibility, dashboard accessibility, overflow, and final dashboard screenshots.

These are focused QA scripts, not the application's complete functional test suite. Browser emulation does not test physical phone keyboards or Safari. Axe results cover the configured WCAG rule tags and require human visual and keyboard review as well.
