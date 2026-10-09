import Foundation
import Observation

enum FeedFilter: String, CaseIterable, Identifiable, Sendable {
    case all
    case favorites

    var id: String { rawValue }

    var title: String {
        switch self {
        case .all: "All"
        case .favorites: "Favorites"
        }
    }
}

@MainActor @Observable
final class FeedViewModel {
    private let store: any CardStoring

    var isLoading = true
    var errorMessage: String?
    var filter: FeedFilter = .all

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

    /// Applies the selected filter to the cards fetched by the view.
    func visibleCards(_ cards: [FeedCard]) -> [FeedCard] {
        switch filter {
        case .all: cards
        case .favorites: cards.filter(\.isFavorite)
        }
    }
}

enum CardSearch {
    /// Short prompts shown as chips before the user types.
    static let suggestions = ["Focus", "Sketch", "Walk", "Notes"]

    static func filter(_ cards: [FeedCard], query: String) -> [FeedCard] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }
        return cards.filter {
            $0.title.localizedStandardContains(trimmed) || $0.body.localizedStandardContains(trimmed)
        }
    }
}
