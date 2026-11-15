# Apple UI pack: design-to-code workflow

## 1. Select and inspect

Identify the app's purpose, platforms, minimum deployment target, navigation, data and states. Start with the [official resource index](resources.md) and [component map](components.md). Open the exact Apple kit or technology template and inspect the component, its variables, variants and source terms yourself. If you cannot access the file, report that; do not invent its measurements, names or appearance.

## 2. Translate into native UI

Choose native SwiftUI or UIKit controls first, using the relevant HIG for role and behavior. Use the project's own semantic color and typography tokens. The system controls respond to platform context; an illustration in a design file is not a runtime API or behavior specification. Use the [native gallery](../../../samples/IOSUIPack/README.md) for examples of common controls and interaction states, not as an exhaustive kit.

Respect the project's actual minimum OS and Xcode SDK. Check uncertain API names, signatures and availability in Xcode's documentation or SDK declarations; only use guarded newer APIs when the compiling SDK knows them, and provide an appropriate fallback. See the [compatibility matrix](../../compatibility-matrix.md) and [local Apple documentation](../../tooling/local-apple-documentation.md).

For Liquid Glass, use system controls where they already provide the intended behavior. Check both contrast and content legibility; use custom glass only where appropriate and guard each API by its own introduction version. The repository's [Liquid Glass guide](../liquid-glass-adoption.md) covers fallbacks and accessibility.

## 3. Design the whole experience

- Give each relevant screen populated, loading, empty and recoverable-error behavior; avoid presenting placeholder buttons as functioning integrations.
- Use accessible control labels, state and focus order; test VoiceOver, Dynamic Type, Increase Contrast and Reduce Motion.
- Test light and dark appearance, localizations and right-to-left layouts where supported, long text, keyboard input, compact/regular widths and iPad resizing.
- Verify permissions, privacy usage text, entitlements and separate extension targets for actual system integrations. Apple Pay, Sign in with Apple, widgets and Live Activities are not provided merely by the visual template.
- Use the system font and symbol APIs; check the relevant terms before downloading or exporting Apple-owned assets.

## 4. Verify and report

Build and run on the selected Xcode/SDK and the intended simulator or device. Capture and inspect the requested screens and states; exercise the actual interaction, accessibility and adaptation checks. Report the precise build, runtime and screenshot evidence, and label anything not checked. A link to Apple, source inspection, or a successful compile alone does not prove visual fidelity, accessibility or real-device behavior.
