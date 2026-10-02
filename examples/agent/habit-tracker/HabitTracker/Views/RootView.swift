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
    @State private var path: [AppRoute]

    init(store: any HabitStoring) {
        self.store = store
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
    }
}

#Preview {
    RootView()
        .modelContainer(HabitSamples.container())
}
