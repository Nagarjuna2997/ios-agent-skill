import Foundation
import UserNotifications

protocol OrderStatusStreaming: Sendable {
    func updates(for orderID: UUID) -> AsyncStream<OrderStage>
}

/// Simulates real-time status updates locally until a real-time server is connected.
struct SimulatedOrderTracker: OrderStatusStreaming {
    var stepDelay: Duration = .seconds(15)

    func updates(for orderID: UUID) -> AsyncStream<OrderStage> {
        let delay = stepDelay
        return AsyncStream { continuation in
            let task = Task {
                continuation.yield(.placed)
                for stage in OrderStage.allCases.dropFirst() {
                    do {
                        try await Task.sleep(for: delay)
                    } catch {
                        break
                    }
                    continuation.yield(stage)
                }
                continuation.finish()
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }
}

/// For previews: never schedules anything.
struct NoopNotificationScheduler: NotificationScheduling {
    func requestAuthorization() async throws -> Bool { true }
    func authorizationStatus() async -> UNAuthorizationStatus { .authorized }
    func scheduleDaily(id: String, title: String, body: String, hour: Int, minute: Int) async throws {}
    func schedule(id: String, title: String, body: String, after seconds: TimeInterval) async throws {}
    func cancel(id: String) {}
    func pendingIDs() async -> [String] { [] }
}
