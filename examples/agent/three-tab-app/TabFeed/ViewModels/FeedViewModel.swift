import Foundation
import Observation

@MainActor @Observable
final class FeedViewModel {
    private let store: any CardStoring

    var isLoading = true
    var errorMessage: String?

    init(store: any CardStoring) {
        self.store = store
    }

    func start() {
        isLoading = true
        errorMessage = nil
        do {
            try store.seedIfNeeded()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func toggleFavorite(_ card: FeedCard) {
        do {
            try store.toggleFavorite(card)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

enum CardSearch {
    static func filter(_ cards: [FeedCard], query: String) -> [FeedCard] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }
        return cards.filter {
            $0.title.localizedStandardContains(trimmed) || $0.body.localizedStandardContains(trimmed)
        }
    }
}
