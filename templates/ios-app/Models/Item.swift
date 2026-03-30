import Foundation

struct Item: Identifiable, Hashable {
    let id: UUID
    let title: String
    let subtitle: String
    let iconName: String
    let createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        subtitle: String,
        iconName: String = "star.fill",
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.iconName = iconName
        self.createdAt = createdAt
    }
}

// MARK: - Sample Data

extension Item {
    static let samples: [Item] = [
        Item(title: "Getting Started", subtitle: "Learn the basics", iconName: "book.fill"),
        Item(title: "SwiftUI Views", subtitle: "Build beautiful interfaces", iconName: "rectangle.3.group.fill"),
        Item(title: "Data Management", subtitle: "Store and retrieve data", iconName: "cylinder.split.1x2.fill"),
        Item(title: "Networking", subtitle: "Connect to APIs", iconName: "network"),
        Item(title: "Notifications", subtitle: "Engage your users", iconName: "bell.fill"),
    ]
}
