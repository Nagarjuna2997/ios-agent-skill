# TipKit

TipKit is Apple's framework for creating contextual, rule-based tips that educate users about features in your app. Tips appear as inline views or popovers and are managed by a centralized system that handles display frequency, eligibility rules, and synchronization across devices via iCloud.

## Tip Protocol (Title, Message, Image, Actions)

Define tips by conforming to the `Tip` protocol. Each tip has a title, optional message, image, and action buttons.

```swift
import TipKit

struct FavoritesTip: Tip {
    // Required: the tip title
    var title: Text {
        Text("Save Your Favorites")
    }

    // Optional: detailed message
    var message: Text? {
        Text("Tap the heart icon to save articles for later reading.")
    }

    // Optional: leading image
    var image: Image? {
        Image(systemName: "heart.fill")
    }

    // Optional: action buttons
    var actions: [Action] {
        Action(id: "learn-more", title: "Learn More")
        Action(id: "dismiss", title: "Got It")
    }
}

struct ShareTip: Tip {
    var title: Text {
        Text("Share with Friends")
    }

    var message: Text? {
        Text("Use the share button to send articles to friends and family.")
    }

    var image: Image? {
        Image(systemName: "square.and.arrow.up")
    }
}

struct FilterTip: Tip {
    var title: Text {
        Text("Filter Your Feed")
    }

    var message: Text? {
        Text("Swipe down to reveal filter options and find exactly what you need.")
    }

    var image: Image? {
        Image(systemName: "line.3.horizontal.decrease.circle")
    }
}
```

## TipView and popoverTip Modifier

Display tips as inline views or popovers attached to any SwiftUI element.

```swift
import SwiftUI
import TipKit

struct ArticleListView: View {
    let favoritesTip = FavoritesTip()
    let shareTip = ShareTip()
    let filterTip = FilterTip()
    let articles: [Article]

    var body: some View {
        NavigationStack {
            List {
                // Inline tip — appears as a row in the list
                TipView(favoritesTip) { action in
                    if action.id == "learn-more" {
                        // Handle action
                    } else if action.id == "dismiss" {
                        favoritesTip.invalidate(reason: .actionPerformed)
                    }
                }

                ForEach(articles) { article in
                    ArticleRow(article: article)
                }
            }
            .navigationTitle("Articles")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        // Share action
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                    }
                    // Popover tip — anchored to the share button
                    .popoverTip(shareTip, arrowEdge: .top)
                }

                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        // Filter action
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                    .popoverTip(filterTip)
                }
            }
        }
    }
}

// Customizing tip appearance
struct StyledTipView: View {
    let tip = FavoritesTip()

    var body: some View {
        VStack {
            // Style the inline TipView
            TipView(tip)
                .tipBackground(Color.blue.opacity(0.1))

            // Popover tip on custom view
            Image(systemName: "heart")
                .font(.largeTitle)
                .popoverTip(tip, arrowEdge: .bottom) { action in
                    if action.id == "dismiss" {
                        tip.invalidate(reason: .actionPerformed)
                    }
                }
        }
    }
}
```

## Tip Rules (Parameter-Based and Event-Based)

Rules determine when a tip is eligible for display. Combine parameter rules and event rules for precise targeting.

```swift
import TipKit

struct ProFeatureTip: Tip {
    // Parameter-based rule — tip eligible when condition is met
    @Parameter
    static var isLoggedIn: Bool = false

    @Parameter
    static var hasUsedBasicFeatures: Bool = false

    var title: Text {
        Text("Unlock Pro Features")
    }

    var message: Text? {
        Text("Upgrade to access advanced analytics and priority support.")
    }

    var image: Image? {
        Image(systemName: "star.circle.fill")
    }

    // Rules that must ALL be true for the tip to display
    var rules: [Rule] {
        // Show only when user is logged in
        #Rule(Self.$isLoggedIn) { $0 == true }

        // Show only after user has explored basic features
        #Rule(Self.$hasUsedBasicFeatures) { $0 == true }
    }
}

// Event-based rules — tip appears after specific events occur
struct AdvancedSearchTip: Tip {
    // Define an event that can be donated multiple times
    static let searchPerformed = Event(id: "searchPerformed")

    var title: Text {
        Text("Try Advanced Search")
    }

    var message: Text? {
        Text("Use filters and operators to find exactly what you need.")
    }

    var image: Image? {
        Image(systemName: "magnifyingglass")
    }

    var rules: [Rule] {
        // Show after the user has searched at least 3 times
        #Rule(Self.searchPerformed) { event in
            event.donations.count >= 3
        }
    }
}

// Combined rules
struct WeeklyReportTip: Tip {
    static let appLaunched = Event(id: "appLaunched")

    @Parameter
    static var hasActiveSubscription: Bool = false

    var title: Text {
        Text("Check Your Weekly Report")
    }

    var message: Text? {
        Text("Your personalized weekly insights are ready to view.")
    }

    var rules: [Rule] {
        // Must have an active subscription
        #Rule(Self.$hasActiveSubscription) { $0 == true }

        // Must have launched the app at least 5 times
        #Rule(Self.appLaunched) { event in
            event.donations.count >= 5
        }
    }
}
```

## Tip.Event and Donation

Donate events to track user actions. The system evaluates event-based rules against accumulated donations.

```swift
import TipKit
import SwiftUI

struct SearchView: View {
    @State private var searchText = ""
    let advancedSearchTip = AdvancedSearchTip()

    var body: some View {
        VStack {
            HStack {
                TextField("Search...", text: $searchText)
                    .textFieldStyle(.roundedBorder)

                Button("Search") {
                    performSearch()
                }
                .popoverTip(advancedSearchTip)
            }
            .padding()
        }
    }

    private func performSearch() {
        // Donate the event each time the user searches
        Task {
            await AdvancedSearchTip.searchPerformed.donate()
        }

        // Perform the actual search...
    }
}

// Donate events with associated values for richer rules
struct PurchaseTip: Tip {
    static let itemViewed = Event(id: "itemViewed")

    var title: Text {
        Text("Ready to Buy?")
    }

    var message: Text? {
        Text("Items in your recently viewed list are available at a discount.")
    }

    var rules: [Rule] {
        // Show after viewing 5+ items within the last 3 days
        #Rule(Self.itemViewed) { event in
            event.donations.filter {
                $0.date > Date.now.addingTimeInterval(-3 * 24 * 60 * 60)
            }.count >= 5
        }
    }
}

// Donating the event
func userViewedItem(_ item: Item) {
    Task {
        await PurchaseTip.itemViewed.donate()
    }
}
```

## MaxDisplayCount and Display Frequency

Control how often tips appear to prevent user fatigue.

```swift
import TipKit

struct DailyTip: Tip {
    var title: Text {
        Text("Daily Insight")
    }

    var message: Text? {
        Text("Check your daily statistics in the dashboard.")
    }

    // Limit how many times this specific tip is shown
    var options: [TipOption] {
        // Show this tip a maximum of 3 times
        MaxDisplayCount(3)
    }
}

struct OneTimeTip: Tip {
    var title: Text {
        Text("Welcome!")
    }

    var message: Text? {
        Text("Swipe through to explore all features.")
    }

    var options: [TipOption] {
        // Show only once
        MaxDisplayCount(1)
    }
}
```

## Tips.configure() Setup

Configure TipKit when your app launches. This sets global display frequency and data store options.

```swift
import SwiftUI
import TipKit

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .task {
                    configureTips()
                }
        }
    }

    private func configureTips() {
        do {
            try Tips.configure([
                // How often any tip can appear across the app
                .displayFrequency(.daily),

                // Use .immediate for testing (shows tips right away)
                // .displayFrequency(.immediate),

                // Data store location — use .applicationDefault for production
                .datastoreLocation(.applicationDefault)
            ])
        } catch {
            print("Failed to configure TipKit: \(error)")
        }
    }
}

// Display frequency options:
// .immediate    — no delay between tips (best for testing)
// .hourly       — at most one tip per hour
// .daily        — at most one tip per day
// .weekly       — at most one tip per week
// .monthly      — at most one tip per month
```

## Invalidation and Status

Invalidate tips when users complete the associated action, or check tip status programmatically.

```swift
import TipKit
import SwiftUI

struct FeatureView: View {
    let featureTip = FavoritesTip()

    var body: some View {
        VStack {
            TipView(featureTip)

            Button("Add to Favorites") {
                addToFavorites()

                // Invalidate the tip — it won't appear again
                featureTip.invalidate(reason: .actionPerformed)
            }

            Button("Dismiss Tip") {
                // Tip can potentially reappear in the future
                featureTip.invalidate(reason: .tipClosed)
            }
        }
    }

    private func addToFavorites() {
        // Perform the action...
    }
}

// Check tip status programmatically
struct ConditionalTipView: View {
    let tip = ShareTip()

    var body: some View {
        VStack {
            switch tip.status {
            case .available:
                TipView(tip)
            case .invalidated(let reason):
                switch reason {
                case .actionPerformed:
                    Text("You've already used this feature!")
                        .foregroundStyle(.green)
                case .tipClosed:
                    EmptyView()
                case .maxDisplayCountExceeded:
                    EmptyView()
                default:
                    EmptyView()
                }
            case .pending:
                // Rules not yet met
                EmptyView()
            }
        }
    }
}

// Reset all tips (useful for testing or settings screen)
func resetAllTips() {
    try? Tips.resetDatastore()
}

// Show all tips immediately (testing)
func showAllTipsForTesting() {
    try? Tips.configure([
        .displayFrequency(.immediate),
        .datastoreLocation(.applicationDefault)
    ])
}
```

## Updating Parameters at Runtime

Set parameters dynamically as the user interacts with your app.

```swift
import TipKit
import SwiftUI

struct LoginView: View {
    var body: some View {
        Button("Log In") {
            performLogin()
        }
    }

    private func performLogin() {
        // After successful login, update the parameter
        ProFeatureTip.isLoggedIn = true
    }
}

struct OnboardingCompletionView: View {
    var body: some View {
        Button("Complete Setup") {
            completeOnboarding()
        }
    }

    private func completeOnboarding() {
        ProFeatureTip.hasUsedBasicFeatures = true
    }
}

struct AppLaunchHandler {
    static func trackLaunch() {
        Task {
            await WeeklyReportTip.appLaunched.donate()
        }
    }
}
```

## Complete Onboarding Tips Example

A full onboarding flow using TipKit with sequential tips that guide users through key features.

```swift
import TipKit
import SwiftUI

// MARK: - Onboarding Tips Definition

struct WelcomeTip: Tip {
    var title: Text { Text("Welcome to ReadIt") }
    var message: Text? { Text("Discover a curated feed of articles tailored to your interests.") }
    var image: Image? { Image(systemName: "hand.wave.fill") }
    var options: [TipOption] { MaxDisplayCount(1) }
}

struct SwipeActionTip: Tip {
    static let articleViewed = Event(id: "articleViewed")

    var title: Text { Text("Swipe for Quick Actions") }
    var message: Text? { Text("Swipe left on any article to save, share, or archive it.") }
    var image: Image? { Image(systemName: "hand.draw.fill") }
    var options: [TipOption] { MaxDisplayCount(2) }

    var rules: [Rule] {
        #Rule(Self.articleViewed) { $0.donations.count >= 2 }
    }
}

struct PersonalizeTip: Tip {
    static let savedArticle = Event(id: "savedArticle")

    @Parameter
    static var hasCompletedOnboarding: Bool = false

    var title: Text { Text("Personalize Your Feed") }
    var message: Text? { Text("Go to Settings to select your favorite topics and sources.") }
    var image: Image? { Image(systemName: "slider.horizontal.3") }
    var options: [TipOption] { MaxDisplayCount(1) }

    var actions: [Action] {
        Action(id: "go-to-settings", title: "Open Settings")
    }

    var rules: [Rule] {
        #Rule(Self.$hasCompletedOnboarding) { $0 == true }
        #Rule(Self.savedArticle) { $0.donations.count >= 1 }
    }
}

// MARK: - Main View with Onboarding Tips

struct OnboardingArticleListView: View {
    let welcomeTip = WelcomeTip()
    let swipeActionTip = SwipeActionTip()
    let personalizeTip = PersonalizeTip()

    @State private var articles: [Article] = Article.sampleData
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            List {
                // Welcome tip at the top
                TipView(welcomeTip)

                // Personalize tip with action handler
                TipView(personalizeTip) { action in
                    if action.id == "go-to-settings" {
                        showSettings = true
                        personalizeTip.invalidate(reason: .actionPerformed)
                    }
                }

                ForEach(articles) { article in
                    ArticleRowView(article: article)
                        .onTapGesture {
                            Task {
                                await SwipeActionTip.articleViewed.donate()
                            }
                        }
                        .swipeActions(edge: .trailing) {
                            Button {
                                saveArticle(article)
                            } label: {
                                Label("Save", systemImage: "bookmark")
                            }
                            .tint(.blue)

                            Button {
                                // Share
                            } label: {
                                Label("Share", systemImage: "square.and.arrow.up")
                            }
                            .tint(.green)
                        }
                }
            }
            .navigationTitle("ReadIt")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                    .popoverTip(swipeActionTip)
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
        }
    }

    private func saveArticle(_ article: Article) {
        Task {
            await PersonalizeTip.savedArticle.donate()
        }
    }
}

// MARK: - Supporting Views

struct ArticleRowView: View {
    let article: Article

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(article.title)
                .font(.headline)
            Text(article.summary)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            HStack {
                Text(article.source)
                    .font(.caption)
                    .foregroundStyle(.blue)
                Spacer()
                Text(article.date, style: .relative)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Topics") {
                    ForEach(["Technology", "Science", "Design", "Business"], id: \.self) { topic in
                        Toggle(topic, isOn: .constant(false))
                    }
                }

                Section("Debug") {
                    Button("Reset All Tips") {
                        try? Tips.resetDatastore()
                    }
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        PersonalizeTip.hasCompletedOnboarding = true
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Data Model

struct Article: Identifiable {
    let id = UUID()
    let title: String
    let summary: String
    let source: String
    let date: Date

    static var sampleData: [Article] {
        [
            Article(title: "SwiftUI 6 Announced", summary: "Apple reveals major updates to SwiftUI at WWDC.", source: "Apple Newsroom", date: .now.addingTimeInterval(-3600)),
            Article(title: "The Future of AI", summary: "How artificial intelligence is reshaping every industry.", source: "Tech Review", date: .now.addingTimeInterval(-7200)),
            Article(title: "Design Systems at Scale", summary: "Building consistent design systems for large organizations.", source: "Design Weekly", date: .now.addingTimeInterval(-10800))
        ]
    }
}

// MARK: - App Entry Point

@main
struct ReadItApp: App {
    var body: some Scene {
        WindowGroup {
            OnboardingArticleListView()
                .task {
                    try? Tips.configure([
                        .displayFrequency(.immediate),
                        .datastoreLocation(.applicationDefault)
                    ])
                }
        }
    }
}
```

## Key Considerations

- **Availability**: TipKit requires iOS 17+, macOS 14+, watchOS 10+, tvOS 17+.
- **iCloud sync**: Tip state syncs across devices via iCloud by default. A tip dismissed on iPhone won't reappear on iPad.
- **Display frequency**: Set at the global level via `Tips.configure()`. Individual tips respect `MaxDisplayCount` independently.
- **Testing**: Use `Tips.resetDatastore()` to clear all tip state. Use `.displayFrequency(.immediate)` during development.
- **Invalidation reasons**: `.actionPerformed` means the user completed the action (permanent). `.tipClosed` means the user dismissed the tip (may reappear if display count allows).
- **Performance**: Tips are lightweight. The system evaluates rules lazily and only renders tips when eligible.
- **Accessibility**: TipKit views automatically support VoiceOver and Dynamic Type.
