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
