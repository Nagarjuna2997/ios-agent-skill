# WidgetKit

WidgetKit enables glanceable, timely content on the Home Screen, Lock Screen, and StandBy mode. Widgets use SwiftUI for their views and a timeline-based system for updates.

## Widget Protocol and Configuration

```swift
import WidgetKit
import SwiftUI

// Static configuration (no user configuration needed)
struct SimpleWidget: Widget {
    let kind: String = "SimpleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SimpleProvider()) { entry in
            SimpleWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Daily Summary")
        .description("Shows your daily progress at a glance.")
        .supportedFamilies([
            .systemSmall, .systemMedium, .systemLarge,
            .accessoryCircular, .accessoryRectangular, .accessoryInline
        ])
        .contentMarginsDisabled()  // iOS 17+: opt out of default content margins
    }
}

// App Intent configuration (iOS 17+ user-configurable widget)
struct ConfigurableWidget: Widget {
    let kind: String = "ConfigurableWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: SelectCategoryIntent.self,
            provider: ConfigurableProvider()
        ) { entry in
            ConfigurableWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Category Widget")
        .description("Shows items from a selected category.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

## TimelineProvider (Placeholder, Snapshot, Timeline)

```swift
struct SimpleEntry: TimelineEntry {
    let date: Date
    let title: String
    let value: Int
    let icon: String
}

struct SimpleProvider: TimelineProvider {
    // Shown while widget is loading. Must return synchronously.
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: .now, title: "Loading...", value: 0, icon: "star")
    }

    // Shown in the widget gallery and transient situations.
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        if context.isPreview {
            // Return sample data for the gallery preview
            completion(SimpleEntry(date: .now, title: "Steps Today", value: 8432, icon: "figure.walk"))
        } else {
            // Fetch real data for transient display
            let entry = SimpleEntry(date: .now, title: "Steps Today", value: fetchStepCount(), icon: "figure.walk")
            completion(entry)
        }
    }

    // Provides the timeline of entries that drive the widget's display.
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        var entries: [SimpleEntry] = []
        let currentDate = Date()

        // Create entries for the next 5 hours
        for hourOffset in 0..<5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(
                date: entryDate,
                title: "Steps Today",
                value: fetchStepCount() + (hourOffset * 500),
                icon: "figure.walk"
            )
            entries.append(entry)
        }

        // Timeline reload policies:
        // .atEnd     - reload after the last entry's date passes
        // .after(d)  - reload after a specific date
        // .never     - only reload when the app explicitly requests it
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

    private func fetchStepCount() -> Int { return 8432 }
}

// Async provider using AppIntentTimelineProvider (cleaner async/await API)
struct ConfigurableProvider: AppIntentTimelineProvider {
    typealias Entry = SimpleEntry
    typealias Intent = SelectCategoryIntent

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: .now, title: "Loading...", value: 0, icon: "star")
    }

    func snapshot(for configuration: SelectCategoryIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: .now, title: configuration.category?.name ?? "All", value: 42, icon: "star")
    }

    func timeline(for configuration: SelectCategoryIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let entries = [
            SimpleEntry(
                date: .now,
                title: configuration.category?.name ?? "All",
                value: 42,
                icon: "star"
            )
        ]
        return Timeline(entries: entries, policy: .after(.now.addingTimeInterval(3600)))
    }
}
```

## TimelineEntry Design

```swift
// Rich timeline entry with multiple data points
struct DashboardEntry: TimelineEntry {
    let date: Date
    let tasks: [TaskItem]
    let completedCount: Int
    let totalCount: Int
    let streakDays: Int

    var completionPercentage: Double {
        guard totalCount > 0 else { return 0 }
        return Double(completedCount) / Double(totalCount)
    }

    static var preview: DashboardEntry {
        DashboardEntry(
            date: .now,
            tasks: [
                TaskItem(name: "Morning workout", isComplete: true),
                TaskItem(name: "Read 30 minutes", isComplete: false),
                TaskItem(name: "Meditate", isComplete: true)
            ],
            completedCount: 5,
            totalCount: 8,
            streakDays: 12
        )
    }
}

struct TaskItem: Identifiable {
    let id = UUID()
    let name: String
    let isComplete: Bool
}
```

## Widget Families (systemSmall, Medium, Large, ExtraLarge)

```swift
struct SimpleWidgetView: View {
    var entry: SimpleEntry

    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            smallView
        case .systemMedium:
            mediumView
        case .systemLarge:
            largeView
        case .systemExtraLarge:
            extraLargeView  // iPad only
        case .accessoryCircular:
            circularView
        case .accessoryRectangular:
            rectangularView
        case .accessoryInline:
            inlineView
        @unknown default:
            smallView
        }
    }

    // Home Screen small (~169x169 pt)
    var smallView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: entry.icon)
                .font(.title2)
                .foregroundStyle(.blue)
            Spacer()
            Text(entry.title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text("\(entry.value)")
                .font(.title.bold())
                .contentTransition(.numericText())
        }
        .padding()
        .widgetURL(URL(string: "myapp://steps"))
    }

    // Home Screen medium (~360x169 pt)
    var mediumView: some View {
        HStack {
            smallView
            Spacer()
            VStack(alignment: .trailing) {
                Text("Goal: 10,000")
                    .font(.caption)
                ProgressView(value: Double(entry.value), total: 10000)
                    .tint(.blue)
                Text("\(10000 - entry.value) remaining")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
    }

    // Home Screen large (~360x376 pt)
    var largeView: some View {
        VStack(alignment: .leading, spacing: 12) {
            mediumView
            Divider()
            Text("Hourly Breakdown")
                .font(.headline)
            ForEach(0..<4) { hour in
                HStack {
                    Text("\(hour + 9):00")
                        .font(.caption.monospacedDigit())
                    ProgressView(value: Double.random(in: 0.2...1.0))
                        .tint(.blue)
                }
            }
            Spacer()
        }
        .padding()
    }

    var extraLargeView: some View {
        largeView // Customize further for iPad extra large
    }
}
```

## Lock Screen Widgets (Accessory Families)

```swift
extension SimpleWidgetView {
    // Lock Screen circular gauge
    var circularView: some View {
        Gauge(value: Double(entry.value), in: 0...10000) {
            Image(systemName: entry.icon)
        } currentValueLabel: {
            Text("\(entry.value / 1000)k")
                .font(.caption2)
        }
        .gaugeStyle(.accessoryCircular)
    }

    // Lock Screen rectangular
    var rectangularView: some View {
        VStack(alignment: .leading) {
            Label("\(entry.value)", systemImage: entry.icon)
                .font(.headline)
            Text(entry.title)
                .font(.caption)
                .foregroundStyle(.secondary)
            ProgressView(value: Double(entry.value), total: 10000)
        }
    }

    // Lock Screen inline (single line of text beside clock)
    var inlineView: some View {
        Label("\(entry.value) \(entry.title)", systemImage: entry.icon)
    }
}

// Rendering mode for lock screen
// Lock Screen widgets are rendered in one of three modes:
// - .vibrant: tinted semi-transparent material (iOS Lock Screen)
// - .accented: tinted with user's chosen accent color (watchOS)
// - .fullColor: standard colors (Home Screen)
// Use @Environment(\.widgetRenderingMode) to adapt
```

## WidgetBundle for Multiple Widgets

```swift
@main
struct MyWidgets: WidgetBundle {
    var body: some Widget {
        SimpleWidget()
        ConfigurableWidget()
        DashboardWidget()

        if #available(iOS 18, *) {
            ControlWidget()
        }
    }
}
```

## Interactive Widgets (iOS 17+ Button/Toggle)

iOS 17 introduced interactive widgets with Button and Toggle that perform AppIntents directly from the widget.

```swift
import AppIntents

// App Intent for toggling a task
struct ToggleTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Task"

    @Parameter(title: "Task ID")
    var taskID: String

    init() {}

    init(taskID: String) {
        self.taskID = taskID
    }

    func perform() async throws -> some IntentResult {
        let store = TaskStore.shared
        store.toggleTask(id: taskID)

        // Reload the widget timeline to reflect the change
        WidgetCenter.shared.reloadTimelines(ofKind: "TaskWidget")

        return .result()
    }
}

struct IncrementCountIntent: AppIntent {
    static var title: LocalizedStringResource = "Increment Counter"

    func perform() async throws -> some IntentResult {
        CounterStore.shared.increment()
        WidgetCenter.shared.reloadTimelines(ofKind: "CounterWidget")
        return .result()
    }
}

// Widget view with interactive elements
struct InteractiveTaskWidget: View {
    let entry: DashboardEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Tasks")
                .font(.headline)

            ForEach(entry.tasks) { task in
                HStack {
                    // Interactive toggle button
                    Button(intent: ToggleTaskIntent(taskID: task.id.uuidString)) {
                        Image(systemName: task.isComplete ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(task.isComplete ? .green : .secondary)
                    }
                    .buttonStyle(.plain)

                    Text(task.name)
                        .strikethrough(task.isComplete)
                        .font(.subheadline)
                }
            }

            Spacer()

            // Interactive toggle
            Toggle(isOn: entry.completedCount > 0, intent: IncrementCountIntent()) {
                Text("Focus Mode")
            }
            .toggleStyle(.switch)
        }
        .padding()
    }
}
```

## Live Activities and ActivityKit

```swift
import ActivityKit

// Define the attributes for the Live Activity
struct DeliveryAttributes: ActivityAttributes {
    // Dynamic content that changes over time
    struct ContentState: Codable, Hashable {
        var status: String
        var estimatedArrival: Date
        var driverName: String
        var currentStep: Int  // 0: preparing, 1: picked up, 2: nearby, 3: delivered
    }

    // Static content set at creation
    let orderNumber: String
    let restaurantName: String
}

class LiveActivityManager {
    var currentActivity: Activity<DeliveryAttributes>?

    func startDeliveryTracking(orderNumber: String, restaurant: String) throws {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            print("Live Activities not enabled")
            return
        }

        let attributes = DeliveryAttributes(
            orderNumber: orderNumber,
            restaurantName: restaurant
        )

        let initialState = DeliveryAttributes.ContentState(
            status: "Preparing your order",
            estimatedArrival: .now.addingTimeInterval(1800),
            driverName: "Alex",
            currentStep: 0
        )

        let content = ActivityContent(state: initialState, staleDate: nil)

        currentActivity = try Activity.request(
            attributes: attributes,
            content: content,
            pushType: .token  // .token for server push updates, nil for local-only
        )

        // Observe push token for server-driven updates
        if let activity = currentActivity {
            Task {
                for await token in activity.pushTokenUpdates {
                    let tokenString = token.map { String(format: "%02x", $0) }.joined()
                    print("Live Activity push token: \(tokenString)")
                    // Send this token to your server
                }
            }
        }
    }

    // Update the Live Activity locally
    func updateDelivery(status: String, step: Int, eta: Date) async {
        let updatedState = DeliveryAttributes.ContentState(
            status: status,
            estimatedArrival: eta,
            driverName: "Alex",
            currentStep: step
        )
        let content = ActivityContent(state: updatedState, staleDate: nil)
        await currentActivity?.update(content)
    }

    // End the Live Activity
    func endDelivery() async {
        let finalState = DeliveryAttributes.ContentState(
            status: "Delivered!",
            estimatedArrival: .now,
            driverName: "Alex",
            currentStep: 3
        )
        let content = ActivityContent(state: finalState, staleDate: nil)

        // Dismissal policies:
        // .default          - user can dismiss manually
        // .immediate        - disappears right away
        // .after(date)      - auto-dismiss after the specified date
        await currentActivity?.end(content, dismissalPolicy: .after(.now.addingTimeInterval(300)))
    }
}

// Live Activity UI (defined in your Widget extension target)
struct DeliveryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryAttributes.self) { context in
            // Lock Screen and banner presentation
            VStack(spacing: 12) {
                HStack {
                    Text(context.attributes.restaurantName)
                        .font(.headline)
                    Spacer()
                    Text("Order #\(context.attributes.orderNumber)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                ProgressView(value: Double(context.state.currentStep), total: 3)
                    .tint(.green)

                HStack {
                    Label(context.state.status, systemImage: "bicycle")
                        .font(.subheadline)
                    Spacer()
                    Text(context.state.estimatedArrival, style: .timer)
                        .font(.subheadline.monospacedDigit())
                }
            }
            .padding()
            .activityBackgroundTint(.black.opacity(0.8))
            .activitySystemActionForegroundColor(.white)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "bicycle")
                        .font(.title2)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.estimatedArrival, style: .timer)
                        .font(.caption.monospacedDigit())
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.restaurantName)
                        .font(.headline)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 8) {
                        Text(context.state.status)
                            .font(.subheadline)
                        ProgressView(value: Double(context.state.currentStep), total: 3)
                            .tint(.green)
                    }
                }
            } compactLeading: {
                Image(systemName: "bicycle")
            } compactTrailing: {
                Text(context.state.estimatedArrival, style: .timer)
                    .font(.caption.monospacedDigit())
            } minimal: {
                Image(systemName: "bicycle")
            }
        }
    }
}
```

## App Intent Configuration

```swift
import AppIntents

// Define a configurable entity for widget parameters
struct CategoryEntity: AppEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Category")
    static var defaultQuery = CategoryQuery()

    var id: String
    var name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

struct CategoryQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [CategoryEntity] {
        allCategories().filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [CategoryEntity] {
        allCategories()
    }

    func defaultResult() async -> CategoryEntity? {
        allCategories().first
    }

    private func allCategories() -> [CategoryEntity] {
        [
            CategoryEntity(id: "work", name: "Work"),
            CategoryEntity(id: "personal", name: "Personal"),
            CategoryEntity(id: "health", name: "Health")
        ]
    }
}

// Widget configuration intent
struct SelectCategoryIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Category"
    static var description = IntentDescription("Choose which category to display in the widget.")

    @Parameter(title: "Category")
    var category: CategoryEntity?

    @Parameter(title: "Show Completed", default: true)
    var showCompleted: Bool
}
```

## Reloading Widgets from the Main App

```swift
import WidgetKit

class WidgetReloadManager {
    // Reload a specific widget by kind
    func reloadTaskWidget() {
        WidgetCenter.shared.reloadTimelines(ofKind: "TaskWidget")
    }

    // Reload all widgets belonging to this app
    func reloadAllWidgets() {
        WidgetCenter.shared.reloadAllTimelines()
    }

    // Get current widget configurations on the user's device
    func getWidgetInfo() {
        WidgetCenter.shared.getCurrentConfigurations { result in
            switch result {
            case .success(let widgets):
                for widget in widgets {
                    print("Kind: \(widget.kind), Family: \(widget.family)")
                }
            case .failure(let error):
                print("Error fetching configurations: \(error)")
            }
        }
    }
}

// Sharing data between the app and widget extension using App Groups.
// 1. Enable App Groups capability in both the app target and widget extension target
// 2. Use the shared container:

let sharedDefaults = UserDefaults(suiteName: "group.com.yourapp.shared")
sharedDefaults?.set(42, forKey: "stepCount")

let sharedContainer = FileManager.default.containerURL(
    forSecurityApplicationGroupIdentifier: "group.com.yourapp.shared"
)
// Write/read files in sharedContainer for larger data sets
```
