# V16.1 approved reference implementation checklist

Reference: owner's 1600×900 desktop/mobile composite, received 11 October 2026. Desktop occupies approximately x=0–1142; the phone content occupies approximately x=1180–1578, an effective 390px viewport. Compare the desktop at 1142×900 and the mobile at 390×844, with adaptations for actual labels/data.

- Light sidebar, approximately 204px at the desktop reference width; full approved logo; mint active row; 15 navigation items mapped to actual routes/permissions.
- Search/profile topbar approximately 66px high. Dashboard VoiceOS appears inside the hero, not in the topbar.
- Dark teal hero approximately 310px tall. Greeting/business left, date/weather near the upper middle, compact white microphone pill upper right. Scenic store on the right. Five equal quick-action cards along the bottom.
- Four compact white metrics in order: sales, bill count, cash collected, customer receivables. Values come from the current business's accounting service; no decorative fake comparisons.
- Area/line sales chart left and top products right; recent bills left and actual low-stock products right beneath them. No extra work/session/AI cards in the new dashboard composition.
- Mobile: dark header and hero, wide white voice pill, separate 3×2 action grid, 2×2 metric grid, compact line chart, five-item bottom navigation in the approved order.
- Keep the recently approved storefront logo. It takes precedence over the older bag logo visible in the composite.
- Existing native SVG scenery differs from the approved warm illustrated scene. Use an original imagegen scenic asset only; no screenshot flattening.
- Live timezone-aware date, separate accounting-session date when needed. Weather uses configured server provider and saved shop location, with stable unavailable/loading states and no device permission prompts.
- Three languages; keyboard focus; reduced motion; role gating; existing global search, notifications, profile, operations, business switching and shared VoiceOS.
- Capture actual desktop/mobile screenshots, inspect them against the supplied reference, refine material differences, test 10 widths in all three languages and other routes.
