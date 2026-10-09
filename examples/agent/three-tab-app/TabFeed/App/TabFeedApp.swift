import SwiftData
import SwiftUI

@main
struct TabFeedApp: App {
    private let container: Result<ModelContainer, Error>

    init() {
        do {
            container = .success(try Self.makeContainer())
        } catch {
            container = .failure(error)
        }
    }

    /// The persistent store in production. A `-ios-agent-sample-data YES` launch gets an isolated
    /// in-memory container seeded with `SampleData`, so the real store is never read or modified.
    private static func makeContainer() throws -> ModelContainer {
        let types: [any PersistentModel.Type] = [FeedCard.self, UserProfile.self]
        guard AgentLaunch.usesSampleData else {
            return try PersistenceController.container(for: types)
        }
        let demo = try PersistenceController.container(for: types, inMemory: true)
        try SampleData.seed(into: demo.mainContext)
        return demo
    }

    var body: some Scene {
        WindowGroup {
            switch container {
            case .success(let container):
                SplashContainer { RootView() }
                    .modelContainer(container)
                    .tint(AppColor.primary)
                    .appAppearance()
            case .failure(let error):
                AppErrorStateView(
                    title: "Storage Unavailable",
                    message: error.localizedDescription,
                    retryTitle: "Quit and Reopen",
                    retry: {}
                )
                .fontDesign(AppTheme.fontDesign)
            }
        }
    }
}
