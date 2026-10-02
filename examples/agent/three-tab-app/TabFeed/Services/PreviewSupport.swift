import SwiftData

/// In-memory data for #Preview blocks. Needs no network or disk.
@MainActor
enum PreviewSupport {
    static func container() -> ModelContainer {
        PersistenceController.preview(for: [FeedCard.self, UserProfile.self])
    }

    static func feedViewModel(in container: ModelContainer) -> FeedViewModel {
        let model = FeedViewModel(store: SwiftDataCardStore(context: container.mainContext))
        model.start()
        return model
    }

    static func profileViewModel(in container: ModelContainer) -> ProfileViewModel {
        ProfileViewModel(store: SwiftDataProfileStore(context: container.mainContext))
    }
}
