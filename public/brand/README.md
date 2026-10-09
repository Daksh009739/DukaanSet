# DukaanSet brand assets

V8 original SVG concept: a geometric storefront roof, a D-shaped store edge and a connected check. The mark remains readable at small mobile sizes. No external illustrations, photos or competitor assets are used. See [brand usage](USAGE.md).

- `logo.svg`: primary horizontal lockup on light surfaces
- `logo-dark.svg`: inverted lockup for dark surfaces
- `logo-mono.svg`: monochrome lockup
- `symbol.svg`: compact square symbol
- `maskable.svg`: editable safe-zone master for the maskable PNG
- `icon-192.png`, `icon-512.png`, `maskable-512.png`: manifest assets rasterised from the SVG masters
- `splash.svg`: splash branding artwork; runtime splash behaviour is browser-dependent
- `/icon.svg`: favicon master
- `/social.svg`: editable original social artwork
- `invoice-logo.svg` / `invoice-logo.png`: print and PDF-compatible platform identity

Runtime logo identity is centralised in `src/components/brand.tsx`; CSS lives in `src/components/marketing.css`. SVG text remains editable and uses Manrope with an Arial fallback. The working brand has not received trademark or domain clearance.
