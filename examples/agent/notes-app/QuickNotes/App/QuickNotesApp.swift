import SwiftData
import SwiftUI

@main
struct QuickNotesApp: App {
    /// The persistent store in production, or an isolated in-memory demo store when the
    /// build agent launches with `-ios-agent-sample-data YES`.
    private let store: Result<ModelContainer, any Error>

    init() {
        store = Self.makeStore()
    }

    var body: some Scene {
        WindowGroup {
            switch store {
            case .success(let container):
                SplashContainer {
                    RootView()
                }
                .modelContainer(container)
            case .failure(let error):
                StorageUnavailableView(message: error.localizedDescription)
            }
        }
    }

    @MainActor
    private static func makeStore() -> Result<ModelContainer, any Error> {
        do {
            if AgentLaunch.usesSampleData {
                let container = try PersistenceController.container(for: [Note.self], inMemory: true)
                SampleData.seed(into: container.mainContext)
                return .success(container)
            }
            return .success(try PersistenceController.container(for: [Note.self]))
        } catch {
            return .failure(error)
        }
    }
}

/// Shown only when the on-device store could not be opened.
struct StorageUnavailableView: View {
    let message: String

    var body: some View {
        AppEmptyStateView(
            title: "Storage Unavailable",
            message: message,
            symbol: "externaldrive.badge.exclamationmark"
        )
        .fontDesign(AppTheme.fontDesign)
    }
}

#Preview {
    StorageUnavailableView(message: "The notes store could not be opened.")
}
