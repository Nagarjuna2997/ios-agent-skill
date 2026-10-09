import Foundation
import SwiftData

@MainActor
protocol CardStoring {
    func seedIfNeeded() throws
    func toggleFavorite(_ card: FeedCard) throws
}

@MainActor
final class SwiftDataCardStore: CardStoring {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    /// Fills an empty store with the starter cards on first launch only.
    func seedIfNeeded() throws {
        let count = try context.fetchCount(FetchDescriptor<FeedCard>())
        guard count == 0 else { return }
        for card in SampleData.feedCards {
            context.insert(card)
        }
        try context.save()
    }

    func toggleFavorite(_ card: FeedCard) throws {
        card.isFavorite.toggle()
        try context.save()
    }
}
