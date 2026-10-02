import SwiftUI
import UserNotifications

protocol NotificationScheduling: Sendable {
    func requestAuthorization() async throws -> Bool
    func authorizationStatus() async -> UNAuthorizationStatus
    func scheduleDaily(id: String, title: String, body: String, hour: Int, minute: Int) async throws
    func schedule(id: String, title: String, body: String, after seconds: TimeInterval) async throws
    func cancel(id: String)
    func pendingIDs() async -> [String]
}

struct LocalNotificationScheduler: NotificationScheduling {
    private var center: UNUserNotificationCenter { .current() }

    func requestAuthorization() async throws -> Bool {
        try await center.requestAuthorization(options: [.alert, .sound, .badge])
    }

    func authorizationStatus() async -> UNAuthorizationStatus {
        await center.notificationSettings().authorizationStatus
    }

    func scheduleDaily(id: String, title: String, body: String, hour: Int, minute: Int) async throws {
        var components = DateComponents()
        components.hour = hour
        components.minute = minute
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        try await center.add(UNNotificationRequest(identifier: id, content: content(title, body), trigger: trigger))
    }

    func schedule(id: String, title: String, body: String, after seconds: TimeInterval) async throws {
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: max(1, seconds), repeats: false)
        try await center.add(UNNotificationRequest(identifier: id, content: content(title, body), trigger: trigger))
    }

    func cancel(id: String) {
        center.removePendingNotificationRequests(withIdentifiers: [id])
    }

    func pendingIDs() async -> [String] {
        await center.pendingNotificationRequests().map(\.identifier)
    }

    private func content(_ title: String, _ body: String) -> UNMutableNotificationContent {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        return content
    }
}

/// Shows notifications as banners while the app is in the foreground.
/// Keep one instance alive for the app's lifetime; the center holds it weakly.
final class NotificationPresenter: NSObject, UNUserNotificationCenterDelegate {
    @MainActor
    func install() {
        UNUserNotificationCenter.current().delegate = self
    }

    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }
}

@MainActor
@Observable
final class ReminderModel {
    var isEnabled = false
    var time: Date = Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: .now) ?? .now
    private(set) var message: String?
    private let scheduler: any NotificationScheduling
    private let reminderID = "daily-reminder"

    init(scheduler: any NotificationScheduling) {
        self.scheduler = scheduler
    }

    func refresh() async {
        isEnabled = await scheduler.pendingIDs().contains(reminderID)
    }

    func apply(title: String = "Reminder", body: String = "Time to check in.") async {
        guard isEnabled else {
            scheduler.cancel(id: reminderID)
            message = nil
            return
        }
        do {
            guard try await scheduler.requestAuthorization() else {
                isEnabled = false
                message = "Notifications are off. Turn them on in Settings to get reminders."
                return
            }
            let parts = Calendar.current.dateComponents([.hour, .minute], from: time)
            try await scheduler.scheduleDaily(id: reminderID, title: title, body: body, hour: parts.hour ?? 9, minute: parts.minute ?? 0)
            message = nil
        } catch {
            message = "The reminder could not be scheduled: \(error.localizedDescription)"
        }
    }
}

struct ReminderSettingsView: View {
    @Bindable var model: ReminderModel

    var body: some View {
        Section("Reminders") {
            Toggle("Daily reminder", isOn: $model.isEnabled)
            if model.isEnabled {
                DatePicker("Time", selection: $model.time, displayedComponents: .hourAndMinute)
            }
            if let message = model.message {
                Text(message).font(.footnote).foregroundStyle(.secondary)
            }
        }
        .onChange(of: model.isEnabled) { Task { await model.apply() } }
        .onChange(of: model.time) { Task { await model.apply() } }
    }
}

private struct PreviewScheduler: NotificationScheduling {
    func requestAuthorization() async throws -> Bool { true }
    func authorizationStatus() async -> UNAuthorizationStatus { .authorized }
    func scheduleDaily(id: String, title: String, body: String, hour: Int, minute: Int) async throws {}
    func schedule(id: String, title: String, body: String, after seconds: TimeInterval) async throws {}
    func cancel(id: String) {}
    func pendingIDs() async -> [String] { [] }
}

#Preview {
    Form {
        ReminderSettingsView(model: ReminderModel(scheduler: PreviewScheduler()))
    }
}
