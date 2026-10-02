import Foundation

/// Tracks the current order and mirrors its progress to the Live Activity and notifications.
@MainActor
@Observable
final class OrderTrackingModel {
    struct ActiveOrder: Equatable {
        let id: UUID
        let restaurantName: String
        let itemSummary: String
        let address: String
    }

    private(set) var active: ActiveOrder?
    private(set) var stage: OrderStage = .placed
    private(set) var eta: Date?
    private(set) var message: String?

    private let tracker: any OrderStatusStreaming
    private let liveActivity: any LiveActivityControlling
    private let notifications: any NotificationScheduling
    private let store: LocalStore
    private var currentOrder: Order?
    private var task: Task<Void, Never>?

    init(tracker: any OrderStatusStreaming, liveActivity: any LiveActivityControlling, notifications: any NotificationScheduling, store: LocalStore) {
        self.tracker = tracker
        self.liveActivity = liveActivity
        self.notifications = notifications
        self.store = store
    }

    func begin(order: Order, address: String) {
        task?.cancel()
        currentOrder = order
        active = ActiveOrder(id: order.id, restaurantName: order.restaurantName, itemSummary: order.itemSummary, address: address)
        stage = .placed
        eta = nil
        message = nil
        let id = order.id
        task = Task { await run(orderID: id) }
    }

    func dismiss() {
        task?.cancel()
        task = nil
        active = nil
        currentOrder = nil
        eta = nil
    }

    private func run(orderID: UUID) async {
        await liveActivity.end()
        if let active {
            do {
                try liveActivity.start(title: active.restaurantName, subtitle: active.itemSummary, steps: OrderStage.allCases.map(\.rawValue))
            } catch {
                message = error.localizedDescription
            }
        }
        _ = try? await notifications.requestAuthorization()
        for await next in tracker.updates(for: orderID) {
            await apply(next, orderID: orderID)
        }
    }

    private func apply(_ next: OrderStage, orderID: UUID) async {
        stage = next
        eta = next.etaMinutes.map { Date.now.addingTimeInterval(Double($0) * 60) }
        currentOrder?.status = next.rawValue
        store.saveChanges()
        await liveActivity.advance(to: next.index, eta: eta)
        if next != .placed {
            let title = active?.restaurantName ?? "FoodDash"
            try? await notifications.schedule(id: "order-\(orderID.uuidString)-\(next.rawValue)", title: title, body: next.notificationBody, after: 1)
        }
        if next == .delivered {
            await liveActivity.end()
        }
    }
}
