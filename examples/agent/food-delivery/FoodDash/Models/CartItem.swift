import Foundation
import SwiftData

@Model
final class CartItem {
    var id: UUID
    var menuItemId: String
    var restaurantId: String
    var name: String
    var priceCents: Int
    var quantity: Int

    init(id: UUID = UUID(), menuItemId: String, restaurantId: String, name: String, priceCents: Int, quantity: Int = 1) {
        self.id = id
        self.menuItemId = menuItemId
        self.restaurantId = restaurantId
        self.name = name
        self.priceCents = priceCents
        self.quantity = quantity
    }

    var line: CartLine {
        CartLine(id: id, menuItemId: menuItemId, restaurantId: restaurantId, name: name, priceCents: priceCents, quantity: quantity)
    }
}
