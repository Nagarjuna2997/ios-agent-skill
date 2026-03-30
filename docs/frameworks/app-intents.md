# App Intents

App Intents is Apple's modern framework for exposing app functionality to Siri, Shortcuts, Spotlight, Widgets, Focus Filters, and Apple Intelligence. It replaces SiriKit Intents with a Swift-native, protocol-driven approach that requires no intent definition files.

## AppIntent Protocol and perform()

Every App Intent conforms to the `AppIntent` protocol and implements a `perform()` method that returns an `IntentResult`.

```swift
import AppIntents

struct OpenArticleIntent: AppIntent {
    // Title shown in Shortcuts and Siri
    static var title: LocalizedStringResource = "Open Article"
    static var description: IntentDescription = "Opens a specific article in the app."

    // The system can open your app when this intent runs
    static var openAppWhenRun: Bool = true

    @Parameter(title: "Article Name")
    var articleName: String

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // Look up the article and navigate to it
        guard let article = ArticleStore.shared.find(byName: articleName) else {
            throw ArticleError.notFound(articleName)
        }

        NavigationManager.shared.navigate(to: article)

        return .result(dialog: "Opening \"\(article.title)\"")
    }
}

enum ArticleError: Error, CustomLocalizedStringResourceConvertible {
    case notFound(String)

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .notFound(let name):
            return "Could not find article \"\(name)\""
        }
    }
}
```

## @Parameter Property Wrapper

Parameters define the inputs for your intent. They support default values, validation, and dynamic options.

```swift
import AppIntents

struct CreateReminderIntent: AppIntent {
    static var title: LocalizedStringResource = "Create Reminder"

    @Parameter(title: "Title", description: "The reminder title")
    var title: String

    @Parameter(title: "Due Date", description: "When the reminder is due")
    var dueDate: Date?

    @Parameter(
        title: "Priority",
        description: "Reminder priority level",
        default: .medium
    )
    var priority: ReminderPriority

    @Parameter(
        title: "Tags",
        description: "Tags to apply",
        optionsProvider: TagOptionsProvider()
    )
    var tags: [String]

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let reminder = Reminder(
            title: title,
            dueDate: dueDate,
            priority: priority,
            tags: tags
        )
        try await ReminderStore.shared.save(reminder)
        return .result(dialog: "Created reminder: \(title)")
    }
}

// Enum parameter with automatic case display
enum ReminderPriority: String, AppEnum {
    case low, medium, high, urgent

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Priority")

    static var caseDisplayRepresentations: [ReminderPriority: DisplayRepresentation] = [
        .low: "Low",
        .medium: "Medium",
        .high: "High",
        .urgent: "Urgent"
    ]
}

// Dynamic options provider for parameter suggestions
struct TagOptionsProvider: DynamicOptionsProvider {
    func results() async throws -> [String] {
        await TagStore.shared.allTags().map(\.name)
    }
}
```

## IntentDialog and IntentResult

Intents return results that can include dialogs, snippets (SwiftUI views), and values.

```swift
import AppIntents
import SwiftUI

struct CheckWeatherIntent: AppIntent {
    static var title: LocalizedStringResource = "Check Weather"

    @Parameter(title: "City")
    var city: String

    // Return multiple result types with protocols
    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView & ReturnsValue<String> {
        let weather = try await WeatherService.shared.fetch(for: city)

        let summary = "\(weather.condition) — \(weather.temperature)°F"

        return .result(
            value: summary,
            dialog: IntentDialog(stringLiteral: "It's \(summary) in \(city)."),
            view: WeatherSnippetView(weather: weather)
        )
    }
}

struct WeatherSnippetView: View {
    let weather: WeatherData

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: weather.symbolName)
                .font(.largeTitle)
                .foregroundStyle(.blue)
            VStack(alignment: .leading) {
                Text("\(weather.temperature)°F")
                    .font(.title.bold())
                Text(weather.condition)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}

struct WeatherData {
    let temperature: Int
    let condition: String
    let symbolName: String
}
```

## AppShortcutsProvider for Siri and Shortcuts

Expose your intents as system shortcuts that appear in Siri, the Shortcuts app, and Spotlight without user configuration.

```swift
import AppIntents

struct AppShortcuts: AppShortcutsProvider {
    // The App Shortcuts the system surfaces automatically
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenArticleIntent(),
            phrases: [
                "Open \(\.$articleName) in \(.applicationName)",
                "Show article \(\.$articleName) in \(.applicationName)",
                "Read \(\.$articleName) with \(.applicationName)"
            ],
            shortTitle: "Open Article",
            systemImageName: "doc.richtext"
        )

        AppShortcut(
            intent: CreateReminderIntent(),
            phrases: [
                "Create a reminder in \(.applicationName)",
                "Add a reminder with \(.applicationName)",
                "Remind me in \(.applicationName)"
            ],
            shortTitle: "Create Reminder",
            systemImageName: "checklist"
        )

        AppShortcut(
            intent: CheckWeatherIntent(),
            phrases: [
                "Check weather in \(\.$city) with \(.applicationName)",
                "What's the weather in \(\.$city)"
            ],
            shortTitle: "Check Weather",
            systemImageName: "cloud.sun"
        )
    }
}
```

## EntityQuery for Spotlight Integration

Entities represent searchable objects in your app. EntityQuery lets Spotlight and the system find and display them.

```swift
import AppIntents
import CoreSpotlight

// Define an entity that Spotlight can index and display
struct ArticleEntity: AppEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Article")

    static var defaultQuery = ArticleQuery()

    var id: String
    var title: String
    var summary: String
    var category: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: LocalizedStringResource(stringLiteral: title),
            subtitle: LocalizedStringResource(stringLiteral: category),
            image: .init(systemName: "doc.richtext")
        )
    }
}

// Query that the system uses to find entities
struct ArticleQuery: EntityQuery {
    // Find entities by their identifiers
    func entities(for identifiers: [String]) async throws -> [ArticleEntity] {
        let articles = await ArticleStore.shared.fetchAll()
        return articles
            .filter { identifiers.contains($0.id) }
            .map { ArticleEntity(id: $0.id, title: $0.title, summary: $0.summary, category: $0.category) }
    }

    // Provide suggestions when the user is picking an entity
    func suggestedEntities() async throws -> [ArticleEntity] {
        let recent = await ArticleStore.shared.fetchRecent(limit: 10)
        return recent.map {
            ArticleEntity(id: $0.id, title: $0.title, summary: $0.summary, category: $0.category)
        }
    }
}

// Enable string-based search for entities
extension ArticleQuery: EntityStringQuery {
    func entities(matching query: String) async throws -> [ArticleEntity] {
        let results = await ArticleStore.shared.search(query)
        return results.map {
            ArticleEntity(id: $0.id, title: $0.title, summary: $0.summary, category: $0.category)
        }
    }
}

// Use entities in intents
struct ReadArticleIntent: AppIntent {
    static var title: LocalizedStringResource = "Read Article"

    @Parameter(title: "Article")
    var article: ArticleEntity

    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        NavigationManager.shared.navigateToArticle(id: article.id)
        return .result(dialog: "Opening \"\(article.title)\"")
    }
}
```

## AppIntents for Widgets (WidgetConfigurationIntent)

Use `WidgetConfigurationIntent` to let users configure widgets through the App Intents system.

```swift
import AppIntents
import WidgetKit
import SwiftUI

// Widget configuration intent — users pick options in the widget editor
struct SelectCategoryIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Category"
    static var description: IntentDescription = "Choose which category to display."

    @Parameter(title: "Category", default: .all)
    var category: WidgetCategory

    @Parameter(title: "Show Count", default: true)
    var showCount: Bool

    @Parameter(title: "Max Items", default: 5)
    var maxItems: Int
}

enum WidgetCategory: String, AppEnum {
    case all, favorites, recent, trending

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Category")

    static var caseDisplayRepresentations: [WidgetCategory: DisplayRepresentation] = [
        .all: DisplayRepresentation(title: "All", image: .init(systemName: "square.grid.2x2")),
        .favorites: DisplayRepresentation(title: "Favorites", image: .init(systemName: "star.fill")),
        .recent: DisplayRepresentation(title: "Recent", image: .init(systemName: "clock")),
        .trending: DisplayRepresentation(title: "Trending", image: .init(systemName: "flame"))
    ]
}

// Widget using the configuration intent
struct CategoryWidget: Widget {
    let kind = "CategoryWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: SelectCategoryIntent.self,
            provider: CategoryProvider()
        ) { entry in
            CategoryWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Category")
        .description("Shows items from a selected category.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct CategoryEntry: TimelineEntry {
    let date: Date
    let category: WidgetCategory
    let items: [String]
    let showCount: Bool
}

struct CategoryProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> CategoryEntry {
        CategoryEntry(date: .now, category: .all, items: ["Loading..."], showCount: true)
    }

    func snapshot(for configuration: SelectCategoryIntent, in context: Context) async -> CategoryEntry {
        CategoryEntry(date: .now, category: configuration.category, items: ["Sample Item"], showCount: configuration.showCount)
    }

    func timeline(for configuration: SelectCategoryIntent, in context: Context) async -> Timeline<CategoryEntry> {
        let items = await fetchItems(for: configuration.category, limit: configuration.maxItems)
        let entry = CategoryEntry(
            date: .now,
            category: configuration.category,
            items: items,
            showCount: configuration.showCount
        )
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: .now)!
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }

    private func fetchItems(for category: WidgetCategory, limit: Int) async -> [String] {
        return ["Item 1", "Item 2", "Item 3"]
    }
}

struct CategoryWidgetView: View {
    let entry: CategoryEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.category.rawValue.capitalized)
                    .font(.headline)
                if entry.showCount {
                    Spacer()
                    Text("\(entry.items.count)")
                        .font(.caption.bold())
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.blue.opacity(0.2))
                        .clipShape(Capsule())
                }
            }
            ForEach(entry.items, id: \.self) { item in
                Text(item)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
```

## AppIntents for Focus Filters

Let users customize your app's behavior when a specific Focus mode is active.

```swift
import AppIntents

struct AppFocusFilter: SetFocusFilterIntent {
    static var title: LocalizedStringResource = "Set App Focus Filter"
    static var description: IntentDescription = "Customize which content is shown during Focus."

    @Parameter(title: "Show Notifications", default: true)
    var showNotifications: Bool

    @Parameter(title: "Category Filter")
    var category: WidgetCategory?

    @Parameter(title: "Mute Sounds", default: false)
    var muteSounds: Bool

    // The display representation shown in Focus settings
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "App Focus",
            subtitle: category.map { "Showing \($0.rawValue)" } ?? "All content",
            image: .init(systemName: "app.badge")
        )
    }

    func perform() async throws -> some IntentResult {
        // Apply the focus configuration to your app
        await FocusManager.shared.apply(
            showNotifications: showNotifications,
            category: category,
            muteSounds: muteSounds
        )
        return .result()
    }
}
```

## Apple Intelligence Integration (SiriKit to App Intents Migration)

App Intents is the foundation for Apple Intelligence features. Migrate from SiriKit to App Intents to enable AI-powered interactions.

```swift
import AppIntents

// Assistive intent that Apple Intelligence can invoke contextually
struct SendMessageIntent: AppIntent {
    static var title: LocalizedStringResource = "Send Message"
    static var description: IntentDescription = IntentDescription(
        "Send a message to a contact.",
        categoryName: "Messaging"
    )

    // Apple Intelligence can extract these from natural language
    @Parameter(title: "Recipient")
    var recipient: ContactEntity

    @Parameter(title: "Message")
    var message: String

    // Confirmation dialog before performing a sensitive action
    static var isDiscoverable: Bool = true

    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await MessageService.shared.send(message, to: recipient.id)
        return .result(dialog: "Message sent to \(recipient.name).")
    }
}

// Contact entity for Apple Intelligence to reference
struct ContactEntity: AppEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Contact")
    static var defaultQuery = ContactQuery()

    var id: String
    var name: String
    var email: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: LocalizedStringResource(stringLiteral: name),
            subtitle: LocalizedStringResource(stringLiteral: email)
        )
    }
}

struct ContactQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [ContactEntity] {
        await ContactStore.shared.fetch(ids: identifiers).map {
            ContactEntity(id: $0.id, name: $0.name, email: $0.email)
        }
    }

    func suggestedEntities() async throws -> [ContactEntity] {
        await ContactStore.shared.frequentContacts(limit: 10).map {
            ContactEntity(id: $0.id, name: $0.name, email: $0.email)
        }
    }
}

extension ContactQuery: EntityStringQuery {
    func entities(matching query: String) async throws -> [ContactEntity] {
        await ContactStore.shared.search(query).map {
            ContactEntity(id: $0.id, name: $0.name, email: $0.email)
        }
    }
}
```

## Interactive Widget Buttons with App Intents

Use App Intents to make widgets interactive with tappable buttons and toggles.

```swift
import AppIntents
import SwiftUI
import WidgetKit

// Intent performed when user taps a widget button
struct ToggleFavoriteIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Favorite"

    @Parameter(title: "Item ID")
    var itemID: String

    init() {}

    init(itemID: String) {
        self.itemID = itemID
    }

    func perform() async throws -> some IntentResult {
        await ItemStore.shared.toggleFavorite(id: itemID)
        return .result()
    }
}

// Widget view with an interactive button
struct InteractiveWidgetView: View {
    let item: WidgetItem

    var body: some View {
        VStack {
            Text(item.name)
                .font(.headline)

            // This button runs the intent directly from the widget
            Button(intent: ToggleFavoriteIntent(itemID: item.id)) {
                Image(systemName: item.isFavorite ? "star.fill" : "star")
                    .foregroundStyle(item.isFavorite ? .yellow : .gray)
            }
            .buttonStyle(.plain)
        }
    }
}

struct WidgetItem {
    let id: String
    let name: String
    let isFavorite: Bool
}
```

## Key Considerations

- **Availability**: App Intents requires iOS 16+. WidgetConfigurationIntent and Focus Filters require iOS 16+. AppShortcutsProvider requires iOS 16.4+.
- **Thread safety**: The `perform()` method can run on any thread. Use `@MainActor` when accessing UI state.
- **Error display**: Throw errors conforming to `CustomLocalizedStringResourceConvertible` so Siri and Shortcuts display meaningful messages.
- **Phrases**: Include `\(.applicationName)` in at least one phrase per AppShortcut so Siri associates the phrase with your app.
- **Testing**: Use the Shortcuts app and Siri to test intents. Use the `xcrun simctl` command to trigger intents in the simulator.
- **Migration**: SiriKit INIntent definitions can coexist with App Intents. Migrate incrementally by implementing the same functionality with App Intents and marking the SiriKit version as deprecated.
