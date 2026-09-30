# Apple design resources and iOS/iPadOS 27

Verified source links: September 29, 2026. Use this guide when selecting Apple UI kits, inspecting a Figma frame, or converting design variables to this repository's asset tokens.

## Verified resources

| Resource | Source | Verification scope |
|---|---|---|
| Apple Design Resources | https://developer.apple.com/design/resources/ | Apple lists the iOS/iPadOS 27 UI kit and app icon template. |
| iOS/iPadOS 27 UI kit | https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27 | Destination linked by Apple; component contents not inspected. |
| iOS/iPadOS/watchOS 27 app icon template | https://www.figma.com/community/file/1645923469870515372/app-icon-template-ios-ipados-and-watchos-27 | Destination linked by Apple; template contents not inspected. |
| Project-supplied Figma reference | https://www.figma.com/design/IvXuPG2VvzutOnfvKHXYOh/iOS-and-iPadOS-27--Community-?node-id=507-24683 | File key `IvXuPG2VvzutOnfvKHXYOh`, node `507:24683`. Figma denied design-context access during this pass. Ownership, version and component contents remain unverified. |

The project-supplied file is a separate URL from Apple's Community resource. Do not describe it as an inspected official kit or infer its provenance from its title. Apple’s resource page also links platform kits, fonts, SF Symbols, Icon Composer and device bezels; follow their individual source and usage terms. Repository MIT licensing does not relicense external resources.

## Design-to-project workflow

```text
Apple source / accessible Figma node
  -> inspect component variants and variables
  -> map semantic roles to project tokens
  -> preview light, dark and high-contrast assets
  -> generate Assets.xcassets with the existing CLI
  -> build in Xcode and verify Dynamic Type / VoiceOver / resizing
```

1. Open the exact component or frame. Read design context and inspect its screenshot before implementing. If access is denied, report the limitation; do not invent measurements, variable values or exports.
2. Prefer native SwiftUI/UIKit controls for system behavior. A UI-kit visual does not establish an API's availability or runtime behavior.
3. Map colors and typography into [design tokens](design-tokens.md) and the [color system](color-system.md). Preserve semantic roles and all appearance variants instead of scattering literal values.
4. Use the existing [asset generation workflow](asset-generation.md) for project catalogs and [Icon Composer guidance](icon-composer.md) for separately editable icon layers. A Figma template alone is not a validated native `.icon` bundle.
5. Verify the result with the installed SDK, screenshots, accessibility sizes, dark mode and resizable iPad layouts. Keep untested behaviors explicit.

## Free alternative

Figma is optional. Start from the repository's semantic tokens, native SwiftUI/UIKit controls and asset CLI. Build and inspect in Xcode Simulator on a Mac with Xcode. This workflow needs no paid design service or Figma access; see [asset generation](asset-generation.md). Read Apple's online HIG for platform guidance.

## Refresh procedure

Reopen Apple's resource page, record which kit links changed, and inspect only the components needed for the requested app. Preserve source provenance and per-resource dates. Do not mark all framework guides current because a design-kit version changed. For installed API documentation, see [Xcode documentation resources](../tooling/xcode-documentation-resources.md).
