# App icon

Every app needs an icon before it can be installed on a device or submitted. This capability writes two editable SVG layers (`Resources/IconLayers/background.svg`, `foreground.svg`) and renders them, back to front over an opaque color, into a 1024 px RGB `AppIcon.appiconset` with the repository's existing offline renderer. The layers are excluded from the app build.

## Next steps for a real brand

1. Replace the layers with the brand artwork as square, self-contained SVG shapes (no text, images or external references).
2. For iOS 26 and later Liquid Glass icons, import the layers into Icon Composer and add the resulting `.icon` file to the target ([Icon Composer guide](../../docs/design/icon-composer.md)).
3. Keep the flat PNG as the fallback for earlier systems ([asset generation](../../docs/design/asset-generation.md)).

The generated artwork is a neutral placeholder derived from the bundle identifier, not a brand.
