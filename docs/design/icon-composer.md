# Layer-by-Layer Icons with Icon Composer

## Context

Use this for app identity, layered app icons, Liquid Glass icon treatments, and Xcode icon integration. The output should include separately editable artwork, a layer manifest, appearance decisions, and a verified Icon Composer document when the tool is available.

Official sources checked 2026-09-10:

- [Icon Composer](https://developer.apple.com/icon-composer/)
- [Create an app icon in Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer)
- [App icon design guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Create icons with Icon Composer](https://developer.apple.com/videos/play/wwdc2025/361/)

## Pattern

### Make the layer plan first

Define the app’s recognizable symbol and a single visual idea. Separate the background, supporting shape, primary symbol, and optional accent. Use semantic names and stable ordering. For example, a reading app can use a background fill, a book silhouette, a page mark, and a small bookmark accent; each foreground shape remains editable independently.

Prefer clean vector foregrounds. Use SVG or transparent PNG assets for import, exported on the same canvas so positions remain aligned. Keep text outlined. For raster art, retain transparent backgrounds around foreground artwork. Keep imported background art opaque and full bleed. Do not rasterize all pieces into one image.

A useful project handoff contains:

```text
IconLayers/
  01-base.svg
  02-symbol.svg
  03-accent.svg
  manifest.json
  README.md
```

These filenames are a recommended project convention, not an Apple file-format requirement. The CLI’s `--xcodegen` starter creates editable layers as a starting point; replace their shapes and colors for the actual brand.

### Compose and annotate

Launch Icon Composer from Xcode’s developer tools menu or the standalone app. Start a new document, choose the supported platforms, and set its background fill. Import foreground artwork, organize it into no more than four groups, and arrange depth from back to front. Use its material controls for highlights, refraction, translucency, and shadow rather than painting those effects into every asset.

Tune Default, Dark, and Mono appearances. Inspect at small sizes and against different surrounding backgrounds. Keep the silhouette recognizable when decorative detail disappears. Save the native `.icon` document, reopen it, and check that its layers and appearance settings remain editable.

### Integrate with the app

Add the saved icon document to the Xcode project and associate it with the app target’s icon setting. Build with the actual SDK and inspect the installed icon. Use Apple’s asset-catalog image-stack workflow for platforms whose icon format differs, including tvOS and visionOS; do not assume the same Composer workflow applies to every platform.

Export flattened images only for marketing, previews, or compatibility workflows that specifically require them. Retain the editable source and native document alongside those exports.

### What an agent must report

List the artwork files, layer ordering, appearance variants checked, native document path if created, and Xcode verification performed. If Icon Composer is unavailable, deliver the SVG/PNG layer pack plus import instructions and explicitly leave native `.icon` verification pending. Do not invent an undocumented `.icon` schema or rename a JSON file to make it appear native.

## Anti-Patterns

- One flattened image presented as a layered icon project.
- System shadows, corner masks, or highlights baked into foreground layers and then applied again by the compositor.
- A tiny detailed logo that loses its identity at home-screen size.
- A generic starter icon described as finished brand artwork.
- Claiming a native `.icon` file was verified without opening it in Icon Composer.
