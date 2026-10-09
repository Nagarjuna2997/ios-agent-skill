import Foundation
import SwiftData

/// Synthetic records for previews and the agent's isolated simulator showcase.
enum SampleData {
    static let restaurants: [Restaurant] = [
        Restaurant(id: "rest-01", name: "Juniper & Rye", cuisine: "Seasonal bowls", latitude: 37.7749, longitude: -122.4194, rating: 4.8, imageURL: nil),
        Restaurant(id: "rest-02", name: "Little Fig Kitchen", cuisine: "Mediterranean", latitude: 37.7694, longitude: -122.4142, rating: 4.7, imageURL: nil),
        Restaurant(id: "rest-03", name: "Saffron House", cuisine: "Indian comfort food", latitude: 37.7812, longitude: -122.4101, rating: 4.9, imageURL: nil),
    ]

    static func menu(for restaurantId: String) -> [MenuItem] {
        menus[restaurantId] ?? []
    }

    @MainActor static let cartItems: [CartItem] = [
        CartItem(id: UUID(uuidString: "E0000000-0000-0000-0000-000000000001")!, menuItemId: "dish-01", restaurantId: "rest-01", name: "Roasted squash bowl", priceCents: 1495, quantity: 1),
        CartItem(id: UUID(uuidString: "E0000000-0000-0000-0000-000000000002")!, menuItemId: "dish-02", restaurantId: "rest-01", name: "Lemon tahini greens", priceCents: 1195, quantity: 2),
    ]

    @MainActor static var orders: [Order] {
        [
            Order(id: UUID(uuidString: "F0000000-0000-0000-0000-000000000001")!, restaurantName: "Juniper & Rye", totalCents: 3885, placedAt: date("2026-10-08T18:30:00Z"), status: OrderStage.onTheWay.rawValue, itemSummary: "1 squash bowl · 2 greens"),
            Order(id: UUID(uuidString: "F0000000-0000-0000-0000-000000000002")!, restaurantName: "Little Fig Kitchen", totalCents: 2390, placedAt: date("2026-10-07T18:10:00Z"), status: OrderStage.delivered.rawValue, itemSummary: "2 herbed flatbreads"),
        ]
    }

    @MainActor
    static func seed(into context: ModelContext) {
        for item in cartItems { context.insert(item) }
        for order in orders { context.insert(order) }
        try? context.save()
    }

    private static func date(_ value: String) -> Date {
        ISO8601DateFormatter().date(from: value) ?? .now
    }

    private static func dish(_ id: String, _ restaurant: String, _ name: String, _ details: String, _ price: Int) -> MenuItem {
        MenuItem(id: id, restaurantId: restaurant, name: name, details: details, priceCents: price)
    }

    private static let menus: [String: [MenuItem]] = [
        "rest-01": [
            dish("dish-01", "rest-01", "Roasted squash bowl", "Farro, herbs, toasted seeds", 1495),
            dish("dish-02", "rest-01", "Lemon tahini greens", "Crisp greens, chickpeas", 1195),
        ],
        "rest-02": [
            dish("dish-03", "rest-02", "Herbed flatbread", "Warm flatbread, whipped feta", 895),
        ],
        "rest-03": [
            dish("dish-04", "rest-03", "Saffron lentil bowl", "Slow-cooked lentils, herbs, rice", 1395),
        ],
    ]
}
