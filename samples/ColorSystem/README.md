# Semantic color sample

The bundled preview is generated from a calm finance brief, using the local color engine. It is synthetic app data, not a copied product palette.

Run `swift test --package-path samples/ColorSystem` to validate the JSON and appearance contract. The SwiftUI/UIKit source is conditionally compiled on iOS. Add `Assets.xcassets` to the **app target** to run `ColorPreview`; the package's JSON resource is not a compiled color catalog. Inspect light/dark, Increase Contrast, Differentiate Without Color and large Dynamic Type. Build/typecheck evidence does not prove the rendered sample's visual quality.

To reproduce, build `mcp-server`, generate the preview with the inputs in `generate-preview.mjs`, and use the existing CLI asset transform. The script writes only this sample's palette JSON; catalog generation is a separate explicit command. Do not run it against a user's app without permission.

For native macOS previews, compile `Assets.xcassets` with `xcrun actool --platform macosx --minimum-deployment-target 13.0 --target-device mac --compile /path/ColorPreview.bundle`, add a standard bundle Info.plist, and run `swift samples/ColorSystem/render-preview.swift /path/ColorPreview.bundle /path/output`. The renderer resolves named colors under Aqua, Dark Aqua and their increased-contrast appearances. It does not verify iOS layout or VoiceOver.
