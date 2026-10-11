# Storefront logo usage

Use the light horizontal logo on white or pale surfaces, the dark variant on deep teal, and the square storefront icon in collapsed navigation, loading states, browser tabs and installed-app icons. Keep the supplied proportions; do not stretch the logo or place controls over it. Accessible link names come from the existing translated brand-home label.

The originals in sources/ are unchanged. Transparent cutouts were prepared using the built-in imagegen tool. The selected edits used these prompts:

> Edit the square DukaanSet icon: remove only the white exterior background and exterior glow; preserve the rounded square, storefront, gradients, door, awning, checkmark, geometry and interior colours; genuine transparent output, no redesign.

> Edit the horizontal DukaanSet logo: remove only the white background and large outer margins; preserve the exact storefront, letter shapes, kerning, spelling DukaanSet, dark teal Dukaan and mint Set; genuine transparent output, no redesign or retyping.

The dark wordmark uses an SVG colour filter over the same selected light artwork, preserving its alpha and geometry. Sharp produces the delivery sizes and formats. The source artwork is preserved for future design work. WebP logos keep page downloads small; larger PNGs are available for print and asset reuse.

The service worker's public cache version is bumped with this identity update so existing installations refresh their offline icon. It continues to cache only public offline assets; merchant records remain outside the cache.
