import Foundation

enum Money {
    static func format(cents: Int) -> String {
        (Double(cents) / 100).formatted(.currency(code: "USD"))
    }
}

/// A value snapshot of a cart row, safe to pass around.
struct CartLine: Identifiable, Hashable, Sendable {
    let id: UUID
    let menuItemId: String
    let restaurantId: String
    let name: String
    let priceCents: Int
    let quantity: Int

    var totalCents: Int { priceCents * quantity }
}

enum CheckoutPricing {
    static let deliveryFeeCents = 299

    static func subtotal(_ lines: [CartLine]) -> Int {
        lines.reduce(0) { $0 + $1.totalCents }
    }
}
