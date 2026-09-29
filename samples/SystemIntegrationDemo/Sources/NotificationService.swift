import Foundation
import UserNotifications

final class NotificationService: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    // Immutable Sendable callback; no mutable state accessed by delegate callbacks.
    let onOpen: @Sendable (URL) -> Void
    init(onOpen: @escaping @Sendable (URL) -> Void) { self.onOpen = onOpen }
    enum Failure: Error { case denied, invalidInterval }
    func configure() {
        let center = UNUserNotificationCenter.current()
        center.delegate = self // The app must retain this service.
        let action = UNNotificationAction(identifier: "OPEN", title: "Open", options: [.foreground])
        center.setNotificationCategories([UNNotificationCategory(identifier: "ITEM", actions: [action], intentIdentifiers: [])])
    }
    func authorize() async throws {
        guard try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) else { throw Failure.denied }
    }
    func status() async -> UNAuthorizationStatus { await UNUserNotificationCenter.current().notificationSettings().authorizationStatus }
    func schedule(id: String, title: String, after seconds: TimeInterval, link: URL) async throws {
        guard seconds.isFinite, seconds > 0 else { throw Failure.invalidInterval }
        let authorization = await status()
        guard authorization == .authorized || authorization == .provisional || authorization == .ephemeral else { throw Failure.denied }
        let content = UNMutableNotificationContent(); content.title = title; content.sound = .default
        content.categoryIdentifier = "ITEM"; content.userInfo = ["url": link.absoluteString]
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: false)
        try await UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: id, content: content, trigger: trigger))
    }
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        guard response.actionIdentifier == "OPEN" || response.actionIdentifier == UNNotificationDefaultActionIdentifier,
              let raw = response.notification.request.content.userInfo["url"] as? String,
              let url = URL(string: raw) else { return }
        onOpen(url) // App router must allowlist routes before navigation.
    }
}
