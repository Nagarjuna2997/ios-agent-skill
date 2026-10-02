# Launch screen and animated splash

iOS shows the launch screen while the process starts; it must be static. This capability declares it in Info.plist (`UILaunchScreen` with `UIColorName` and `UIImageName`, no storyboard) and adds a SwiftUI `SplashContainer` that starts from the same picture and animates into the app, so the hand-off is seamless.

## Use

```swift
WindowGroup {
    SplashContainer {
        RootView()
    }
}
```

The generated `LaunchLogo` and `LaunchBackground` assets are placeholders derived from the bundle identifier. Replace `LaunchLogo` with the brand mark at 1x, 2x and 3x.

## Rules

- Keep the launch screen static and identical to the splash's first frame ([launch screen review](../../docs/tooling/launch-screen-review.md)).
- Keep the splash short and honor Reduce Motion ([animations](../../docs/swiftui/animations.md)); never block the app on a timer longer than the animation.
- A Lottie splash is an alternative (`lottie-animation`); the static launch screen is still required.
