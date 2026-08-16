# Splash Screens

## Context

Use this when the user asks for a splash screen, cinematic intro, logo reveal, loading intro, first-run transition, or premium app opening.

iOS launch screens are system-controlled and should stay static, fast, and faithful to the first app frame. Put the animation after launch, inside the app, where SwiftUI can respect accessibility settings and transition into real content.

```text
LaunchScreen -> AnimatedSplashView -> MainAppView
```

## Pattern

```swift
import SwiftUI

struct AppRootView: View {
    @State private var phase: LaunchPhase = .intro
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            switch phase {
            case .intro:
                AnimatedSplashView(reduceMotion: reduceMotion) {
                    withAnimation(reduceMotion ? nil : .smooth(duration: 0.45)) {
                        phase = .main
                    }
                }
                .transition(.opacity)

            case .main:
                MainAppView()
                    .transition(reduceMotion ? .opacity : .move(edge: .bottom).combined(with: .opacity))
            }
        }
    }
}

private enum LaunchPhase {
    case intro
    case main
}

struct AnimatedSplashView: View {
    let reduceMotion: Bool
    let onFinished: () -> Void

    @State private var isVisible = false

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.system(size: 56, weight: .semibold))
                .symbolRenderingMode(.hierarchical)
                .scaleEffect(reduceMotion ? 1 : (isVisible ? 1 : 0.82))
                .opacity(isVisible ? 1 : 0)

            Text("Nagara")
                .font(.largeTitle.bold())
                .opacity(isVisible ? 1 : 0)
        }
        .task {
            await playIntro()
        }
    }

    @MainActor
    private func playIntro() async {
        if reduceMotion {
            isVisible = true
            try? await Task.sleep(for: .milliseconds(300))
            onFinished()
            return
        }

        withAnimation(.spring(response: 0.55, dampingFraction: 0.78)) {
            isVisible = true
        }

        try? await Task.sleep(for: .milliseconds(900))
        onFinished()
    }
}
```

Keep `LaunchScreen.storyboard` or the launch screen asset simple: background color, logo, and layout matching the first rendered app frame. Do not run custom animation there.

## Variants

| Goal | Native tool |
|---|---|
| Logo reveal | `withAnimation`, `symbolEffect`, opacity/scale |
| Text reveal | `PhaseAnimator`, `TextRenderer`, staggered opacity |
| Spatial intro | `Model3D` or `RealityView` after launch |
| Particle intro | SwiftUI `Canvas` or Metal when GPU rendering is justified |
| Loading intro | Real loading state with timeout and retry, not a fake delay |

## Anti-Patterns

```swift
// WRONG: fake a long launch screen with blocking work.
Thread.sleep(forTimeInterval: 2.0)
```

```swift
// RIGHT: show a fast static launch screen, then animate after SwiftUI starts.
AppRootView()
```

```swift
// WRONG: large motion without checking Reduce Motion.
withAnimation(.bouncy(duration: 1.2)) {
    logoOffset = -300
}
```

```swift
// RIGHT: switch to opacity or no animation when Reduce Motion is enabled.
withAnimation(reduceMotion ? nil : .smooth(duration: 0.45)) {
    phase = .main
}
```

```swift
// WRONG: always delay entry even when the app is ready.
try? await Task.sleep(for: .seconds(3))
```

```swift
// RIGHT: finish when either the intro and required startup work are complete, or show a real loading state.
async let intro: Void = playMinimumIntro()
async let startup: Void = loadRequiredState()
_ = await (intro, startup)
```
