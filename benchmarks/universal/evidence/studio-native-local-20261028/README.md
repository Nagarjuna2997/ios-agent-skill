# Local Studio native capture — 2026-10-28

Real authenticated Studio HTTP import of the two-file `react-input-components` fixture, generation, selected-simulator build, launch, capture and editable ZIP export. Xcode 27.0 / iOS 27 / iPhone 18 Pro. No native helpers mocked. Browser import/generation/export is checked separately by `studio/check-universal-ui.mjs`.

Before: transport succeeded but visual inspection found a blank launch frame. After: a cancellable two-second settling delay produced the populated Walking profile screen. This fixed delay is not a readiness guarantee. Both original reports remain in their recorded local roots; archived reports omit unrelated simulator inventory.

The exported ZIP contains Swift sources, Xcode project/scheme, project.yml and resources. Tests were not run by this Studio smoke, and visual fidelity was not evaluated. Separate input benchmarks still fail placeholder-clipping accessibility checks. No baseline promoted.
