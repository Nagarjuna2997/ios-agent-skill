# Generate real asset catalogs

The CLI converts a strict JSON token file into a new `Assets.xcassets`. It runs
locally without Figma, a paid service, an AI model or an API key. This is an
implementation of the semantic color guidance in [design tokens](design-tokens.md),
not a parser for arbitrary Markdown or Swift examples.

From a source checkout:

```sh
npm ci --prefix cli
npm run build --prefix cli
node cli/dist/index.js assets --tokens tokens.json --output App/Assets.xcassets
```

The output parent directory must exist. An existing catalog is never overwritten;
generate a sibling catalog, review its diff, then merge the intended changes.
The combined package includes this CLI starting with ios-agent-mcp 2.7.0.
Run `npx -y ios-agent-mcp@latest assets --tokens tokens.json --output App/Assets.xcassets`
to use it without a source checkout.

```json
{
  "version": 1,
  "colors": {
    "AccentColor": {
      "light": "#2457DB",
      "dark": "#90B4FF",
      "highContrastLight": "#12358F",
      "highContrastDark": "#C7DAFF"
    }
  }
}
```

Names are ASCII identifiers, unique ignoring case; `AccentColor` is required.
All four appearances are required. Values are sRGB `#RRGGBB` or `#RRGGBBAA`.
There is no guessed dark-mode conversion. High contrast variants should be chosen
and contrast-tested against their actual background. The generator does not
certify contrast, layout accessibility or App Review acceptance.

New scaffolds include `App/design-tokens.json`, named `AccentColor`, `Background`
and `TextPrimary` sets. XcodeGen starters set the global accent to `AccentColor`.
Consume named assets with `Color("Background")` and `Color("TextPrimary")`.

## Icons without paid tools

`new MyApp --xcodegen` keeps the three editable SVG layers and also renders their
ordered composition as an opaque RGB 1024×1024 PNG in `AppIcon.appiconset`. Xcode
uses its single-size iOS icon entry. These are placeholder shapes; customize them
before distributing an app. The generator does not add a person's name or branding.

After editing the SVG paths in any text editor or a free vector editor, regenerate:

```sh
node cli/dist/index.js assets --tokens App/design-tokens.json \
  --output App/ReviewedAssets.xcassets \
  --icon-layers App/MyApp/IconLayers --icon-background '#2457DB'
```

The existing layer manifest specifies back-to-front order. Inputs are bounded to
16 square SVGs, each at most 1 MiB. Use paths and shapes; text, linked images,
external references and entities are rejected. Convert text to paths in your
editor. The rasterizer is [resvg-js](https://github.com/thx/resvg-js); the PNG encoder
is [pngjs](https://github.com/pngjs/pngjs). Their dependency licenses are retained.
No web upload or model call is involved.

A flattened PNG is not a native Liquid Glass icon. For that, import the separate
SVG layers into Apple's free Icon Composer, save the `.icon` document and validate
it in Xcode. This generator does **not** fabricate an undocumented `.icon` bundle.
See [Apple's Icon Composer workflow](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer).

## Optional Figma handoff

Use Figma's own integration to read variables if you already use it. Map semantic
color names and light/dark/high-contrast modes to the JSON fields above. Resolve
aliases to explicit sRGB hex values first. The same JSON can be authored by hand;
Figma and its MCP are optional. There is no maintained Figma parser here.

## Evidence and limits

The CLI tests verify schema rejection, appearance slots, alpha conversion,
non-overwrite behavior, ordered raster pixels, RGB output and 1024×1024 dimensions.
On macOS, generated colors and the iOS app-icon set were compiled using `xcrun
actool` against the installed simulator SDK. This does not verify a native `.icon`,
a full screenshot capture pipeline, symbol availability or visual accessibility.

Catalog format: [Apple named colors](https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/Named_Color.html)
and [appearance variants](https://developer.apple.com/documentation/uikit/providing-images-for-different-appearances).
