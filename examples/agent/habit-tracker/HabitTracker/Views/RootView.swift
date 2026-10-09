import SwiftUI
import SwiftData

enum AppRoute: Hashable {
    case habit(UUID)
    case settings
}

struct RootView: View {
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        RootContent(store: SwiftDataHabitStore(context: modelContext))
    }
}

private struct RootContent: View {
    let store: any HabitStoring
    @Environment(\.modelContext) private var modelContext
    @State private var path: [AppRoute]

    init(store: any HabitStoring) {
        self.store = store
        // "habit-list" (the only top-level screen), nil and unknown ids all start on the list.
        let initial: [AppRoute] = AgentLaunch.requestedScreen == "settings" ? [.settings] : []
        _path = State(initialValue: initial)
    }

    var body: some View {
        NavigationStack(path: $path) {
            HabitListView(store: store)
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .habit(let id):
                        HabitDetailLoader(id: id, store: store)
                    case .settings:
                        SettingsView()
                    }
                }
        }
        .task {
            openRequestedDetailIfNeeded()
        }
    }

    /// `-ios-agent-screen habit-detail` pushes the first habit so the detail can be screenshotted.
    private func openRequestedDetailIfNeeded() {
        guard AgentLaunch.requestedScreen == "habit-detail", path.isEmpty else { return }
        var descriptor = FetchDescriptor<Habit>(sortBy: [SortDescriptor(\Habit.createdAt)])
        descriptor.fetchLimit = 1
        if let first = try? modelContext.fetch(descriptor).first {
            path = [.habit(first.id)]
        }
    }
}

#Preview {
    RootView()
        .modelContainer(SampleData.previewContainer())
}

#Preview("Empty") {
    RootView()
        .modelContainer(PersistenceController.preview(for: [Habit.self]))
}
