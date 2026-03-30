# SwiftUI Gestures

Complete reference for tap, long press, drag, magnify, rotate gestures, composition, gesture state, and integration with animations.

---

## TapGesture

### Shortcut Modifier

```swift
// Single tap
Text("Tap me")
    .onTapGesture {
        print("Tapped")
    }

// Double tap
Image("photo")
    .onTapGesture(count: 2) {
        isZoomed.toggle()
    }

// Triple tap
Text("Secret")
    .onTapGesture(count: 3) {
        showDebugMenu = true
    }
```

### Explicit TapGesture

```swift
let doubleTap = TapGesture(count: 2)
    .onEnded {
        withAnimation(.spring(duration: 0.3, bounce: 0.4)) {
            isFavorited.toggle()
        }
    }

Image(systemName: isFavorited ? "heart.fill" : "heart")
    .font(.largeTitle)
    .foregroundStyle(isFavorited ? .red : .gray)
    .gesture(doubleTap)
```

### SpatialTapGesture (iOS 16+)

Provides the location of the tap.

```swift
let spatialTap = SpatialTapGesture()
    .onEnded { value in
        let location = value.location  // CGPoint
        addAnnotation(at: location)
    }

Canvas { context, size in
    for annotation in annotations {
        context.fill(
            Circle().path(in: CGRect(origin: annotation.point, size: CGSize(width: 20, height: 20))),
            with: .color(.blue)
        )
    }
}
.gesture(spatialTap)
```

---

## LongPressGesture

### Shortcut Modifier

```swift
Text("Long press me")
    .onLongPressGesture(minimumDuration: 0.5) {
        showContextActions = true
    }

// With pressing state
Text("Hold")
    .onLongPressGesture(minimumDuration: 1.0) {
        // Completed
        performAction()
    } onPressingChanged: { isPressing in
        // Fires immediately when press starts/stops
        withAnimation {
            isHighlighted = isPressing
        }
    }
```

### Explicit LongPressGesture

```swift
struct LongPressButton: View {
    @GestureState private var isDetectingLongPress = false
    @State private var completedLongPress = false

    var longPress: some Gesture {
        LongPressGesture(minimumDuration: 1.0)
            .updating($isDetectingLongPress) { currentState, gestureState, transaction in
                gestureState = currentState
                transaction.animation = .easeIn(duration: 0.2)
            }
            .onEnded { finished in
                completedLongPress = finished
            }
    }

    var body: some View {
        Circle()
            .fill(isDetectingLongPress ? .red : .blue)
            .frame(width: 80, height: 80)
            .scaleEffect(isDetectingLongPress ? 1.2 : 1.0)
            .gesture(longPress)
    }
}
```

---

## DragGesture

The most versatile gesture for building interactive UIs.

```swift
struct DraggableCard: View {
    @State private var offset = CGSize.zero

    var body: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(.blue)
            .frame(width: 200, height: 120)
            .offset(offset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        offset = value.translation
                    }
                    .onEnded { value in
                        withAnimation(.spring) {
                            offset = .zero
                        }
                    }
            )
    }
}
```

### DragGesture Value Properties

```swift
DragGesture(minimumDistance: 10, coordinateSpace: .local)
    .onChanged { value in
        // Current drag state
        let translation = value.translation      // CGSize (total offset from start)
        let location = value.location            // CGPoint (current finger position)
        let startLocation = value.startLocation  // CGPoint (where drag began)
        let predictedEndLocation = value.predictedEndLocation    // CGPoint
        let predictedEndTranslation = value.predictedEndTranslation  // CGSize
        let velocity = value.velocity            // CGSize (iOS 17+, points per second)
    }
```

### Swipe-to-Dismiss Card

```swift
struct SwipeCard: View {
    @State private var offset = CGSize.zero
    @State private var opacity: Double = 1
    let onDismiss: () -> Void

    var body: some View {
        CardContent()
            .offset(x: offset.width)
            .rotationEffect(.degrees(Double(offset.width / 20)))
            .opacity(opacity)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        offset = value.translation
                        opacity = 1 - abs(Double(value.translation.width / 300))
                    }
                    .onEnded { value in
                        if abs(value.translation.width) > 150 {
                            // Dismiss
                            withAnimation(.easeOut(duration: 0.3)) {
                                offset.width = value.translation.width > 0 ? 500 : -500
                                opacity = 0
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                onDismiss()
                            }
                        } else {
                            // Spring back
                            withAnimation(.spring(duration: 0.4, bounce: 0.3)) {
                                offset = .zero
                                opacity = 1
                            }
                        }
                    }
            )
    }
}
```

### Drag with Velocity (iOS 17+)

```swift
DragGesture()
    .onEnded { value in
        let velocity = value.velocity
        let speed = sqrt(velocity.width * velocity.width + velocity.height * velocity.height)

        if speed > 500 {
            // Fast swipe -- project final position
            withAnimation(.spring(duration: 0.4)) {
                position = value.predictedEndTranslation
            }
        } else {
            // Slow drag -- snap back
            withAnimation(.spring) {
                position = .zero
            }
        }
    }
```

---

## MagnifyGesture (Pinch to Zoom)

Renamed from `MagnificationGesture` in iOS 17.

```swift
struct ZoomableImage: View {
    @State private var currentScale: CGFloat = 1.0
    @GestureState private var gestureScale: CGFloat = 1.0

    var magnification: some Gesture {
        MagnifyGesture()
            .updating($gestureScale) { value, gestureState, _ in
                gestureState = value.magnification
            }
            .onEnded { value in
                currentScale *= value.magnification
                currentScale = min(max(currentScale, 0.5), 5.0) // Clamp
            }
    }

    var body: some View {
        Image("landscape")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .scaleEffect(currentScale * gestureScale)
            .gesture(magnification)
            .onTapGesture(count: 2) {
                withAnimation(.spring) {
                    currentScale = 1.0
                }
            }
    }
}
```

---

## RotateGesture

Renamed from `RotationGesture` in iOS 17.

```swift
struct RotatableView: View {
    @State private var currentAngle: Angle = .zero
    @GestureState private var gestureAngle: Angle = .zero

    var rotation: some Gesture {
        RotateGesture()
            .updating($gestureAngle) { value, gestureState, _ in
                gestureState = value.rotation
            }
            .onEnded { value in
                currentAngle += value.rotation
            }
    }

    var body: some View {
        Image(systemName: "arrow.up")
            .font(.system(size: 60))
            .rotationEffect(currentAngle + gestureAngle)
            .gesture(rotation)
    }
}
```

---

## Gesture Composition

### .simultaneously

Both gestures are recognized at the same time.

```swift
struct ZoomAndRotate: View {
    @State private var scale: CGFloat = 1.0
    @State private var angle: Angle = .zero
    @GestureState private var gestureScale: CGFloat = 1.0
    @GestureState private var gestureAngle: Angle = .zero

    var body: some View {
        let magnify = MagnifyGesture()
            .updating($gestureScale) { value, state, _ in
                state = value.magnification
            }
            .onEnded { value in
                scale *= value.magnification
            }

        let rotate = RotateGesture()
            .updating($gestureAngle) { value, state, _ in
                state = value.rotation
            }
            .onEnded { value in
                angle += value.rotation
            }

        Image("photo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .scaleEffect(scale * gestureScale)
            .rotationEffect(angle + gestureAngle)
            .gesture(magnify.simultaneously(with: rotate))
    }
}
```

### .sequenced

Second gesture only activates after the first succeeds.

```swift
// Long press then drag
struct LongPressDrag: View {
    @State private var offset = CGSize.zero
    @GestureState private var isLongPressing = false

    var body: some View {
        let longPressThenDrag = LongPressGesture(minimumDuration: 0.5)
            .sequenced(before: DragGesture())
            .updating($isLongPressing) { value, state, _ in
                switch value {
                case .first(true):
                    state = true   // Long press active
                case .second(true, let drag):
                    state = true   // Dragging
                    if let drag {
                        // Can't use @GestureState for offset here
                        // but we can use it for visual feedback
                    }
                default:
                    state = false
                }
            }
            .onEnded { value in
                guard case .second(true, let drag?) = value else { return }
                offset = drag.translation
            }

        Circle()
            .fill(isLongPressing ? .red : .blue)
            .frame(width: 80, height: 80)
            .offset(offset)
            .scaleEffect(isLongPressing ? 1.2 : 1.0)
            .animation(.spring, value: isLongPressing)
            .gesture(longPressThenDrag)
    }
}
```

### .exclusively

Only one gesture is recognized; the first to start wins.

```swift
let tap = TapGesture()
    .onEnded { handleTap() }

let longPress = LongPressGesture(minimumDuration: 0.5)
    .onEnded { _ in handleLongPress() }

// Long press takes priority; tap recognized only if long press fails
view.gesture(longPress.exclusively(before: tap))
```

---

## @GestureState

A property wrapper that automatically resets to its initial value when the gesture ends. Ideal for transient visual feedback during a gesture.

```swift
struct PressableButton: View {
    @GestureState private var isPressed = false

    var body: some View {
        Text("Press Me")
            .padding()
            .background(isPressed ? .blue.opacity(0.8) : .blue)
            .foregroundStyle(.white)
            .clipShape(Capsule())
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(.spring(duration: 0.2), value: isPressed)
            .gesture(
                LongPressGesture(minimumDuration: .infinity)
                    .updating($isPressed) { currentState, gestureState, _ in
                        gestureState = true
                    }
            )
    }
}
```

**Key difference from @State:** `@GestureState` resets automatically when the gesture ends. With `@State` you must manually reset in `.onEnded`.

### Complex GestureState

```swift
struct DragState {
    var translation: CGSize = .zero
    var isDragging: Bool = false
}

@GestureState private var dragState = DragState()

DragGesture()
    .updating($dragState) { value, state, _ in
        state = DragState(
            translation: value.translation,
            isDragging: true
        )
    }
```

---

## Gesture Modifiers and Priority

### .highPriorityGesture

Takes priority over child view gestures.

```swift
VStack {
    Button("Child Button") { childAction() }
}
.highPriorityGesture(
    TapGesture().onEnded { parentAction() }
)
// Parent tap overrides the child button
```

### .simultaneousGesture

Recognized alongside child view gestures.

```swift
ScrollView {
    Content()
}
.simultaneousGesture(
    DragGesture().onChanged { value in
        // Track drag without blocking ScrollView scrolling
        trackDragPosition(value.location)
    }
)
```

### Gesture mask

```swift
// Only apply gesture to specific subviews
.gesture(dragGesture, including: .subviews)  // .all, .gesture, .subviews, .none
```

---

## Custom Gesture Modifiers

Encapsulate reusable gesture logic.

```swift
struct DraggableModifier: ViewModifier {
    @State private var offset = CGSize.zero
    let axis: Axis?
    let onDragEnd: ((CGSize) -> Void)?

    func body(content: Content) -> some View {
        content
            .offset(constrainedOffset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        offset = value.translation
                    }
                    .onEnded { value in
                        onDragEnd?(value.translation)
                        withAnimation(.spring) {
                            offset = .zero
                        }
                    }
            )
    }

    var constrainedOffset: CGSize {
        switch axis {
        case .horizontal:
            CGSize(width: offset.width, height: 0)
        case .vertical:
            CGSize(width: 0, height: offset.height)
        case nil:
            offset
        }
    }
}

extension View {
    func draggable(axis: Axis? = nil, onDragEnd: ((CGSize) -> Void)? = nil) -> some View {
        modifier(DraggableModifier(axis: axis, onDragEnd: onDragEnd))
    }
}

// Usage
Card().draggable(axis: .horizontal) { translation in
    if translation.width > 100 { markAsRead() }
}
```

---

## Gesture with Animation Integration

### Interactive Spring-Back

```swift
struct InteractiveCard: View {
    @State private var offset = CGSize.zero
    @State private var isDragging = false

    var body: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(.blue.gradient)
            .frame(width: 280, height: 180)
            .shadow(
                color: .black.opacity(isDragging ? 0.3 : 0.1),
                radius: isDragging ? 20 : 8,
                y: isDragging ? 10 : 4
            )
            .offset(offset)
            .scaleEffect(isDragging ? 1.05 : 1.0)
            .rotationEffect(.degrees(Double(offset.width / 20)))
            .gesture(
                DragGesture()
                    .onChanged { value in
                        withAnimation(.interactiveSpring) {
                            offset = value.translation
                            isDragging = true
                        }
                    }
                    .onEnded { value in
                        withAnimation(.spring(duration: 0.5, bounce: 0.4)) {
                            offset = .zero
                            isDragging = false
                        }
                    }
            )
    }
}
```

### Pull-to-Refresh with Custom Gesture

```swift
struct PullToRefresh: View {
    @State private var pullOffset: CGFloat = 0
    @State private var isRefreshing = false
    let threshold: CGFloat = 80

    var body: some View {
        VStack(spacing: 0) {
            // Pull indicator
            ZStack {
                if isRefreshing {
                    ProgressView()
                } else {
                    Image(systemName: "arrow.down")
                        .rotationEffect(.degrees(pullOffset > threshold ? 180 : 0))
                        .animation(.spring, value: pullOffset > threshold)
                }
            }
            .frame(height: max(0, pullOffset))
            .opacity(min(1, pullOffset / threshold))

            // Content
            ScrollView {
                LazyVStack {
                    ForEach(items) { item in
                        ItemRow(item: item)
                    }
                }
            }
        }
        .gesture(
            DragGesture()
                .onChanged { value in
                    if value.translation.height > 0 && !isRefreshing {
                        pullOffset = value.translation.height * 0.5 // Resistance
                    }
                }
                .onEnded { value in
                    if pullOffset > threshold {
                        withAnimation(.spring) { pullOffset = threshold }
                        isRefreshing = true
                        Task {
                            await refresh()
                            withAnimation(.spring) {
                                isRefreshing = false
                                pullOffset = 0
                            }
                        }
                    } else {
                        withAnimation(.spring) { pullOffset = 0 }
                    }
                }
        )
    }
}
```

---

## Practical Patterns

### Dismiss Gesture for Modal

```swift
struct DismissableSheet: View {
    @State private var dragOffset: CGFloat = 0
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack {
            Capsule()
                .fill(.secondary)
                .frame(width: 40, height: 5)
                .padding(.top, 8)

            SheetContent()
        }
        .offset(y: max(0, dragOffset))
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragOffset = value.translation.height
                }
                .onEnded { value in
                    if value.translation.height > 150 || value.velocity.height > 500 {
                        dismiss()
                    } else {
                        withAnimation(.spring(duration: 0.3)) {
                            dragOffset = 0
                        }
                    }
                }
        )
    }
}
```

### Coordinate Multiple Gestures

```swift
struct PhotoViewer: View {
    @State private var scale: CGFloat = 1
    @State private var offset = CGSize.zero
    @State private var angle: Angle = .zero

    var body: some View {
        Image("photo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .scaleEffect(scale)
            .offset(offset)
            .rotationEffect(angle)
            .gesture(
                MagnifyGesture()
                    .onChanged { value in
                        scale = value.magnification
                    }
                    .simultaneously(with:
                        RotateGesture()
                            .onChanged { value in
                                angle = value.rotation
                            }
                    )
                    .simultaneously(with:
                        DragGesture()
                            .onChanged { value in
                                offset = value.translation
                            }
                    )
            )
            .onTapGesture(count: 2) {
                withAnimation(.spring) {
                    scale = 1
                    offset = .zero
                    angle = .zero
                }
            }
    }
}
```

---

## Tips and Best Practices

1. Use `@GestureState` for transient gesture feedback -- it resets automatically and is more efficient than `@State`.
2. Always add `withAnimation` in `.onEnded` for smooth spring-back effects.
3. Use `.simultaneousGesture` when you need to observe gestures without blocking child interactions (e.g., tracking scroll position).
4. Set `minimumDistance` on `DragGesture` to avoid conflicting with scroll gestures (default is 10pt).
5. Combine `.sensoryFeedback()` with gestures for polished interactions.
6. Test gestures on real devices -- simulators do not support multi-touch or haptics.
7. For complex gesture interactions, profile with Instruments to ensure the main thread stays responsive.
