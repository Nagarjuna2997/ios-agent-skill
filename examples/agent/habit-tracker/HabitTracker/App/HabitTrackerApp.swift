import SwiftUI
import SwiftData

@main
struct HabitTrackerApp: App {
    private let container: ModelContainer?
    private let loadError: String?

    init() {
        do {
            container = try PersistenceController.container(for: [Habit.self])
            loadError = nil
        } catch {
            container = nil
            loadError = error.localizedDescription
        }
    }

    var body: some Scene {
        WindowGroup {
            content
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
        }
    }
}
