# Editable app icon template

An original MIT-licensed layer pack maintained in this repository. No Figma account is required. It is not a copy of Apple's template, a finished brand identity, or an Apple-approved icon.

Open `preview.html` locally to toggle layers, switch Default/Dark/Mono studies, and compare an approximate rounded-square or circular enclosure at large and small sizes. SVGs remain square, full-bleed and editable; preview masks are not exported into the artwork.

## Files and workflow

```text
default/ or dark/ or mono/
  background.svg -> symbol.svg -> accent.svg
  manifest.json (back-to-front layer order)
      -> existing assets CLI
      -> opaque 1024 PNG + iOS AppIcon.appiconset

Editable foreground SVGs
      -> Icon Composer import and appearance controls
      -> native .icon -> Xcode platform validation
```

Each study has its own compatible manifest. Edit the shapes/colors for your app. Keep common coordinates across layers. `mono/` is a grayscale design study, not an implementation of system tinting. `tokens.json` is a minimal four-appearance AccentColor input for the existing catalog generator.

## Generate an iOS/iPadOS catalog

From the repository root, with Node.js 20+:

```sh
npm ci --prefix cli
npm run build --prefix cli
node cli/dist/index.js assets \
  --tokens templates/app-icon/tokens.json \
  --icon-layers templates/app-icon/default \
  --output /tmp/MyIconAssets.xcassets
```

Choose a new output directory: the generator refuses to overwrite an existing catalog. After dependency installation, rendering runs locally without model calls. For other studies, substitute `dark` or `mono` and use a different output directory. Those separate exports are previews; the command does not automatically associate them as appearance variants in one catalog. Selectively merge assets into your app and verify its target's AppIcon setting.

## Native layered iOS/iPadOS/watchOS handoff

1. Create a document in Icon Composer and choose the relevant platforms.
2. Set the background fill to match the chosen background SVG, then import `symbol.svg` and `accent.svg` in that order.
3. Configure Default, Dark and Mono appearances using Composer's controls. Inspect each supported platform and small-size legibility. Its material effects are not baked into these flat SVGs.
4. Save and reopen a real `.icon` document. Add it to the app target and build with the intended Xcode SDK. Check installed icons in each appearance.

The CLI export above is an **iOS catalog**, not a watchOS catalog. The shared artwork can be a starting point for Watch in Composer; no native `.icon`, Watch app build, material effect or system-rendered appearance is claimed by this pack.

Sources: [Apple Icon Composer](https://developer.apple.com/icon-composer/) and [Apple's design resources](https://developer.apple.com/design/resources/). Apple resources retain their own terms; only this original pack is covered by the repository's MIT license.
