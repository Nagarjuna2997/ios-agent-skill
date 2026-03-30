# Third-Party Animation Integration

Guide for integrating Lottie and Rive animation libraries into iOS projects, with SwiftUI wrappers and usage patterns.

---

## Lottie Integration

[Lottie](https://github.com/airbnb/lottie-ios) renders Adobe After Effects animations exported as JSON via the Bodymovin plugin. It is the industry standard for complex vector animations on iOS.

### Adding Lottie via SPM

In Xcode: File > Add Package Dependencies, then enter:

```
https://github.com/airbnb/lottie-ios.git
```

Select the `Lottie` library and add it to your target. Use the latest stable version (4.x+).

### UIKit: LottieAnimationView Basics

```swift
import Lottie

let animationView = LottieAnimationView(name: "loading") // Loads loading.json from bundle
animationView.contentMode = .scaleAspectFit
animationView.loopMode = .loop
animationView.animationSpeed = 1.0
animationView.frame = CGRect(x: 0, y: 0, width: 200, height: 200)
view.addSubview(animationView)
animationView.play()
```

### SwiftUI: UIViewRepresentable Wrapper

Lottie 4.x ships with a built-in `LottieView` for SwiftUI. If you need more control, build a custom wrapper:

```swift
import SwiftUI
import Lottie

struct LottieAnimationUIView: UIViewRepresentable {
    let animationName: String
    var loopMode: LottieLoopMode = .loop
    var animationSpeed: CGFloat = 1.0
    @Binding var isPlaying: Bool

    func makeUIView(context: Context) -> LottieAnimationView {
        let view = LottieAnimationView(name: animationName)
        view.contentMode = .scaleAspectFit
        view.loopMode = loopMode
        view.animationSpeed = animationSpeed
        return view
    }

    func updateUIView(_ uiView: LottieAnimationView, context: Context) {
        uiView.loopMode = loopMode
        uiView.animationSpeed = animationSpeed

        if isPlaying {
            if !uiView.isAnimationPlaying {
                uiView.play()
            }
        } else {
            uiView.pause()
        }
    }
}
```

### Complete SwiftUI LottieView Wrapper with Binding Controls

```swift
import SwiftUI
import Lottie

struct LottiePlayerView: UIViewRepresentable {
    let animationName: String
    var loopMode: LottieLoopMode = .loop
    var animationSpeed: CGFloat = 1.0
    @Binding var playbackState: PlaybackState

    enum PlaybackState {
        case playing
        case paused
        case stopped
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> LottieAnimationView {
        let animationView = LottieAnimationView(name: animationName)
        animationView.contentMode = .scaleAspectFit
        animationView.loopMode = loopMode
        animationView.animationSpeed = animationSpeed
        context.coordinator.animationView = animationView
        return animationView
    }

    func updateUIView(_ uiView: LottieAnimationView, context: Context) {
        uiView.loopMode = loopMode
        uiView.animationSpeed = animationSpeed

        switch playbackState {
        case .playing:
            if !uiView.isAnimationPlaying {
                uiView.play()
            }
        case .paused:
            uiView.pause()
        case .stopped:
            uiView.stop()
        }
    }

    class Coordinator {
        weak var animationView: LottieAnimationView?
    }
}

// Usage
struct LottieDemo: View {
    @State private var playbackState: LottiePlayerView.PlaybackState = .playing
    @State private var speed: CGFloat = 1.0

    var body: some View {
        VStack(spacing: 24) {
            LottiePlayerView(
                animationName: "confetti",
                loopMode: .loop,
                animationSpeed: speed,
                playbackState: $playbackState
            )
            .frame(width: 300, height: 300)

            HStack(spacing: 16) {
                Button("Play") { playbackState = .playing }
                    .buttonStyle(.borderedProminent)

                Button("Pause") { playbackState = .paused }
                    .buttonStyle(.bordered)

                Button("Stop") { playbackState = .stopped }
                    .buttonStyle(.bordered)
            }

            VStack {
                Text("Speed: \(speed, specifier: "%.1f")x")
                    .font(.subheadline)
                Slider(value: $speed, in: 0.1...3.0, step: 0.1)
            }
            .padding(.horizontal)
        }
        .padding()
    }
}
```

### Playing Specific Frame Ranges

```swift
import Lottie

// Play frames 0 through 60
let animationView = LottieAnimationView(name: "multiSection")
animationView.play(fromFrame: 0, toFrame: 60, loopMode: .playOnce)

// Play a named marker range (markers set in After Effects)
animationView.play(fromMarker: "start", toMarker: "end", loopMode: .loop)

// Jump to a specific progress (0.0 to 1.0)
animationView.currentProgress = 0.5
```

### Color Value Providers for Dynamic Theming

```swift
import Lottie

let animationView = LottieAnimationView(name: "icon")

// Override a specific color in the animation
let colorProvider = ColorValueProvider(UIColor.systemBlue.lottieColorValue)
animationView.setValueProvider(
    colorProvider,
    keypath: AnimationKeypath(keypath: "**.Fill 1.Color")
)

// Use a dynamic color block
let dynamicProvider = ColorValueProvider { _ in
    return UIColor.tintColor.lottieColorValue
}
animationView.setValueProvider(
    dynamicProvider,
    keypath: AnimationKeypath(keypath: "**.Stroke 1.Color")
)
```

---

## Rive Integration

[Rive](https://rive.app) is a real-time animation platform that supports state machines, making animations interactive and responsive to user input. Rive files are typically smaller than Lottie JSON.

### Adding Rive via SPM

In Xcode: File > Add Package Dependencies, then enter:

```
https://github.com/rive-app/rive-ios.git
```

Select the `RiveRuntime` library and add it to your target.

### RiveViewModel Basics

```swift
import RiveRuntime

// Load a .riv file from the bundle
let riveViewModel = RiveViewModel(fileName: "animated_icon")

// In UIKit
let riveView = riveViewModel.createRiveView()
view.addSubview(riveView)
```

### SwiftUI Integration

Rive provides a built-in SwiftUI view through `RiveViewModel`:

```swift
import SwiftUI
import RiveRuntime

struct RiveAnimationView: View {
    var viewModel = RiveViewModel(fileName: "loading_spinner")

    var body: some View {
        viewModel.view()
            .frame(width: 200, height: 200)
    }
}
```

### State Machines: Inputs, Triggers, Booleans, Numbers

Rive state machines let you control animation states through inputs defined in the Rive editor.

```swift
import SwiftUI
import RiveRuntime

struct RiveStateMachineDemo: View {
    var viewModel = RiveViewModel(fileName: "interactive_button", stateMachineName: "State Machine 1")

    var body: some View {
        VStack(spacing: 20) {
            viewModel.view()
                .frame(width: 300, height: 200)

            // Trigger a one-shot input
            Button("Fire Trigger") {
                viewModel.triggerInput("pressed")
            }

            // Toggle a boolean input
            Button("Toggle Hover") {
                viewModel.setInput("isHovered", value: true)
            }

            // Set a numeric input
            Button("Set Progress") {
                viewModel.setInput("progress", value: 0.75)
            }
        }
    }
}
```

### Artboard and Animation Selection

```swift
import RiveRuntime

// Select a specific artboard and animation
let viewModel = RiveViewModel(
    fileName: "multi_artboard",
    artboardName: "IconArtboard",
    animationName: "idle"
)

// Switch animation at runtime
viewModel.play(animationName: "active")
viewModel.pause()
viewModel.stop()
```

### Complete Interactive Rive Toggle Example

```swift
import SwiftUI
import RiveRuntime

struct RiveToggle: View {
    @State private var isOn = false
    var viewModel = RiveViewModel(fileName: "toggle_switch", stateMachineName: "Toggle Machine")

    var body: some View {
        VStack(spacing: 24) {
            viewModel.view()
                .frame(width: 120, height: 60)
                .onTapGesture {
                    isOn.toggle()
                    viewModel.setInput("isOn", value: isOn)
                }

            Text(isOn ? "Enabled" : "Disabled")
                .font(.headline)
                .foregroundStyle(isOn ? .green : .secondary)
        }
    }
}

// A more complete settings screen with Rive toggles
struct RiveSettingsView: View {
    @State private var notificationsOn = true
    @State private var darkModeOn = false

    var notificationsVM = RiveViewModel(fileName: "toggle_switch", stateMachineName: "Toggle Machine")
    var darkModeVM = RiveViewModel(fileName: "toggle_switch", stateMachineName: "Toggle Machine")

    var body: some View {
        NavigationStack {
            List {
                HStack {
                    Label("Notifications", systemImage: "bell.fill")
                    Spacer()
                    notificationsVM.view()
                        .frame(width: 60, height: 30)
                        .onTapGesture {
                            notificationsOn.toggle()
                            notificationsVM.setInput("isOn", value: notificationsOn)
                        }
                }

                HStack {
                    Label("Dark Mode", systemImage: "moon.fill")
                    Spacer()
                    darkModeVM.view()
                        .frame(width: 60, height: 30)
                        .onTapGesture {
                            darkModeOn.toggle()
                            darkModeVM.setInput("isOn", value: darkModeOn)
                        }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
```

---

## When to Use What

### Decision Table

| Use Case | Recommended | Why |
|----------|-------------|-----|
| Complex vector animations from After Effects | **Lottie** | Direct Bodymovin export, massive community library |
| One-shot success/error/loading animations | **Lottie** | Easy to drop in, many free animations on LottieFiles |
| Splash screen or onboarding animations | **Lottie** | Smooth, high-fidelity playback |
| Interactive toggles, buttons, switches | **Rive** | State machines handle input-driven transitions |
| Animations that respond to data (progress, score) | **Rive** | Number inputs drive animations smoothly |
| Character animations with multiple states | **Rive** | State machine graph handles complex state logic |
| Simple fade, scale, slide transitions | **Native SwiftUI** | No dependency needed, GPU-accelerated |
| Layout-driven animations (list reorder, insert/remove) | **Native SwiftUI** | Built-in transition and matchedGeometryEffect |
| Spring physics and gesture-driven animations | **Native SwiftUI** | UIViewPropertyAnimator or SwiftUI springs |
| Animated app icons or dynamic backgrounds | **Rive** | Tiny file size, runtime compositing |
| Accessibility-sensitive animations | **Native SwiftUI** | Respects Reduce Motion automatically |

### Summary Guidelines

**Choose Lottie when:**
- You have a designer using After Effects who exports via Bodymovin
- You need to drop in pre-made animations from LottieFiles.com
- The animation is purely visual (no user interaction controls it)
- You need frame-accurate playback of complex vector art
- File size is not a primary concern (Lottie JSON can be large)

**Choose Rive when:**
- Animations need to react to user input (taps, drags, state changes)
- You want a single file with multiple animation states and transitions
- File size matters (Rive binary format is typically 5-10x smaller than Lottie JSON)
- Your designer uses the Rive editor (not After Effects)
- You need runtime color/property changes without value providers

**Choose native SwiftUI/UIKit when:**
- Animations are tied to state changes (show/hide, expand/collapse)
- You need gesture-driven interactive animations
- The animation is simple (fade, scale, slide, spring)
- You want zero third-party dependencies
- You need full accessibility support (Reduce Motion, VoiceOver)
- Performance is critical (native animations use Core Animation directly)

### File Size Comparison

| Format | Typical Size | Notes |
|--------|-------------|-------|
| Lottie JSON | 10-500 KB | Can be compressed with dotLottie (.lottie) |
| Lottie dotLottie | 2-100 KB | Compressed format, supported in lottie-ios 4.x |
| Rive (.riv) | 2-50 KB | Binary format, very compact |
| Native code | 0 KB | No additional assets needed |

### Performance Characteristics

| Library | CPU Usage | GPU Usage | Memory | Best For |
|---------|-----------|-----------|--------|----------|
| Lottie (Main Thread) | Medium-High | Low | Medium | Simple animations |
| Lottie (Core Animation) | Low | Medium | Low | Complex looping animations |
| Rive | Low | Medium | Low | Interactive animations |
| Native SwiftUI | Very Low | Low | Very Low | UI transitions |
| Core Animation | Very Low | Medium | Low | Custom layer animations |

Lottie supports two rendering engines: the default Main Thread renderer and the Core Animation renderer. For looping animations, use Core Animation rendering (`LottieAnimationView.configuration = .init(renderingEngine: .coreAnimation)`) for better performance.
