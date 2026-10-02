import Foundation
import SwiftData

@Model
final class FeedCard {
    var id: UUID
    var title: String
    var subtitle: String?
    var body: String
    /// Name of an SF Symbol shown as the card's artwork.
    var imageName: String?
    var createdAt: Date
    var isFavorite: Bool

    init(
        id: UUID = UUID(),
        title: String,
        subtitle: String? = nil,
        body: String,
        imageName: String? = nil,
        createdAt: Date = .now,
        isFavorite: Bool = false
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.body = body
        self.imageName = imageName
        self.createdAt = createdAt
        self.isFavorite = isFavorite
    }
}

extension FeedCard {
    static func samples(now: Date = .now) -> [FeedCard] {
        let items: [(String, String?, String, String)] = [
            ("Welcome to Tab Feed", "Your first card", "Scroll the feed, tap a card to read it, and mark the ones you love as favorites. Everything is stored on this device.", "hand.wave.fill"),
            ("Search everything", "Find cards fast", "Open the Search tab and type a word. Titles and bodies are both searched, so you can find a card even if you only remember a phrase.", "magnifyingglass"),
            ("Make it yours", "Profile and appearance", "Add your name, a short bio and a photo in the Profile tab. Choose System, Light or Dark appearance there too.", "person.crop.circle.fill"),
            ("Share a card", "Spread the word", "Open any card and use the Share button to send it to a friend through the system share sheet.", "square.and.arrow.up.fill"),
            ("Morning routine", "Placeholder content", "A glass of water, ten minutes of stretching and a look at the day ahead. Small habits add up.", "sunrise.fill"),
            ("Weekend reading list", "Placeholder content", "Pick a book you have been putting off, find a quiet corner and read a chapter or two without your phone.", "book.fill"),
            ("Garden notes", "Placeholder content", "The tomatoes need more sun and the herbs are thriving. Consider moving the pots closer to the window.", "leaf.fill")
        ]
        return items.enumerated().map { index, item in
            FeedCard(
                title: item.0,
                subtitle: item.1,
                body: item.2,
                imageName: item.3,
                createdAt: now.addingTimeInterval(TimeInterval(-index * 3600))
            )
        }
    }
}
