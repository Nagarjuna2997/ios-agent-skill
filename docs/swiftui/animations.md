# SwiftUI Animations

Complete reference for implicit and explicit animations, transitions, matched geometry, phase animators, keyframe animators, and haptics.

---

## Implicit Animations (.animation modifier)

Attach an animation to a view that triggers whenever a tracked value changes.

```swift
struct ImplicitExample: View {
    @State private var isExpanded = false

    var body: some View {
        VStack {
            RoundedRectangle(cornerRadius: isExpanded ? 20 : 50)
                .fill(.blue)
                .frame(
                    width: isExpanded ? 300 : 100,
                    height: isExpanded ? 200 : 100
                )
                .animation(.easeInOut(duration: 0.4), value: isExpanded)

            Button("Toggle") { isExpanded.toggle() }
        }
    }
}
```

**Important:** Always use the `value:` parameter version. The parameterless `.animation(.easeInOut)` is deprecated and applies to all state changes, causing unexpected behavior.

---

## Explicit Animations (withAnimation)

Wrap state changes in `withAnimation` to animate all views affected by those changes.

```swift
struct ExplicitExample: View {
    @State private var offset: CGFloat = 0
    @State private var opacity: Double = 1
    @State private var scale: CGFloat = 1

    var body: some View {
        Circle()
            .fill(.blue)
            .frame(width: 80, height: 80)
            .offset(y: offset)
            .opacity(opacity)
            .scaleEffect(scale)

        Button("Animate") {
            withAnimation(.spring(duration: 0.6, bounce: 0.3)) {
                offset = offset == 0 ? -100 : 0
                opacity = opacity == 1 ? 0.5 : 1
                scale = scale == 1 ? 1.5 : 1
            }
        }
    }
}

// Async version
Button("Animate and Continue") {
    Task {
        await withAnimation(.easeInOut(duration: 0.5)) {
            showContent = true
        }.value
        // This runs after animation completes
        loadData()
    }
}
```

---

## Animation Types

### Built-in Animations

```swift
// Timing curves
.animation(.linear(duration: 0.3), value: trigger)
.animation(.easeIn(duration: 0.3), value: trigger)
.animation(.easeOut(duration: 0.3), value: trigger)
.animation(.easeInOut(duration: 0.3), value: trigger)

// Spring animations (iOS 17+ simplified)
.animation(.spring, value: trigger)                    // Default spring
.animation(.bouncy, value: trigger)                    // High bounce
.animation(.bouncy(duration: 0.5, extraBounce: 0.2), value: trigger)
.animation(.snappy, value: trigger)                    // Quick and snappy
.animation(.snappy(duration: 0.3, extraBounce: 0.1), value: trigger)
.animation(.smooth, value: trigger)                    // Smooth, no bounce
.animation(.smooth(duration: 0.4), value: trigger)

// Spring with full control
.animation(.spring(response: 0.5, dampingFraction: 0.7, blendDuration: 0), value: trigger)
.animation(.spring(duration: 0.5, bounce: 0.3), value: trigger)

// Interactive spring (no overshoot)
.animation(.interactiveSpring(response: 0.3, dampingFraction: 0.8), value: trigger)

// Custom timing curve
.animation(.timingCurve(0.2, 0.8, 0.2, 1.0, duration: 0.5), value: trigger)
```

### Animation Modifiers

```swift
// Delay
.animation(.easeInOut(duration: 0.5).delay(0.2), value: trigger)

// Repeat
.animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: trigger)
.animation(.linear(duration: 2).repeatCount(3, autoreverses: false), value: trigger)

// Speed
.animation(.spring.speed(2), value: trigger)

// Combine
.animation(
    .spring(duration: 0.6, bounce: 0.3)
    .delay(0.1)
    .speed(1.2),
    value: trigger
)
```

---

## Transitions

Transitions define how a view appears and disappears when inserted/removed from the hierarchy.

```swift
struct TransitionExample: View {
    @State private var showDetail = false

    var body: some View {
        VStack {
            if showDetail {
                DetailCard()
                    .transition(.opacity)                    // Fade
                    .transition(.slide)                      // Slide from leading
                    .transition(.scale)                      // Scale from center
                    .transition(.scale(scale: 0.5, anchor: .bottom))
                    .transition(.move(edge: .bottom))        // Slide from edge
                    .transition(.push(from: .bottom))        // Push (iOS 16+)
                    .transition(.offset(x: 0, y: 200))

                    // Combined
                    .transition(.opacity.combined(with: .scale))
                    .transition(.move(edge: .bottom).combined(with: .opacity))

                    // Asymmetric (different for insert vs remove)
                    .transition(.asymmetric(
                        insertion: .push(from: .trailing),
                        removal: .push(from: .leading)
                    ))
            }

            Button("Toggle") {
                withAnimation(.spring(duration: 0.5, bounce: 0.3)) {
                    showDetail.toggle()
                }
            }
        }
    }
}
```

### Custom Transitions

```swift
struct SlideAndFade: Transition {
    func body(content: Content, phase: TransitionPhase) -> some View {
        content
            .opacity(phase.isIdentity ? 1 : 0)
            .offset(y: phase.isIdentity ? 0 : 30)
            .scaleEffect(phase.isIdentity ? 1 : 0.95)
    }
}

extension AnyTransition {
    static var slideAndFade: AnyTransition {
        .modifier(
            active: SlideAndFadeModifier(opacity: 0, offset: 30),
            identity: SlideAndFadeModifier(opacity: 1, offset: 0)
        )
    }
}

struct SlideAndFadeModifier: ViewModifier {
    let opacity: Double
    let offset: CGFloat

    func body(content: Content) -> some View {
        content
            .opacity(opacity)
            .offset(y: offset)
    }
}
```

---

## matchedGeometryEffect

Creates hero animations between views that share an identity.

```swift
struct HeroAnimation: View {
    @Namespace private var animation
    @State private var isExpanded = false
    @State private var selectedItem: Item?

    var body: some View {
        ZStack {
            if let item = selectedItem {
                // Expanded view
                VStack {
                    Image(item.imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .matchedGeometryEffect(id: "image-\(item.id)", in: animation)
                        .frame(height: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 20))

                    Text(item.title)
                        .font(.title)
                        .matchedGeometryEffect(id: "title-\(item.id)", in: animation)

                    Text(item.description)
                        .padding()

                    Spacer()
                }
                .background(.background)
                .onTapGesture {
                    withAnimation(.spring(duration: 0.5, bounce: 0.2)) {
                        selectedItem = nil
                    }
                }
            } else {
                // Grid view
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))]) {
                        ForEach(items) { item in
                            VStack {
                                Image(item.imageName)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .matchedGeometryEffect(id: "image-\(item.id)", in: animation)
                                    .frame(height: 150)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))

                                Text(item.title)
                                    .font(.headline)
                                    .matchedGeometryEffect(id: "title-\(item.id)", in: animation)
                            }
                            .onTapGesture {
                                withAnimation(.spring(duration: 0.5, bounce: 0.2)) {
                                    selectedItem = item
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
        }
    }
}
```

**Key rules:**
- Both source and destination must be visible at transition time (use `ZStack` and conditional rendering).
- Use the same `id` and `Namespace` across both states.
- Only one view per `id` should be in the hierarchy at a time (use `isSource: false` if needed).

---

## PhaseAnimator (iOS 17+)

Cycles through a sequence of phases, applying different modifiers at each phase.

```swift
// Continuous animation
PhaseAnimator([false, true]) { phase in
    Image(systemName: "heart.fill")
        .font(.largeTitle)
        .foregroundStyle(.red)
        .scaleEffect(phase ? 1.2 : 1.0)
        .opacity(phase ? 1.0 : 0.7)
} animation: { phase in
    phase ? .easeIn(duration: 0.3) : .easeOut(duration: 0.5)
}

// Multi-phase animation
enum PulsePhase: CaseIterable {
    case initial, grow, shrink, fade

    var scale: CGFloat {
        switch self {
        case .initial: 1.0
        case .grow: 1.3
        case .shrink: 0.9
        case .fade: 1.0
        }
    }

    var opacity: Double {
        switch self {
        case .initial: 1.0
        case .grow: 0.8
        case .shrink: 0.6
        case .fade: 1.0
        }
    }
}

PhaseAnimator(PulsePhase.allCases) { phase in
    Circle()
        .fill(.blue)
        .frame(width: 100, height: 100)
        .scaleEffect(phase.scale)
        .opacity(phase.opacity)
} animation: { phase in
    switch phase {
    case .initial: .spring(duration: 0.3)
    case .grow: .easeOut(duration: 0.4)
    case .shrink: .easeIn(duration: 0.2)
    case .fade: .easeInOut(duration: 0.3)
    }
}

// Trigger-based (animates once when trigger changes)
@State private var triggerCount = 0

PhaseAnimator([0.0, 1.0], trigger: triggerCount) { scale in
    Image(systemName: "checkmark.circle.fill")
        .font(.system(size: 60))
        .scaleEffect(scale == 0 ? 0.5 : 1.0)
        .opacity(scale)
} animation: { _ in
    .spring(duration: 0.5, bounce: 0.4)
}

Button("Complete") { triggerCount += 1 }
```

---

## KeyframeAnimator (iOS 17+)

Define complex multi-property animations with precise timing using keyframe tracks.

```swift
struct BounceValues {
    var scale: CGFloat = 1.0
    var yOffset: CGFloat = 0
    var rotation: Angle = .zero
}

KeyframeAnimator(initialValue: BounceValues(), trigger: bounceCount) { values in
    Image(systemName: "star.fill")
        .font(.system(size: 60))
        .foregroundStyle(.yellow)
        .scaleEffect(values.scale)
        .offset(y: values.yOffset)
        .rotationEffect(values.rotation)
} keyframes: { _ in
    KeyframeTrack(\.scale) {
        SpringKeyframe(1.5, duration: 0.2)
        SpringKeyframe(0.8, duration: 0.15)
        SpringKeyframe(1.0, duration: 0.3)
    }

    KeyframeTrack(\.yOffset) {
        LinearKeyframe(-50, duration: 0.15)
        SpringKeyframe(0, duration: 0.4, spring: .bouncy)
    }

    KeyframeTrack(\.rotation) {
        LinearKeyframe(.degrees(0), duration: 0.1)
        CubicKeyframe(.degrees(15), duration: 0.15)
        CubicKeyframe(.degrees(-10), duration: 0.15)
        SpringKeyframe(.degrees(0), duration: 0.3)
    }
}
```

**Keyframe types:**
- `LinearKeyframe` -- constant speed between keyframes.
- `SpringKeyframe` -- spring dynamics to reach the value.
- `CubicKeyframe` -- cubic Bezier curve interpolation.
- `MoveKeyframe` -- instant jump to value (no interpolation).

---

## .contentTransition() (iOS 16+)

Animate text and numeric changes.

```swift
@State private var count = 0

Text("\(count)")
    .font(.largeTitle)
    .contentTransition(.numericText(countsDown: false))
    // The text morphs between numeric values

Button("Increment") {
    withAnimation(.snappy) {
        count += 1
    }
}

// Identity transition for text changes
Text(statusMessage)
    .contentTransition(.interpolate)  // Smooth morphing between text states
```

---

## .sensoryFeedback() (iOS 17+)

Trigger haptic feedback tied to state changes.

```swift
Button("Success") {
    showSuccess = true
}
.sensoryFeedback(.success, trigger: showSuccess)

Toggle("Setting", isOn: $isEnabled)
    .sensoryFeedback(.selection, trigger: isEnabled)

// Feedback types
.sensoryFeedback(.impact, trigger: value)           // Physical tap
.sensoryFeedback(.impact(weight: .heavy), trigger: value)
.sensoryFeedback(.impact(intensity: 0.8), trigger: value)
.sensoryFeedback(.selection, trigger: value)         // Light selection tick
.sensoryFeedback(.success, trigger: value)           // Success pattern
.sensoryFeedback(.warning, trigger: value)           // Warning pattern
.sensoryFeedback(.error, trigger: value)             // Error pattern
.sensoryFeedback(.increase, trigger: value)          // Value increasing
.sensoryFeedback(.decrease, trigger: value)          // Value decreasing

// Conditional feedback
.sensoryFeedback(.success, trigger: taskComplete) { oldValue, newValue in
    newValue == true  // Only trigger when becoming true
}
```

---

## Symbol Effects (iOS 17+)

Built-in animations for SF Symbols.

```swift
Image(systemName: "wifi")
    .symbolEffect(.variableColor.iterative)

Image(systemName: "bell")
    .symbolEffect(.bounce, value: notificationCount)

Image(systemName: "arrow.down.circle")
    .symbolEffect(.pulse, isActive: isDownloading)

Image(systemName: "checkmark.circle")
    .symbolEffect(.appear, isActive: showCheck)
    .symbolEffect(.disappear, isActive: hideCheck)

// Replace symbol with animation
Image(systemName: isPlaying ? "pause.fill" : "play.fill")
    .contentTransition(.symbolEffect(.replace))
```

---

## Transaction and Animation Completion

### Transaction

Override animations for specific state changes.

```swift
// Disable animation for specific change
var transaction = Transaction()
transaction.disablesAnimations = true
withTransaction(transaction) {
    showPanel = false
}

// Custom transaction
var transaction = Transaction(animation: .spring(duration: 0.3))
withTransaction(transaction) {
    selectedTab = .home
}

// Transaction modifier on a view
Text("No animation here")
    .transaction { transaction in
        transaction.animation = nil  // Suppress animations for this view
    }
```

### Animation Completion (iOS 17+)

```swift
withAnimation(.easeInOut(duration: 0.5)) {
    isVisible = true
} completion: {
    // Runs when animation finishes
    loadNextStep()
}
```

---

## Practical Animation Patterns

### Staggered List Animation

```swift
struct StaggeredList: View {
    @State private var items: [Item] = []
    @State private var visibleItems: Set<UUID> = []

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                    ItemRow(item: item)
                        .opacity(visibleItems.contains(item.id) ? 1 : 0)
                        .offset(y: visibleItems.contains(item.id) ? 0 : 20)
                        .onAppear {
                            withAnimation(.spring(duration: 0.4).delay(Double(index) * 0.05)) {
                                visibleItems.insert(item.id)
                            }
                        }
                }
            }
            .padding()
        }
    }
}
```

### Loading Shimmer

```swift
struct ShimmerView: View {
    @State private var phase: CGFloat = -1

    var body: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(.gray.opacity(0.3))
            .overlay {
                RoundedRectangle(cornerRadius: 8)
                    .fill(
                        LinearGradient(
                            colors: [.clear, .white.opacity(0.4), .clear],
                            startPoint: .init(x: phase, y: 0.5),
                            endPoint: .init(x: phase + 1, y: 0.5)
                        )
                    )
            }
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 2
                }
            }
    }
}
```

### Breathing / Pulsing Effect

```swift
struct PulsingDot: View {
    @State private var isPulsing = false

    var body: some View {
        Circle()
            .fill(.green)
            .frame(width: 12, height: 12)
            .overlay {
                Circle()
                    .stroke(.green, lineWidth: 2)
                    .scaleEffect(isPulsing ? 2.5 : 1)
                    .opacity(isPulsing ? 0 : 1)
            }
            .onAppear {
                withAnimation(.easeOut(duration: 1.5).repeatForever(autoreverses: false)) {
                    isPulsing = true
                }
            }
    }
}
```

---

## Performance Tips

1. Prefer `withAnimation` over `.animation(value:)` when only some state changes should animate.
2. Use `.drawingGroup()` on complex animated views to rasterize into a single Metal layer.
3. Avoid animating `GeometryReader` size changes -- they cause expensive relayouts.
4. Use `Animation.spring` over custom spring parameters when possible -- the system optimizes it.
5. Profile with Instruments (Core Animation template) to verify 60fps.
6. Reduce use of `blur` and `shadow` modifiers during active animations.

---

## iOS 17/18 Advanced Visual Effects

### visualEffect Modifier (iOS 17+)

The `.visualEffect` modifier lets you read a view's geometry proxy and apply visual transforms without triggering layout passes. Unlike `GeometryReader`, it never changes the size or position of the view in the layout -- it only applies render-time effects like scale, offset, rotation, opacity, and blur.

```swift
// Basic usage -- read size and position for visual-only transforms
Rectangle()
    .fill(.blue)
    .frame(width: 200, height: 200)
    .visualEffect { content, proxy in
        content
            .offset(y: proxy.frame(in: .global).minY * 0.1)
            .scaleEffect(proxy.size.width / 300)
    }
```

**When to use `visualEffect` instead of `GeometryReader`:**
- Parallax scrolling effects
- Scale or rotation based on scroll position
- Blur or opacity that depends on a view's position
- Any visual tweak that should not alter layout

#### Complete Parallax Scroll Example

```swift
struct ParallaxScrollView: View {
    let images = ["photo1", "photo2", "photo3", "photo4", "photo5"]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(images, id: \.self) { imageName in
                    ParallaxCard(imageName: imageName)
                }
            }
            .padding()
        }
    }
}

struct ParallaxCard: View {
    let imageName: String

    var body: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(.gray.opacity(0.2))
            .frame(height: 250)
            .overlay {
                Image(imageName)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(height: 300) // Slightly taller than container
                    .visualEffect { content, proxy in
                        let frame = proxy.frame(in: .scrollView(axis: .vertical))
                        let distance = min(0, frame.minY)
                        return content
                            .offset(y: -distance * 0.4)
                    }
            }
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(color: .black.opacity(0.15), radius: 10, y: 5)
    }
}
```

#### Position-Based Rotation and Scale

```swift
struct VisualEffectGallery: View {
    let colors: [Color] = [.red, .orange, .yellow, .green, .blue, .purple]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(colors, id: \.self) { color in
                    RoundedRectangle(cornerRadius: 16)
                        .fill(color.gradient)
                        .frame(width: 200, height: 280)
                        .visualEffect { content, proxy in
                            let frame = proxy.frame(in: .scrollView(axis: .horizontal))
                            let midX = frame.midX
                            let screenMidX = UIScreen.main.bounds.width / 2
                            let distance = abs(midX - screenMidX)
                            let maxDistance: CGFloat = 300
                            let normalizedDistance = min(distance / maxDistance, 1.0)

                            return content
                                .scaleEffect(1.0 - normalizedDistance * 0.15)
                                .rotation3DEffect(
                                    .degrees(Double(midX - screenMidX) / 10),
                                    axis: (x: 0, y: 1, z: 0)
                                )
                                .opacity(1.0 - Double(normalizedDistance) * 0.3)
                        }
                }
            }
            .padding(.horizontal, 80)
        }
        .scrollTargetBehavior(.viewAligned)
    }
}
```

---

### scrollTransition (iOS 17+)

The `.scrollTransition` modifier animates views as they enter and leave the visible area of a `ScrollView`. It provides a `phase` value that indicates where the view is relative to the viewport.

**Phase values:**
- `.topLeading` -- the view is above or to the leading side of the viewport (about to enter from top/leading).
- `.identity` -- the view is fully within the visible area.
- `.bottomTrailing` -- the view is below or to the trailing side of the viewport (about to exit bottom/trailing).

```swift
// Basic fade and scale on scroll
ScrollView {
    LazyVStack(spacing: 16) {
        ForEach(0..<20) { index in
            RoundedRectangle(cornerRadius: 16)
                .fill(.blue.gradient)
                .frame(height: 120)
                .overlay {
                    Text("Card \(index)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                }
                .scrollTransition { content, phase in
                    content
                        .opacity(phase.isIdentity ? 1.0 : 0.3)
                        .scaleEffect(phase.isIdentity ? 1.0 : 0.85)
                }
        }
    }
    .padding()
}
```

#### Complete Example: Cards That Scale Up as They Enter

```swift
struct ScrollTransitionDemo: View {
    struct CardItem: Identifiable {
        let id = UUID()
        let title: String
        let subtitle: String
        let color: Color
    }

    let items: [CardItem] = [
        CardItem(title: "Design", subtitle: "Create beautiful interfaces", color: .blue),
        CardItem(title: "Develop", subtitle: "Build with SwiftUI", color: .purple),
        CardItem(title: "Test", subtitle: "Ensure quality everywhere", color: .orange),
        CardItem(title: "Deploy", subtitle: "Ship to the App Store", color: .green),
        CardItem(title: "Monitor", subtitle: "Track performance", color: .red),
        CardItem(title: "Iterate", subtitle: "Improve continuously", color: .teal),
        CardItem(title: "Scale", subtitle: "Grow your user base", color: .indigo),
        CardItem(title: "Optimize", subtitle: "Fine-tune performance", color: .pink),
    ]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 20) {
                ForEach(items) { item in
                    HStack(spacing: 16) {
                        Circle()
                            .fill(item.color.gradient)
                            .frame(width: 56, height: 56)
                            .overlay {
                                Image(systemName: "star.fill")
                                    .foregroundStyle(.white)
                                    .font(.title3)
                            }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title)
                                .font(.headline)
                            Text(item.subtitle)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .foregroundStyle(.tertiary)
                    }
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .scrollTransition(.animated(.spring(duration: 0.4))) { content, phase in
                        content
                            .opacity(phase.isIdentity ? 1.0 : 0.0)
                            .scaleEffect(phase.isIdentity ? 1.0 : 0.75)
                            .offset(y: phase == .bottomTrailing ? 30 : phase == .topLeading ? -30 : 0)
                            .blur(radius: phase.isIdentity ? 0 : 2)
                    }
                }
            }
            .padding()
        }
    }
}
```

#### Horizontal Scroll with Rotation

```swift
ScrollView(.horizontal, showsIndicators: false) {
    HStack(spacing: 12) {
        ForEach(0..<10) { index in
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(hue: Double(index) / 10, saturation: 0.7, brightness: 0.9).gradient)
                .frame(width: 200, height: 280)
                .scrollTransition(.interactive) { content, phase in
                    content
                        .rotation3DEffect(
                            .degrees(phase.value * 25),
                            axis: (x: 0, y: 1, z: 0)
                        )
                        .scaleEffect(phase.isIdentity ? 1.0 : 0.9)
                }
        }
    }
    .padding(.horizontal)
}
.scrollTargetBehavior(.viewAligned)
```

---

### MeshGradient (iOS 18+)

`MeshGradient` creates a two-dimensional gradient defined by a grid of control points, each with an associated color. The colors blend smoothly across the mesh, creating organic, flowing gradients far more complex than linear or radial gradients.

```swift
// Static mesh gradient
MeshGradient(
    width: 3,
    height: 3,
    points: [
        [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
        [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
        [0.0, 1.0], [0.5, 1.0], [1.0, 1.0]
    ],
    colors: [
        .red,    .purple, .indigo,
        .orange, .pink,   .blue,
        .yellow, .mint,   .teal
    ]
)
.frame(width: 300, height: 300)
.clipShape(RoundedRectangle(cornerRadius: 24))
```

#### Complete Animated Mesh Gradient Background

```swift
struct AnimatedMeshBackground: View {
    @State private var animationPhase: CGFloat = 0.0

    var body: some View {
        TimelineView(.animation) { context in
            let time = context.date.timeIntervalSinceReferenceDate

            MeshGradient(
                width: 3,
                height: 3,
                points: [
                    [0.0, 0.0],
                    [Float(0.5 + 0.3 * cos(time * 0.7)), 0.0],
                    [1.0, 0.0],

                    [0.0, Float(0.5 + 0.2 * sin(time * 0.5))],
                    [Float(0.5 + 0.2 * sin(time * 0.8)), Float(0.5 + 0.2 * cos(time * 0.6))],
                    [1.0, Float(0.5 + 0.3 * sin(time * 0.4))],

                    [0.0, 1.0],
                    [Float(0.5 + 0.2 * sin(time * 0.9)), 1.0],
                    [1.0, 1.0]
                ],
                colors: [
                    .red,    .purple, .indigo,
                    .orange, .pink,   .blue,
                    .yellow, .mint,   .teal
                ]
            )
            .ignoresSafeArea()
        }
    }
}

// Usage as a background
struct MeshGradientScreen: View {
    var body: some View {
        ZStack {
            AnimatedMeshBackground()

            VStack(spacing: 16) {
                Text("Welcome")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)

                Text("Beautiful animated gradients")
                    .font(.title3)
                    .foregroundStyle(.white.opacity(0.8))
            }
        }
    }
}
```

#### Mesh Gradient with Color Cycling

```swift
struct ColorCyclingMesh: View {
    let baseColors: [Color] = [
        .red, .orange, .yellow,
        .green, .mint, .teal,
        .blue, .indigo, .purple
    ]

    var body: some View {
        TimelineView(.animation) { context in
            let time = context.date.timeIntervalSinceReferenceDate
            let shift = Int(time * 2) % baseColors.count

            MeshGradient(
                width: 3,
                height: 3,
                points: [
                    [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
                    [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
                    [0.0, 1.0], [0.5, 1.0], [1.0, 1.0]
                ],
                colors: (0..<9).map { index in
                    baseColors[(index + shift) % baseColors.count]
                }
            )
            .ignoresSafeArea()
        }
    }
}
```

---

### TextRenderer Protocol (iOS 18+)

The `TextRenderer` protocol lets you customize how each glyph or line of text is drawn. You conform to `TextRenderer` and implement `draw(layout:in:)`, where you receive the resolved text layout and a `GraphicsContext`. This enables per-character animations like typing effects, wave motion, and fade-in sequences.

#### TextRenderer Protocol Basics

```swift
import SwiftUI

struct WaveTextRenderer: TextRenderer {
    var timeOffset: Double

    var animatableData: Double {
        get { timeOffset }
        set { timeOffset = newValue }
    }

    func draw(layout: Text.Layout, in context: inout GraphicsContext) {
        for line in layout {
            for run in line {
                for (index, glyph) in run.enumerated() {
                    var copy = context
                    let yOffset = sin(Double(index) * 0.5 + timeOffset) * 5
                    copy.translateBy(x: 0, y: yOffset)
                    copy.draw(glyph)
                }
            }
        }
    }
}
```

#### Complete Custom Text Animation: Per-Character Fade-In

```swift
import SwiftUI

struct FadeInTextRenderer: TextRenderer {
    var progress: Double

    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }

    func draw(layout: Text.Layout, in context: inout GraphicsContext) {
        var characterIndex = 0
        var totalCharacters = 0

        // Count total characters
        for line in layout {
            for run in line {
                for _ in run {
                    totalCharacters += 1
                }
            }
        }

        // Draw each character with staggered opacity
        for line in layout {
            for run in line {
                for glyph in run {
                    let threshold = Double(characterIndex) / Double(max(totalCharacters - 1, 1))
                    let characterProgress = max(0, min(1, (progress - threshold) * Double(totalCharacters) / 3.0))

                    var copy = context
                    copy.opacity = characterProgress
                    let yShift = (1.0 - characterProgress) * 10
                    copy.translateBy(x: 0, y: yShift)
                    copy.draw(glyph)

                    characterIndex += 1
                }
            }
        }
    }
}

struct FadeInTextDemo: View {
    @State private var progress: Double = 0.0

    var body: some View {
        VStack(spacing: 40) {
            Text("Hello, SwiftUI!")
                .font(.largeTitle)
                .fontWeight(.bold)
                .textRenderer(FadeInTextRenderer(progress: progress))

            Button("Animate") {
                progress = 0
                withAnimation(.easeInOut(duration: 1.5)) {
                    progress = 1.0
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
```

#### Typing Effect with TextRenderer

```swift
struct TypingTextRenderer: TextRenderer {
    var visibleCount: Int

    var animatableData: Double {
        get { Double(visibleCount) }
        set { visibleCount = Int(newValue) }
    }

    func draw(layout: Text.Layout, in context: inout GraphicsContext) {
        var characterIndex = 0
        for line in layout {
            for run in line {
                for glyph in run {
                    if characterIndex < visibleCount {
                        context.draw(glyph)
                    }
                    characterIndex += 1
                }
            }
        }
    }
}

struct TypingEffectDemo: View {
    @State private var visibleCount = 0
    private let message = "Welcome to the future of text rendering."

    var body: some View {
        VStack(spacing: 30) {
            Text(message)
                .font(.title2)
                .fontWeight(.medium)
                .textRenderer(TypingTextRenderer(visibleCount: visibleCount))
                .frame(maxWidth: .infinity, alignment: .leading)

            Button("Start Typing") {
                visibleCount = 0
                withAnimation(.linear(duration: 2.0)) {
                    visibleCount = message.count
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
```

#### Wave Text Animation

```swift
struct WaveTextDemo: View {
    @State private var wavePhase: Double = 0

    var body: some View {
        Text("SwiftUI Waves")
            .font(.largeTitle)
            .fontWeight(.heavy)
            .textRenderer(WaveTextRenderer(timeOffset: wavePhase))
            .onAppear {
                withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                    wavePhase = .pi * 2
                }
            }
    }
}
```

**Key rules for TextRenderer:**
- The `animatableData` property is required if you want SwiftUI to interpolate your renderer over time.
- `Text.Layout` provides an iterable hierarchy: layout -> lines -> runs -> glyphs.
- Use `GraphicsContext.draw(_:)` to render individual glyphs. You can modify the context (translate, rotate, set opacity) before each draw call.
- TextRenderer only works with `Text` views. It does not apply to `TextField`, `Label`, or other text-containing views.
