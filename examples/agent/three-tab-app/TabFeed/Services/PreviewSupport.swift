import Foundation
import SwiftData

/// In-memory data for #Preview blocks. Needs no network or disk.
@MainActor
enum PreviewSupport {
    static func container() -> ModelContainer {
        PersistenceController.preview(for: [FeedCard.self, UserProfile.self])
    }

    /// An in-memory container already holding the plan's sample cards and profile.
    static func seededContainer() -> ModelContainer {
        let result = container()
        do {
            try SampleData.seed(into: result.mainContext)
        } catch {
            assertionFailure("Preview seed failed: \(error)")
        }
        return result
    }

    static func feedViewModel(in container: ModelContainer) -> FeedViewModel {
        let model = FeedViewModel(store: SwiftDataCardStore(context: container.mainContext))
        model.start()
        return model
    }

    static func profileViewModel(in container: ModelContainer) -> ProfileViewModel {
        let model = ProfileViewModel(store: SwiftDataProfileStore(context: container.mainContext))
        model.load()
        return model
    }

    static func editingProfileViewModel(in container: ModelContainer) -> ProfileViewModel {
        let model = profileViewModel(in: container)
        model.beginEditing()
        return model
    }

    /// The newest card stored in `container`, or a detached sample when the container is empty.
    static func firstCard(in container: ModelContainer) -> FeedCard {
        var descriptor = FetchDescriptor<FeedCard>(sortBy: [SortDescriptor(\FeedCard.createdAt, order: .reverse)])
        descriptor.fetchLimit = 1
        let fetched = try? container.mainContext.fetch(descriptor)
        return fetched?.first ?? SampleData.feedCards[0]
    }
}
