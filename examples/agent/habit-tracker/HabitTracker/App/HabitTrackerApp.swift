import SwiftUI
import SwiftData

@main
struct HabitTrackerApp: App {
    private let container: ModelContainer?
    private let loadError: String?

    init() {
        do {
            if AgentLaunch.usesSampleData {
                // Demo launches get an isolated in-memory store seeded from SampleData.
                // The persistent store on disk is never opened or modified.
                container = try SampleData.container()
            } else {
                container = try PersistenceController.container(for: [Habit.self])
            }
            loadError = nil
        } catch {
            container = nil
            loadError = error.localizedDescription
        }
    }

    var body: some Scene {
        WindowGroup {
            SplashContainer {
                content
            }
            .tint(AppColor.primary)
            .appAppearance()
        }
    }

    @ViewBuilder
    private var content: some View {
        if let container {
            RootView()
                .modelContainer(container)
        } else {
            ContentUnavailableView("Couldn't Load Habits",
                                   systemImage: "exclamationmark.triangle",
                                   description: Text(loadError ?? "Unknown error"))
                .fontDesign(AppTheme.fontDesign)
        }
    }
}
