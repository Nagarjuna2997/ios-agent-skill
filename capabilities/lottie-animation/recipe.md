# Lottie animation

`LoopingLottie` plays a bundled Lottie JSON file with the Lottie package (`lottie-spm`, product `Lottie`). The template includes `pulse.json`, a small sample animation, so the screen shows motion before a designer's file exists.

## Use

```swift
LoopingLottie(name: "pulse")
    .frame(width: 160, height: 160)
```

## Rules

From [third-party animations](../../docs/design/third-party-animations.md):

- Keep animation files small and bundled; do not download them at launch.
- Respect Reduce Motion: the template shows the first frame instead of playing.
- Use SwiftUI animations for simple state changes; Lottie is for designed, multi-layer motion.
- The package version is a `from` requirement; the first Mac verify run resolves and records it.
