import Foundation
import SwiftData

/// Reads and writes the persisted cart and order history.
@MainActor
final class LocalStore {
    let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func cartItems() -> [CartItem] {
        (try? context.fetch(FetchDescriptor<CartItem>())) ?? []
    }

    func saveChanges() {
        try? context.save()
    }

    /// The cart holds one restaurant at a time; adding from another replaces it.
    func addToCart(_ item: MenuItem) {
        let existing = cartItems()
        for other in existing where other.restaurantId != item.restaurantId {
            context.delete(other)
        }
        if let match = existing.first(where: { $0.menuItemId == item.id && $0.restaurantId == item.restaurantId }) {
            match.quantity += 1
        } else {
            context.insert(CartItem(menuItemId: item.id, restaurantId: item.restaurantId, name: item.name, priceCents: item.priceCents))
        }
        saveChanges()
    }

    func setQuantity(_ item: CartItem, to quantity: Int) {
        if quantity <= 0 {
            context.delete(item)
        } else {
            item.quantity = min(quantity, 99)
        }
        saveChanges()
    }

    func remove(_ item: CartItem) {
        context.delete(item)
        saveChanges()
    }

    func clearCart() {
        for item in cartItems() {
            context.delete(item)
        }
        saveChanges()
    }

    func placeOrder(restaurantName: String, lines: [CartLine], totalCents: Int, transactionId: String?) -> Order {
        let summary = lines.map { "\($0.quantity)× \($0.name)" }.joined(separator: ", ")
        let order = Order(restaurantName: restaurantName, totalCents: totalCents, itemSummary: summary, transactionId: transactionId)
        context.insert(order)
        saveChanges()
        return order
    }
}
