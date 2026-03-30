# WidgetKit

## Widget Protocol and WidgetBundle

```swift
import WidgetKit
import SwiftUI

// Single widget
struct MyWidget: Widget {
    let kind: String = "MyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MyTimelineProvider()) { entry in
            MyWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("My Widget")
        .description("Shows important information at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge,
                            .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

// Multiple widgets bundled together
@main
struct MyWidgetBundle: WidgetBundle {
    var body: some Widget {
        MyWidget()
        StatsWidget()
        QuoteWidget()
    }
}
```

## TimelineProvider

```swift
struct SimpleEntry: TimelineEntry {
    let date: Date
    let title: String
    let value: Int
    let trend: Trend

    enum Trend {
        case up, down, flat
    }
}

struct MyTimelineProvider: TimelineProvider {

    // Placeholder for widget gallery
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), title: "Loading...", value: 0, trend: .flat)
    }

    // Quick snapshot for transitions and gallery preview
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        if context.isPreview {
            // Use sample data for preview
            completion(SimpleEntry(date: Date(), title: "Steps", value: 8432, trend: .up))
        } else {
            // Fetch real data
            Task {
                let entry = await fetchCurrentEntry()
                completion(entry)
            }
        }
    }

    // Timeline of entries for the widget to display over time
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        Task {
            let currentEntry = await fetchCurrentEntry()

            // Create entries for the next few hours
            var entries: [SimpleEntry] = [currentEntry]

            for hourOffset in 1...4 {
                let futureDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: Date())!
                let entry = SimpleEntry(date: futureDate, title: "Steps", value: currentEntry.value, trend: .flat)
                entries.append(entry)
            }

            // Refresh policy: after the last entry, or at a specific date
            let timeline = Timeline(entries: entries, policy: .atEnd)
            // .atEnd — refresh when all entries consumed
            // .after(date) — refresh at specific date
            // .never — don't refresh automatically
            completion(timeline)
        }
    }

    private func fetchCurrentEntry() async -> SimpleEntry {
        // Fetch from shared data (App Groups, network, etc.)
        SimpleEntry(date: Date(), title: "Steps", value: 8432, trend: .up)
    }
}
```

## Widget View and Families

```swift
struct MyWidgetEntryView: View {
    var entry: SimpleEntry

    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            smallWidget
        case .systemMedium:
            mediumWidget
        case .systemLarge:
            largeWidget
        case .accessoryCircular:
            circularWidget
        case .accessoryRectangular:
            rectangularWidget
        case .accessoryInline:
            inlineWidget
        default:
            smallWidget
        }
    }

    var smallWidget: some View {
        VStack(alignment: .leading) {
            Text(entry.title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text("\(entry.value)")
                .font(.system(.title, design: .rounded, weight: .bold))
            Spacer()
            HStack {
                Image(systemName: trendIcon)
                Text(entry.date, style: .time)
                    .font(.caption2)
            }
            .foregroundStyle(.secondary)
        }
        .padding()
    }

    var mediumWidget: some View {
        HStack {
            smallWidget
            Divider()
            // Additional content for medium
            VStack {
                Text("Today's Goal")
                    .font(.caption)
                ProgressView(value: Double(entry.value) / 10000)
                    .tint(.green)
                Text("\(entry.value) / 10,000")
                    .font(.caption2)
            }
            .padding()
        }
    }

    var largeWidget: some View {
        VStack(alignment: .leading, spacing: 12) {
            mediumWidget
            Divider()
            Text("Weekly Summary")
                .font(.headline)
            // Chart or detailed data
        }
    }

    private var trendIcon: String {
        switch entry.trend {
        case .up: return "arrow.up.right"
        case .down: return "arrow.down.right"
        case .flat: return "arrow.right"
        }
    }
}
```

## Lock Screen Widgets

```swift
// Accessory widgets for Lock Screen and Apple Watch
var circularWidget: some View {
    ZStack {
        AccessoryWidgetBackground()
        VStack(spacing: 0) {
            Image(systemName: "figure.walk")
                .font(.caption)
            Text("\(entry.value)")
                .font(.system(.body, design: .rounded, weight: .bold))
                .minimumScaleFactor(0.5)
        }
    }
}

var rectangularWidget: some View {
    VStack(alignment: .leading) {
        HStack {
            Image(systemName: "figure.walk")
            Text(entry.title)
        }
        .font(.caption)
        Text("\(entry.value)")
            .font(.system(.title3, design: .rounded, weight: .bold))
        ProgressView(value: Double(entry.value) / 10000)
    }
}

var inlineWidget: some View {
    HStack {
        Image(systemName: "figure.walk")
        Text("\(entry.value) steps")
    }
}
```

## IntentConfiguration for Configurable Widgets

```swift
import AppIntents

// Define the configuration intent
struct SelectCategoryIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Category"
    static var description = IntentDescription("Choose which category to display.")

    @Parameter(title: "Category", default: .steps)
    var category: HealthCategory
}

enum HealthCategory: String, AppEnum {
    case steps, calories, distance, heartRate

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Category")
    static var caseDisplayRepresentations: [HealthCategory: DisplayRepresentation] = [
        .steps: "Steps",
        .calories: "Calories",
        .distance: "Distance",
        .heartRate: "Heart Rate",
    ]
}

// Configurable timeline provider
struct ConfigurableProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), title: "Loading...", value: 0, trend: .flat)
    }

    func snapshot(for configuration: SelectCategoryIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), title: configuration.category.rawValue, value: 8432, trend: .up)
    }

    func timeline(for configuration: SelectCategoryIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let entry = SimpleEntry(
            date: Date(),
            title: configuration.category.rawValue,
            value: await fetchValue(for: configuration.category),
            trend: .up
        )
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
    }

    private func fetchValue(for category: HealthCategory) async -> Int {
        // Fetch real data
        return 8432
    }
}

// Configurable widget
struct ConfigurableWidget: Widget {
    let kind = "ConfigurableWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectCategoryIntent.self, provider: ConfigurableProvider()) { entry in
            MyWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Health Stats")
        .description("Choose a health metric to track.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

## Live Activities and ActivityKit

```swift
import ActivityKit

// Define activity attributes
struct DeliveryAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var estimatedArrival: Date
        var driverName: String
        var currentStep: Int
    }

    var orderNumber: String
    var restaurantName: String
}

// Start a Live Activity
func startDeliveryActivity(orderNumber: String, restaurant: String) throws -> Activity<DeliveryAttributes>? {
    guard ActivityAuthorizationInfo().areActivitiesEnabled else { return nil }

    let attributes = DeliveryAttributes(orderNumber: orderNumber, restaurantName: restaurant)
    let initialState = DeliveryAttributes.ContentState(
        status: "Preparing",
        estimatedArrival: Date().addingTimeInterval(2400),
        driverName: "Alex",
        currentStep: 1
    )

    let content = ActivityContent(state: initialState, staleDate: Date().addingTimeInterval(3600))
    return try Activity.request(attributes: attributes, content: content, pushType: .token)
}

// Update a Live Activity
func updateDeliveryActivity(activity: Activity<DeliveryAttributes>, newStatus: String, step: Int) async {
    let updatedState = DeliveryAttributes.ContentState(
        status: newStatus,
        estimatedArrival: Date().addingTimeInterval(1200),
        driverName: "Alex",
        currentStep: step
    )
    let content = ActivityContent(state: updatedState, staleDate: nil)
    await activity.update(content)
}

// End a Live Activity
func endDeliveryActivity(activity: Activity<DeliveryAttributes>) async {
    let finalState = DeliveryAttributes.ContentState(
        status: "Delivered",
        estimatedArrival: Date(),
        driverName: "Alex",
        currentStep: 4
    )
    let content = ActivityContent(state: finalState, staleDate: nil)
    await activity.end(content, dismissalPolicy: .after(.now + 300))
}

// Live Activity widget UI
struct DeliveryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryAttributes.self) { context in
            // Lock Screen / Banner UI
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(context.attributes.restaurantName)
                        .font(.headline)
                    Spacer()
                    Text(context.state.status)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                ProgressView(value: Double(context.state.currentStep) / 4.0)
                    .tint(.green)
                Text("ETA: \(context.state.estimatedArrival, style: .timer)")
                    .font(.caption)
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "bicycle")
                        .font(.title2)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.estimatedArrival, style: .timer)
                        .font(.caption)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: Double(context.state.currentStep) / 4.0)
                        .tint(.green)
                }
            } compactLeading: {
                Image(systemName: "bicycle")
            } compactTrailing: {
                Text(context.state.estimatedArrival, style: .timer)
                    .font(.caption)
            } minimal: {
                Image(systemName: "bicycle")
            }
        }
    }
}
```

## Interactive Widgets (iOS 17+)

```swift
import AppIntents
import SwiftUI
import WidgetKit

// Define an app intent for the button action
struct ToggleTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Task"

    @Parameter(title: "Task ID")
    var taskID: String

    func perform() async throws -> some IntentResult {
        // Toggle the task in your data store
        let store = SharedDataStore.shared
        store.toggleTask(id: taskID)

        // Reload widget timeline
        WidgetCenter.shared.reloadTimelines(ofKind: "TaskWidget")
        return .result()
    }
}

// Interactive widget view with Button and Toggle
struct InteractiveTaskWidget: View {
    let tasks: [TaskItem]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Tasks")
                .font(.headline)
            ForEach(tasks) { task in
                HStack {
                    // Interactive button inside widget
                    Button(intent: ToggleTaskIntent(taskID: task.id)) {
                        Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(task.isCompleted ? .green : .secondary)
                    }
                    .buttonStyle(.plain)

                    Text(task.title)
                        .strikethrough(task.isCompleted)
                        .foregroundStyle(task.isCompleted ? .secondary : .primary)
                }
            }
        }
        .padding()
    }
}

// Reload widgets from the main app
func notifyWidgets() {
    WidgetCenter.shared.reloadAllTimelines()
    // Or specific widget:
    // WidgetCenter.shared.reloadTimelines(ofKind: "TaskWidget")
}

struct TaskItem: Identifiable {
    let id: String
    let title: String
    let isCompleted: Bool
}

class SharedDataStore {
    static let shared = SharedDataStore()
    func toggleTask(id: String) { /* Update via App Groups UserDefaults or SwiftData */ }
}
```
