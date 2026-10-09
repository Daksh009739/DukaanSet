# DukaanSet identity · V8

The original mark combines a geometric shop roof, the curved edge of a D and a connected check. The wordmark always reads **DukaanSet**. Assets are editable SVGs; no stock art or third-party brand marks are used.

Use `logo.svg` on light backgrounds, `logo-dark.svg` on deep teal and `logo-mono.svg` for single-colour printing. `symbol.svg` is the compact identity; `/icon.svg` is the favicon. Leave clear space equal to one quarter of the symbol width. Keep the symbol at least 24px on screen, preserve its proportions and do not add outlines or shadows inside the artwork.

The palette is deep teal `#103B36`, mint `#22C99D`, paper `#F7FAF8`, charcoal `#1A2624`, amber `#F5B942` and muted green grey `#E8EFEC`. Mint is an accent; use dark text on mint buttons. Amber identifies attention or outstanding amounts, with dark brown text. White and teal establish the major brand moments.

Manrope is the locally hosted interface and heading family; Noto Sans Devanagari provides Hindi. Hindi headings use relaxed line height and normal tracking. Headings use 650–700 weight; body text uses 400–500. Public containers max out at 1216px. Use the 8/16/24/40/64 spacing scale, 7/12/18px radii and the motion tokens in `src/components/brand-experience.css`. Responsive structure changes at 1100/1024/800/540/359px; the runtime header collapses at 1024px.

Motion communicates a state change, has a user control where time matters and stops for reduced-motion preferences. No continuous background animation or animation dependency is required. Public demo money is fictional and is never written to merchant records.

`invoice-logo.svg` and high-resolution transparent `invoice-logo.png` support PDF and print workflows. Merchant document branding continues to use the merchant's saved logo and issued identity; the redesign never substitutes the platform mark for a merchant's identity on an old invoice. PNG PWA assets are generated from the SVG masters; `maskable.svg` keeps the mark inside the safe zone.

The original source of truth is `src/components/brand.tsx`; regenerate masters if its paths change. Editable SVG wordmarks retain text; open them with Manrope or substitute the bundled font in a design editor before outlining for professional print production.
