import Foundation
import SwiftData

@Model
final class Order {
    var id: UUID
    var restaurantName: String
    var totalCents: Int
    var placedAt: Date
    var status: String
    var itemSummary: String
    var transactionId: String?

    init(id: UUID = UUID(), restaurantName: String, totalCents: Int, placedAt: Date = .now, status: String = OrderStage.placed.rawValue, itemSummary: String, transactionId: String? = nil) {
        self.id = id
        self.restaurantName = restaurantName
        self.totalCents = totalCents
        self.placedAt = placedAt
        self.status = status
        self.itemSummary = itemSummary
        self.transactionId = transactionId
    }
}

enum OrderStage: String, CaseIterable, Identifiable, Sendable {
    case placed = "Placed"
    case preparing = "Preparing"
    case onTheWay = "On the way"
    case delivered = "Delivered"

    var id: String { rawValue }

    var index: Int { Self.allCases.firstIndex(of: self) ?? 0 }

    var systemImage: String {
        switch self {
        case .placed: "checkmark.seal"
        case .preparing: "frying.pan"
        case .onTheWay: "bicycle"
        case .delivered: "house"
        }
    }

    var etaMinutes: Int? {
        switch self {
        case .placed: 30
        case .preparing: 22
        case .onTheWay: 10
        case .delivered: nil
        }
    }

    var notificationBody: String {
        switch self {
        case .placed: "Your order was placed."
        case .preparing: "The kitchen is preparing your order."
        case .onTheWay: "Your order is on the way."
        case .delivered: "Your order has been delivered. Enjoy!"
        }
    }
}
