import AppIntents
import Observation

/// Top-level screens Siri and Shortcuts can open. Keep in sync with the app's tabs.
enum AppScreen: String, AppEnum {
    case home
    case search
    case profile

    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Screen"
    static let caseDisplayRepresentations: [AppScreen: DisplayRepresentation] = [
        .home: "Home",
        .search: "Search",
        .profile: "Profile",
    ]
}

@MainActor
@Observable
final class IntentNavigation {
    static let shared = IntentNavigation()
    var requested: AppScreen?
}

struct OpenScreenIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Screen"
    static let description = IntentDescription("Opens the app at a screen.")
    static let openAppWhenRun = true

    @Parameter(title: "Screen")
    var screen: AppScreen

    init() {}

    init(screen: AppScreen) {
        self.screen = screen
    }

    @MainActor
    func perform() async throws -> some IntentResult {
        IntentNavigation.shared.requested = screen
        return .result()
    }
}

struct AppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenScreenIntent(),
            phrases: [
                "Open \(\.$screen) in \(.applicationName)",
                "Show \(.applicationName)",
            ],
            shortTitle: "Open",
            systemImageName: "arrow.up.forward.app"
        )
    }
}
