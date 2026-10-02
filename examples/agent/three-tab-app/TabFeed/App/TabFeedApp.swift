import SwiftData
import SwiftUI

@main
struct TabFeedApp: App {
    private let container: Result<ModelContainer, Error>

    init() {
        do {
            container = .success(try PersistenceController.container(for: [FeedCard.self, UserProfile.self]))
        } catch {
            container = .failure(error)
        }
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
                ContentUnavailableView(
                    "Storage Unavailable",
                    systemImage: "externaldrive.badge.exclamationmark",
                    description: Text(error.localizedDescription)
                )
            }
        }
    }
}
