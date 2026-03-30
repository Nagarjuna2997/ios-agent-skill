# Interaction Standards

> Comprehensive reference for animations, haptics, symbols, button styles, state patterns, localization, privacy, adaptive layout, and preview standards.

---

## 1. Animation Standards

### Default Curves and Durations

| Category | Duration | Curve | Usage |
|---|---|---|---|
| Micro interaction | 0.2s | `.easeOut` | Toggles, button presses, icon changes |
| Navigation transition | 0.35s | `.spring(response: 0.35, dampingFraction: 0.85)` | Push, pop, tab switches |
| Content loading | 0.3s | `.easeInOut` | Skeleton to content, fade-in |
| Dismissal | 0.25s | `.easeIn` | Sheet dismiss, alert close, toast exit |
| Bouncy spring | -- | `.bouncy` | Playful UI: reactions, badges, celebrations |
| Snappy spring | -- | `.snappy` | Responsive controls: sliders, toggles |
| Smooth spring | -- | `.smooth` | Elegant reveals: cards, overlays |

### When to Use Which Animation

| Use Case | Animation | Rationale |
|---|---|---|
| Button tap feedback | `.easeOut, 0.2s` | Quick acknowledgment, no lingering |
| Toggle switch | `.snappy` | Responsive mechanical feel |
| Card expand/collapse | `.spring(response: 0.35, dampingFraction: 0.85)` | Natural, physical motion |
| Pull-to-refresh | `.bouncy` | Playful rubber-band feel |
| Modal presentation | `.smooth` | Elegant, unhurried entrance |
| Error shake | `.default.repeatCount(3)` | Attention-grabbing without being jarring |
| Skeleton shimmer | `.easeInOut, 1.2s, repeat` | Smooth continuous loop |
| Item deletion | `.easeIn, 0.25s` | Quick exit, attention moves forward |
| List reorder | `.snappy` | Keeps up with the finger |
| Hero transition | `matchedGeometryEffect` | Spatial continuity between screens |

### Transition Standards

```swift
// MARK: - Sheet Presentation (use system default)
.sheet(isPresented: $showSettings) {
    SettingsView()
}

// MARK: - Full Screen Cover with Custom Transition
.fullScreenCover(isPresented: $showOnboarding) {
    OnboardingView()
        .transition(.opacity.combined(with: .move(edge: .bottom)))
}

// MARK: - Navigation Push (system default)
NavigationStack {
    List(items) { item in
        NavigationLink(value: item) {
            ItemRow(item: item)
        }
    }
    .navigationDestination(for: Item.self) { item in
        ItemDetailView(item: item)
    }
}

// MARK: - Hero Transition with matchedGeometryEffect
struct HeroTransitionExample: View {
    @Namespace private var heroNamespace
    @State private var isExpanded = false

    var body: some View {
        if isExpanded {
            DetailCard(namespace: heroNamespace)
                .onTapGesture {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                        isExpanded = false
                    }
                }
        } else {
            ThumbnailCard(namespace: heroNamespace)
                .onTapGesture {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                        isExpanded = true
                    }
                }
        }
    }
}

struct ThumbnailCard: View {
    var namespace: Namespace.ID

    var body: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(.blue.gradient)
            .matchedGeometryEffect(id: "card", in: namespace)
            .frame(width: 120, height: 120)
            .overlay {
                Text("Tap")
                    .matchedGeometryEffect(id: "title", in: namespace)
            }
    }
}

struct DetailCard: View {
    var namespace: Namespace.ID

    var body: some View {
        RoundedRectangle(cornerRadius: 24)
            .fill(.blue.gradient)
            .matchedGeometryEffect(id: "card", in: namespace)
            .frame(maxWidth: .infinity, maxHeight: 400)
            .overlay {
                Text("Detail View")
                    .matchedGeometryEffect(id: "title", in: namespace)
            }
            .padding()
    }
}

// MARK: - Custom Asymmetric Transition
extension AnyTransition {
    static var slideAndFade: AnyTransition {
        .asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        )
    }
}

// Usage:
struct CustomTransitionExample: View {
    @State private var showContent = false

    var body: some View {
        VStack {
            if showContent {
                ContentView()
                    .transition(.slideAndFade)
            }
            Button("Toggle") {
                withAnimation(.easeInOut(duration: 0.3)) {
                    showContent.toggle()
                }
            }
        }
    }
}

// MARK: - Phased Animation for Multi-Step Effects
struct PhasedAnimationExample: View {
    @State private var trigger = false

    var body: some View {
        Image(systemName: "bell.fill")
            .font(.system(size: 32))
            .phaseAnimator([false, true], trigger: trigger) { content, phase in
                content
                    .scaleEffect(phase ? 1.2 : 1.0)
                    .rotationEffect(.degrees(phase ? 15 : 0))
            } animation: { phase in
                phase ? .bouncy : .snappy
            }
            .onTapGesture { trigger.toggle() }
    }
}
```

---

## 2. Haptic Feedback Rules

### Haptic Selection Guide

| Haptic Type | When to Use | Examples |
|---|---|---|
| `.success` | Completed action | Save confirmed, message sent, purchase complete |
| `.warning` | Destructive action confirmation | Delete dialog appears, irreversible action prompt |
| `.error` | Failed action | Validation error, network failure, permission denied |
| `.light` | Toggle or selection change | Switch toggled, radio selected, checkbox tapped |
| `.medium` | Snap to position | Pull-to-refresh threshold reached, snap point hit |
| `.heavy` | Long press activation | Context menu triggered, drag-and-drop pickup |
| `.selection` | Scrolling through values | Picker scroll, date wheel spin, segment change |

### SensoryFeedback (iOS 17+)

```swift
// MARK: - SensoryFeedback Modifier (Preferred for iOS 17+)
struct HapticExamples: View {
    @State private var isFavorited = false
    @State private var taskCompleted = false
    @State private var showError = false
    @State private var sliderValue = 0.5

    var body: some View {
        VStack(spacing: 24) {
            // Success haptic on task completion
            Button("Complete Task") {
                taskCompleted = true
            }
            .sensoryFeedback(.success, trigger: taskCompleted)

            // Light haptic on toggle
            Toggle("Favorite", isOn: $isFavorited)
                .sensoryFeedback(.selection, trigger: isFavorited)

            // Error haptic on failure
            Button("Submit") {
                showError = true
            }
            .sensoryFeedback(.error, trigger: showError)

            // Impact haptic with weight
            Button("Heavy Action") { }
                .sensoryFeedback(.impact(weight: .heavy), trigger: taskCompleted)
        }
    }
}
```

### UIImpactFeedbackGenerator (iOS 16 and Below)

```swift
// MARK: - Haptic Manager for Pre-iOS 17
final class HapticManager {
    static let shared = HapticManager()
    private init() {}

    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
    }

    func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(type)
    }

    func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.prepare()
        generator.selectionChanged()
    }
}

// Usage:
Button("Save") {
    performSave()
    HapticManager.shared.notification(.success)
}

Button("Delete") {
    HapticManager.shared.notification(.warning)
    showDeleteConfirmation = true
}
```

### Best Practices

- Never fire haptics on passive events (scrolling, appearing, background refresh).
- Respect the system setting: haptics are automatically suppressed when the user disables them.
- Prepare generators early (`.prepare()`) before the moment of feedback for zero-latency response.
- Do not chain multiple haptics in rapid succession; one feedback per gesture.
- Test on a real device -- the Simulator does not produce haptic output.

---

## 3. SF Symbols Guidelines

### Size Guidelines

| Context | Point Size | Example |
|---|---|---|
| Inline with text | 17pt | Label icons, list item accessories |
| Tab bar | 24pt | Bottom navigation icons |
| Buttons | 28-32pt | Toolbar actions, floating action buttons |
| Feature icons | 44-64pt | Empty states, onboarding, settings headers |

### Rendering Modes

| Mode | When to Use | Description |
|---|---|---|
| `.monochrome` | Default, single-tone UI elements | One color applied uniformly |
| `.hierarchical` | Icons needing depth | Primary color with opacity layers |
| `.palette` | Brand-specific multi-color | You control each layer color |
| `.multicolor` | System-defined rich icons | Weather, file types, flags |

```swift
// MARK: - Rendering Modes
struct SymbolRenderingExamples: View {
    var body: some View {
        VStack(spacing: 20) {
            // Monochrome (default)
            Image(systemName: "heart.fill")
                .symbolRenderingMode(.monochrome)
                .foregroundStyle(.red)

            // Hierarchical — automatic depth
            Image(systemName: "square.stack.3d.up.fill")
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(.blue)
                .font(.system(size: 44))

            // Palette — explicit layer colors
            Image(systemName: "person.crop.circle.badge.checkmark")
                .symbolRenderingMode(.palette)
                .foregroundStyle(.blue, .green)
                .font(.system(size: 44))

            // Multicolor — system-defined
            Image(systemName: "cloud.sun.rain.fill")
                .symbolRenderingMode(.multicolor)
                .font(.system(size: 44))
        }
    }
}
```

### Variable Value Symbols

```swift
// MARK: - Variable Value (0.0 to 1.0) for Progress
struct VariableSymbolExample: View {
    @State private var progress: Double = 0.0

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "speaker.wave.3.fill", variableValue: progress)
                .font(.system(size: 48))
                .foregroundStyle(.blue)
                .contentTransition(.symbolEffect(.replace))

            Image(systemName: "wifi", variableValue: progress)
                .font(.system(size: 48))
                .foregroundStyle(.green)

            Slider(value: $progress, in: 0...1)
                .padding(.horizontal)
        }
    }
}
```

### Symbol Effects

```swift
// MARK: - Symbol Effects (iOS 17+)
struct SymbolEffectsExample: View {
    @State private var bellTapped = false
    @State private var isActive = false
    @State private var downloadComplete = false

    var body: some View {
        VStack(spacing: 24) {
            // Bounce on tap
            Image(systemName: "bell.fill")
                .font(.system(size: 32))
                .symbolEffect(.bounce, value: bellTapped)
                .onTapGesture { bellTapped.toggle() }

            // Continuous pulse while active
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 32))
                .symbolEffect(.pulse, isActive: isActive)

            // Variable color animation (iterating layers)
            Image(systemName: "wifi")
                .font(.system(size: 32))
                .symbolEffect(.variableColor.iterative, isActive: isActive)

            // Appear / disappear
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 32))
                .symbolEffect(.appear, isActive: downloadComplete)

            // Replace transition between symbols
            Image(systemName: isActive ? "pause.fill" : "play.fill")
                .contentTransition(.symbolEffect(.replace))
                .font(.system(size: 32))
                .onTapGesture {
                    withAnimation { isActive.toggle() }
                }

            // Breathe effect
            Image(systemName: "heart.fill")
                .font(.system(size: 32))
                .foregroundStyle(.red)
                .symbolEffect(.breathe, isActive: isActive)

            // Wiggle effect
            Image(systemName: "bell.badge.fill")
                .font(.system(size: 32))
                .symbolEffect(.wiggle, value: bellTapped)

            // Rotate effect
            Image(systemName: "gear")
                .font(.system(size: 32))
                .symbolEffect(.rotate, isActive: isActive)
        }
    }
}
```

### Preferred Symbol Weight

Use `.medium` weight by default to match the system HIG:

```swift
Image(systemName: "gear")
    .fontWeight(.medium)
```

---

## 4. Button Style Standards

### Complete Button Style System

```swift
// MARK: - Primary Button Style
struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    var isLoading: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            if isLoading {
                ProgressView()
                    .tint(.white)
            }
            configuration.label
        }
        .font(.body.weight(.semibold))
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 50)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    isEnabled
                        ? AnyShapeStyle(LinearGradient(
                            colors: [.blue, .blue.opacity(0.8)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing))
                        : AnyShapeStyle(.gray.opacity(0.4))
                )
        )
        .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
        .opacity(isLoading ? 0.9 : 1.0)
        .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
        .allowsHitTesting(!isLoading)
    }
}

// MARK: - Secondary Button Style
struct SecondaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    var isLoading: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            if isLoading {
                ProgressView()
                    .tint(.accentColor)
            }
            configuration.label
        }
        .font(.body.weight(.semibold))
        .foregroundStyle(isEnabled ? .accentColor : .gray)
        .frame(maxWidth: .infinity, minHeight: 50)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isEnabled ? Color.accentColor : .gray, lineWidth: 1.5)
        )
        .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
        .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Destructive Button Style
struct DestructiveButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    var isLoading: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            if isLoading {
                ProgressView()
                    .tint(.white)
            }
            configuration.label
        }
        .font(.body.weight(.semibold))
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 50)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isEnabled ? Color.red : .gray.opacity(0.4))
        )
        .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
        .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Ghost Button Style
struct GhostButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.medium))
            .foregroundStyle(isEnabled ? .accentColor : .gray)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .opacity(configuration.isPressed ? 0.7 : 1.0)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Icon Button Style
struct IconButtonStyle: ButtonStyle {
    var size: CGFloat = 44
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: size * 0.45, weight: .medium))
            .foregroundStyle(isEnabled ? .accentColor : .gray)
            .frame(width: size, height: size)
            .background(Circle().fill(.ultraThinMaterial))
            .scaleEffect(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Pill Button Style
struct PillButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(isEnabled ? .white : .gray)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(isEnabled ? Color.accentColor : .gray.opacity(0.3))
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Usage Examples
struct ButtonShowcase: View {
    @State private var isLoading = false

    var body: some View {
        VStack(spacing: 16) {
            Button { } label: {
                Label("Continue", systemImage: "arrow.right")
            }
            .buttonStyle(PrimaryButtonStyle())

            Button { } label: {
                Label("Edit Profile", systemImage: "pencil")
            }
            .buttonStyle(SecondaryButtonStyle())

            Button(role: .destructive) { } label: {
                Label("Delete Account", systemImage: "trash")
            }
            .buttonStyle(DestructiveButtonStyle())

            Button("Learn More") { }
                .buttonStyle(GhostButtonStyle())

            Button { } label: {
                Image(systemName: "plus")
            }
            .buttonStyle(IconButtonStyle())

            Button { } label: {
                Label("Subscribe", systemImage: "star.fill")
            }
            .buttonStyle(PillButtonStyle())

            // Disabled state
            Button("Disabled") { }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(true)

            // Loading state
            Button("Saving...") { }
                .buttonStyle(PrimaryButtonStyle(isLoading: true))
        }
        .padding()
    }
}
```

---

## 5. Loading, Empty, and Error State Patterns

### ViewState Enum

```swift
// MARK: - Generic View State
enum ViewState<T> {
    case loading
    case loaded(T)
    case empty
    case error(Error)
}
```

### Loading View

```swift
// MARK: - Shimmer Modifier
struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [.clear, .white.opacity(0.4), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: phase)
                .mask(content)
            )
            .onAppear {
                withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: false)) {
                    phase = UIScreen.main.bounds.width
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}

// MARK: - Skeleton Loading View
struct SkeletonRow: View {
    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(.gray.opacity(0.2))
                .frame(width: 48, height: 48)

            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(.gray.opacity(0.2))
                    .frame(height: 14)
                    .frame(maxWidth: 160)

                RoundedRectangle(cornerRadius: 4)
                    .fill(.gray.opacity(0.2))
                    .frame(height: 12)
                    .frame(maxWidth: 100)
            }
        }
        .shimmer()
    }
}

// MARK: - Spinner Loading
struct LoadingSpinnerView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
```

### Empty State View

```swift
// MARK: - Empty State Presets
enum EmptyStatePreset {
    case noData
    case noSearchResults
    case noConnection
    case firstTimeUse

    var icon: String {
        switch self {
        case .noData: "tray"
        case .noSearchResults: "magnifyingglass"
        case .noConnection: "wifi.slash"
        case .firstTimeUse: "sparkles"
        }
    }

    var title: String {
        switch self {
        case .noData: "Nothing Here Yet"
        case .noSearchResults: "No Results Found"
        case .noConnection: "No Connection"
        case .firstTimeUse: "Get Started"
        }
    }

    var message: String {
        switch self {
        case .noData: "Items you add will appear here."
        case .noSearchResults: "Try a different search term."
        case .noConnection: "Check your internet connection and try again."
        case .firstTimeUse: "Tap the button below to create your first item."
        }
    }
}

struct EmptyStateView: View {
    var preset: EmptyStatePreset
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        ContentUnavailableView {
            Label(preset.title, systemImage: preset.icon)
        } description: {
            Text(preset.message)
        } actions: {
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}
```

### Error State View

```swift
// MARK: - Error State View
struct ErrorStateView: View {
    let error: Error
    var retryAction: (() -> Void)?
    var reportAction: (() -> Void)?

    var body: some View {
        ContentUnavailableView {
            Label("Something Went Wrong", systemImage: "exclamationmark.triangle")
        } description: {
            Text(error.localizedDescription)
        } actions: {
            VStack(spacing: 12) {
                if let retryAction {
                    Button("Try Again", action: retryAction)
                        .buttonStyle(.borderedProminent)
                }
                if let reportAction {
                    Button("Report Issue", action: reportAction)
                        .font(.footnote)
                }
            }
        }
    }
}
```

### AsyncContentView Wrapper

```swift
// MARK: - Async Content View
struct AsyncContentView<T, LoadedContent: View>: View {
    @Binding var state: ViewState<T>
    var loadingMessage: String = "Loading..."
    var emptyPreset: EmptyStatePreset = .noData
    var emptyAction: (() -> Void)?
    var retryAction: (() -> Void)?
    @ViewBuilder var content: (T) -> LoadedContent

    var body: some View {
        switch state {
        case .loading:
            LoadingSpinnerView(message: loadingMessage)
                .transition(.opacity)
        case .loaded(let data):
            content(data)
                .transition(.opacity)
        case .empty:
            EmptyStateView(
                preset: emptyPreset,
                actionTitle: emptyAction != nil ? "Add Item" : nil,
                action: emptyAction
            )
            .transition(.opacity)
        case .error(let error):
            ErrorStateView(error: error, retryAction: retryAction)
                .transition(.opacity)
        }
    }
}

// MARK: - Usage with Pull-to-Refresh
struct ItemListView: View {
    @State private var state: ViewState<[Item]> = .loading

    var body: some View {
        AsyncContentView(
            state: $state,
            emptyPreset: .noData,
            retryAction: { Task { await loadItems() } }
        ) { items in
            List(items) { item in
                Text(item.name)
            }
            .refreshable {
                await loadItems()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: stateKey)
        .task { await loadItems() }
    }

    private var stateKey: String {
        switch state {
        case .loading: "loading"
        case .loaded: "loaded"
        case .empty: "empty"
        case .error: "error"
        }
    }

    private func loadItems() async {
        state = .loading
        do {
            let items = try await ItemService.fetchAll()
            state = items.isEmpty ? .empty : .loaded(items)
        } catch {
            state = .error(error)
        }
    }
}
```

---

## 6. Localization Approach

### String Catalogs Setup

All user-facing strings must use `String(localized:)`. Never hardcode display text.

Xcode creates a `Localizable.xcstrings` file (String Catalog) that automatically extracts strings.

```swift
// MARK: - Correct: Localized Strings
let title = String(localized: "welcome.title")
let message = String(localized: "welcome.message")

// With default value
let greeting = String(localized: "greeting", defaultValue: "Hello there!")

// MARK: - String Interpolation
let itemCount = 5
let label = String(localized: "\(itemCount) items remaining")

// MARK: - Pluralization (handled in .xcstrings catalog)
// In the String Catalog, define plural variants:
//   "item_count" -> one: "%lld item", other: "%lld items"
let countLabel = String(localized: "\(itemCount) items")

// MARK: - Table-based organization
let settingsTitle = String(localized: "title", table: "Settings")
```

### Date and Number Formatting

```swift
// MARK: - Locale-Aware Formatting
struct FormattingExamples: View {
    let price: Decimal = 49.99
    let eventDate = Date()
    let progress = 0.756

    var body: some View {
        VStack(alignment: .leading) {
            // Currency — adapts to user locale
            Text(price, format: .currency(code: "USD"))

            // Date — adapts to locale conventions
            Text(eventDate, format: .dateTime.month(.wide).day().year())

            // Relative date
            Text(eventDate, format: .relative(presentation: .named))

            // Percentage
            Text(progress, format: .percent.precision(.fractionLength(1)))

            // Measurement
            Text(Measurement(value: 72, unit: UnitTemperature.fahrenheit),
                 format: .measurement(width: .abbreviated))
        }
    }
}
```

### RTL and Layout Considerations

```swift
// MARK: - RTL-Safe Layout
struct RTLSafeView: View {
    @Environment(\.layoutDirection) var layoutDirection

    var body: some View {
        HStack {
            // Use .leading/.trailing, never .left/.right
            Image(systemName: "arrow.forward")
                .flipsForRightToLeftLayoutDirection(true)
            Text(String(localized: "next"))
        }
        .frame(maxWidth: .infinity, alignment: .leading) // Flips automatically in RTL
    }
}
```

---

## 7. Privacy Manifest

### PrivacyInfo.xcprivacy Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Tracking declaration -->
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>

    <!-- Required Reason APIs -->
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- File timestamp APIs -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>C617.1</string> <!-- Access within app container -->
            </array>
        </dict>
        <!-- System boot time APIs -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategorySystemBootTime</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>35F9.1</string> <!-- Measure elapsed time -->
            </array>
        </dict>
        <!-- Disk space APIs -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryDiskSpace</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>E174.1</string> <!-- Check available disk space -->
            </array>
        </dict>
        <!-- User defaults APIs -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string> <!-- Access within app -->
            </array>
        </dict>
    </array>

    <!-- Collected data types -->
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeCrashData</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <false/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

### Required Reason API Categories

| Category | Common APIs | Typical Reason Code |
|---|---|---|
| File Timestamp | `NSFileCreationDate`, `NSFileModificationDate`, `NSURLContentModificationDateKey` | `C617.1` (app container), `DDA9.1` (user-presented) |
| System Boot Time | `systemUptime`, `ProcessInfo.processInfo.systemUptime` | `35F9.1` (measure elapsed time) |
| Disk Space | `volumeAvailableCapacityKey`, `volumeAvailableCapacityForImportantUsageKey` | `E174.1` (check space before write) |
| User Defaults | `UserDefaults` | `CA92.1` (access within app) |
| Active Keyboard | `activeInputModes` | `3EC4.1` (customize UI) |

### Third-Party SDK Manifests

Each third-party SDK must include its own `PrivacyInfo.xcprivacy`. Verify during dependency audits:

```swift
// In Package.swift or Podfile, verify SDK authors ship privacy manifests.
// Xcode aggregates all manifests during App Store submission.
// Run: Product > Generate Privacy Report to audit before submission.
```

---

## 8. Device Support and Adaptive Layout

### Size Class Detection

```swift
// MARK: - Adaptive Layout with Size Classes
struct AdaptiveView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.verticalSizeClass) private var verticalSizeClass

    var body: some View {
        if horizontalSizeClass == .regular {
            // iPad or iPhone landscape wide
            HStack(spacing: 0) {
                SidebarView()
                    .frame(width: 320)
                DetailView()
            }
        } else {
            // iPhone portrait
            NavigationStack {
                ListView()
            }
        }
    }
}
```

### NavigationSplitView for iPad Sidebar

```swift
// MARK: - Navigation Split View
struct SplitLayoutView: View {
    @State private var selectedItem: Item?
    @State private var columnVisibility = NavigationSplitViewVisibility.automatic

    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            List(items, selection: $selectedItem) { item in
                NavigationLink(value: item) {
                    ItemRow(item: item)
                }
            }
            .navigationTitle("Items")
        } detail: {
            if let selectedItem {
                ItemDetailView(item: selectedItem)
            } else {
                ContentUnavailableView("Select an Item",
                    systemImage: "sidebar.left",
                    description: Text("Choose an item from the sidebar."))
            }
        }
    }
}
```

### ViewThatFits

```swift
// MARK: - ViewThatFits for Adaptive Components
struct AdaptiveActionBar: View {
    var body: some View {
        ViewThatFits(in: .horizontal) {
            // First choice: full horizontal layout
            HStack(spacing: 16) {
                Button("Save Draft") { }
                    .buttonStyle(SecondaryButtonStyle())
                Button("Preview") { }
                    .buttonStyle(SecondaryButtonStyle())
                Button("Publish") { }
                    .buttonStyle(PrimaryButtonStyle())
            }

            // Fallback: stacked layout
            VStack(spacing: 8) {
                Button("Publish") { }
                    .buttonStyle(PrimaryButtonStyle())
                HStack(spacing: 8) {
                    Button("Save Draft") { }
                        .buttonStyle(SecondaryButtonStyle())
                    Button("Preview") { }
                        .buttonStyle(SecondaryButtonStyle())
                }
            }
        }
        .padding()
    }
}
```

### iPad-Specific Features

```swift
// MARK: - Pointer Hover Effect (iPad)
struct HoverableCard: View {
    @State private var isHovered = false

    var body: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(.background)
            .shadow(radius: isHovered ? 8 : 2)
            .scaleEffect(isHovered ? 1.02 : 1.0)
            .onHover { hovering in
                withAnimation(.easeOut(duration: 0.2)) {
                    isHovered = hovering
                }
            }
            .hoverEffect(.lift) // System pointer lift effect
    }
}

// MARK: - Keyboard Shortcuts (iPad with hardware keyboard)
struct ShortcutView: View {
    var body: some View {
        VStack {
            Text("Press Cmd+N to create")
        }
        .keyboardShortcut("n", modifiers: .command)
    }
}
```

---

## 9. Preview Provider Standards

### Modern Previews (iOS 17+)

```swift
// MARK: - Basic Preview
#Preview {
    ContentView()
}

// MARK: - Named Preview
#Preview("Dark Mode") {
    ContentView()
        .preferredColorScheme(.dark)
}

// MARK: - Light and Dark Side by Side
#Preview("Color Schemes") {
    VStack {
        ContentView()
            .preferredColorScheme(.light)
        ContentView()
            .preferredColorScheme(.dark)
    }
}

// MARK: - Dynamic Type Sizes
#Preview("Large Text") {
    ContentView()
        .dynamicTypeSize(.xxxLarge)
}

#Preview("Accessibility Sizes") {
    ContentView()
        .dynamicTypeSize(.accessibility3)
}

// MARK: - Device Variations
#Preview("iPhone SE", traits: .fixedLayout(width: 375, height: 667)) {
    ContentView()
}

#Preview("iPad", traits: .fixedLayout(width: 1024, height: 768)) {
    ContentView()
}

// MARK: - Size That Fits
#Preview("Component", traits: .sizeThatFitsLayout) {
    PillButtonExample()
        .padding()
}
```

### Interactive Previews

```swift
// MARK: - Interactive Preview with @Previewable
#Preview("Toggle Demo") {
    @Previewable @State var isOn = false

    Toggle("Notifications", isOn: $isOn)
        .padding()
}

#Preview("Counter") {
    @Previewable @State var count = 0

    VStack {
        Text("Count: \(count)")
            .font(.largeTitle)
        Button("Increment") { count += 1 }
            .buttonStyle(PrimaryButtonStyle())
    }
    .padding()
}
```

### Preview with Mock Data

```swift
// MARK: - Preview with Mock Data
struct Item: Identifiable {
    let id: UUID
    let name: String
    let subtitle: String

    static let samples: [Item] = [
        Item(id: UUID(), name: "Morning Run", subtitle: "5.2 km"),
        Item(id: UUID(), name: "Yoga Session", subtitle: "45 min"),
        Item(id: UUID(), name: "Cycling", subtitle: "12.8 km"),
    ]
}

#Preview {
    List(Item.samples) { item in
        VStack(alignment: .leading) {
            Text(item.name).font(.headline)
            Text(item.subtitle).font(.caption).foregroundStyle(.secondary)
        }
    }
}
```

### SwiftData Preview Container

```swift
// MARK: - SwiftData Preview Container
struct PreviewContainer {
    static var shared: ModelContainer {
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try! ModelContainer(
            for: Task.self,
            configurations: config
        )
        // Insert sample data
        let context = container.mainContext
        for task in Task.sampleTasks {
            context.insert(task)
        }
        return container
    }
}

#Preview {
    TaskListView()
        .modelContainer(PreviewContainer.shared)
}
```

### Legacy PreviewProvider (iOS 16 and Below)

```swift
// MARK: - Legacy PreviewProvider
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ContentView()
                .previewDisplayName("Light")

            ContentView()
                .preferredColorScheme(.dark)
                .previewDisplayName("Dark")

            ContentView()
                .dynamicTypeSize(.xxxLarge)
                .previewDisplayName("Large Text")
        }
    }
}
```

---

## Quick Reference Summary

| Area | Key Rule |
|---|---|
| Micro interaction | 0.2s `.easeOut` |
| Navigation | 0.35s `.spring(response: 0.35, dampingFraction: 0.85)` |
| Dismissal | 0.25s `.easeIn` |
| Haptic on success | `.success` via `SensoryFeedback` |
| Haptic on toggle | `.selection` |
| SF Symbol weight | `.medium` |
| SF Symbol inline size | 17pt |
| Button press scale | `0.97` |
| Strings | Always `String(localized:)` |
| Layout direction | `.leading/.trailing`, never `.left/.right` |
| Privacy | Ship `PrivacyInfo.xcprivacy` with every target |
| Previews | Use `#Preview` macro, test light/dark/large text |
