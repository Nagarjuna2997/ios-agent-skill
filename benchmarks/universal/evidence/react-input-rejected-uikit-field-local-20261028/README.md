# Rejected UIKit field diagnostic — 2026-10-28

Isolated generated-project alternative using UIViewRepresentable/UITextField,
preferred body font, adjustsFontForContentSizeCategory, explicit accessibility
label, content insets and a line-height-based minimum 44-point height.
Production generator unchanged.

Xcode 27.0 / iOS 27 / iPhone 18 Pro, Large/light. Native compilation succeeded.
The selected accessibility test completed: 0 passed, 1 failed (Text clipped).
The wrapper reports xcodebuild exit 65; attachments were exported successfully.
This candidate is rejected. Interaction tests and XXXL were not run for this
variant, and no fidelity or baseline result is inferred. A failure with this
alternative does not by itself establish an Apple audit false positive.

The original xcresult remains at
`/tmp/universal-input-uikit-field-20261028/result.xcresult`; video omitted here.
