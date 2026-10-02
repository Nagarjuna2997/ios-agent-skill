import Foundation

@MainActor
@Observable
final class CheckoutViewModel {
    enum Phase: Equatable {
        case ready
        case paying
        case failed(String)
        case completed
    }

    let lines: [CartLine]
    private(set) var phase: Phase = .ready
    private(set) var restaurantName = "Your restaurant"
    private(set) var paidCount = 0
    private(set) var failCount = 0

    private let restaurants: any RestaurantServicing
    private let payment: any PaymentProcessing
    private let store: LocalStore
    private let tracking: OrderTrackingModel

    init(lines: [CartLine], restaurants: any RestaurantServicing, payment: any PaymentProcessing, store: LocalStore, tracking: OrderTrackingModel) {
        self.lines = lines
        self.restaurants = restaurants
        self.payment = payment
        self.store = store
        self.tracking = tracking
    }

    var subtotalCents: Int { CheckoutPricing.subtotal(lines) }
    var deliveryFeeCents: Int { lines.isEmpty ? 0 : CheckoutPricing.deliveryFeeCents }
    var totalCents: Int { subtotalCents + deliveryFeeCents }

    func loadRestaurantName() async {
        guard let id = lines.first?.restaurantId else { return }
        if let all = try? await restaurants.restaurants(), let match = all.first(where: { $0.id == id }) {
            restaurantName = match.name
        }
    }

    func pay(address: String) async {
        guard phase != .paying, !lines.isEmpty else { return }
        phase = .paying
        do {
            switch try await payment.pay(totalCents: totalCents) {
            case .purchased(let transactionId):
                let order = store.placeOrder(restaurantName: restaurantName, lines: lines, totalCents: totalCents, transactionId: transactionId)
                store.clearCart()
                tracking.begin(order: order, address: address)
                paidCount += 1
                phase = .completed
            case .pending:
                phase = .failed("Your payment is pending approval. You will not be charged until it is approved.")
            case .cancelled:
                phase = .ready
            }
        } catch is CancellationError {
            phase = .ready
        } catch {
            failCount += 1
            phase = .failed(error.localizedDescription)
        }
    }
}
