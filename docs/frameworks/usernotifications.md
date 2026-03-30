# UserNotifications

The UserNotifications framework manages local and remote notifications in iOS. It provides a unified API for scheduling, delivering, and handling notifications with rich content, actions, and various trigger types.

## UNUserNotificationCenter and Requesting Permission

```swift
import UserNotifications

class NotificationManager: ObservableObject {
    static let shared = NotificationManager()

    @Published var isAuthorized = false

    let center = UNUserNotificationCenter.current()

    func requestPermission() async -> Bool {
        do {
            let granted = try await center.requestAuthorization(
                options: [.alert, .sound, .badge, .providesAppNotificationSettings]
            )
            await MainActor.run { isAuthorized = granted }
            return granted
        } catch {
            print("Permission request failed: \(error)")
            return false
        }
    }

    func checkCurrentSettings() async {
        let settings = await center.notificationSettings()

        switch settings.authorizationStatus {
        case .authorized:
            print("Fully authorized")
        case .denied:
            print("Denied - direct user to Settings")
        case .provisional:
            print("Provisional (quiet delivery)")
        case .ephemeral:
            print("Ephemeral (App Clips)")
        case .notDetermined:
            print("Not yet requested")
        @unknown default:
            break
        }

        // Check individual setting states
        print("Alert: \(settings.alertSetting)")
        print("Badge: \(settings.badgeSetting)")
        print("Sound: \(settings.soundSetting)")
        print("Lock screen: \(settings.lockScreenSetting)")
        print("Notification center: \(settings.notificationCenterSetting)")
    }
}
```

## Local Notifications (UNNotificationRequest, Content, Triggers)

```swift
extension NotificationManager {
    func scheduleLocalNotification() async throws {
        let content = UNMutableNotificationContent()
        content.title = "Reminder"
        content.subtitle = "Daily Check-in"
        content.body = "Time to log your progress for today."
        content.sound = .default
        content.badge = 1
        content.userInfo = ["screen": "journal", "entryID": "abc123"]

        // Thread identifier groups related notifications together
        content.threadIdentifier = "daily-reminders"

        // Relevance score (0.0 to 1.0) affects position in notification summary
        content.relevanceScore = 0.8

        // Interruption level (iOS 15+)
        content.interruptionLevel = .timeSensitive
        // .passive       - silently added to notification center
        // .active        - default: sound + banner (respects Focus)
        // .timeSensitive - breaks through most Focus filters
        // .critical      - plays sound even on mute (requires entitlement)

        // Attach an image
        if let imageURL = Bundle.main.url(forResource: "notification", withExtension: "png") {
            let attachment = try UNNotificationAttachment(
                identifier: "image",
                url: imageURL,
                options: [UNNotificationAttachmentOptionsTypeHintKey: "public.png"]
            )
            content.attachments = [attachment]
        }

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )

        try await center.add(request)
    }
}
```

## Time, Calendar, and Location Triggers

### Time Interval Trigger

```swift
extension NotificationManager {
    // Fire after a delay. For repeating, interval must be >= 60 seconds.
    func scheduleAfterDelay(seconds: TimeInterval, repeating: Bool = false) -> UNTimeIntervalNotificationTrigger {
        return UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: repeating)
    }
}
```

### Calendar Trigger

```swift
extension NotificationManager {
    // Fire at a specific date and time, optionally repeating
    func scheduleDailyReminder(hour: Int, minute: Int) async throws {
        let content = UNMutableNotificationContent()
        content.title = "Daily Reminder"
        content.body = "Don't forget to check in!"
        content.sound = .default

        var dateComponents = DateComponents()
        dateComponents.hour = hour
        dateComponents.minute = minute
        // Omitting day/month/year makes it repeat daily at this time

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)

        let request = UNNotificationRequest(
            identifier: "daily-reminder",
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }

    // Weekly trigger: every Monday at 9:00 AM
    func scheduleWeeklyReminder() async throws {
        let content = UNMutableNotificationContent()
        content.title = "Weekly Review"
        content.body = "Time for your weekly review."
        content.sound = .default

        var dateComponents = DateComponents()
        dateComponents.weekday = 2  // 1 = Sunday, 2 = Monday, ...
        dateComponents.hour = 9
        dateComponents.minute = 0

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(
            identifier: "weekly-review",
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }

    // One-time notification at a specific date
    func scheduleOnDate(_ date: Date) async throws {
        let content = UNMutableNotificationContent()
        content.title = "Scheduled Event"
        content.body = "Your event is starting now."
        content.sound = .default

        let components = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: date
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        let request = UNNotificationRequest(
            identifier: "event-\(date.timeIntervalSince1970)",
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }
}
```

### Location Trigger

```swift
import CoreLocation

extension NotificationManager {
    func scheduleLocationNotification() async throws {
        let content = UNMutableNotificationContent()
        content.title = "Welcome!"
        content.body = "You've arrived at the office."
        content.sound = .default

        let coordinate = CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194)
        let region = CLCircularRegion(center: coordinate, radius: 100, identifier: "office")
        region.notifyOnEntry = true
        region.notifyOnExit = false

        let trigger = UNLocationNotificationTrigger(region: region, repeats: true)
        let request = UNNotificationRequest(
            identifier: "office-arrival",
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }
}
```

## Notification Actions and Categories

```swift
extension NotificationManager {
    func registerCategories() {
        // Define actions
        let replyAction = UNTextInputNotificationAction(
            identifier: "REPLY",
            title: "Reply",
            options: [],
            textInputButtonTitle: "Send",
            textInputPlaceholder: "Type your reply..."
        )

        let markReadAction = UNNotificationAction(
            identifier: "MARK_READ",
            title: "Mark as Read",
            options: .destructive
        )

        let viewAction = UNNotificationAction(
            identifier: "VIEW",
            title: "View",
            options: .foreground  // Opens the app when tapped
        )

        // Define category grouping related actions
        let messageCategory = UNNotificationCategory(
            identifier: "MESSAGE",
            actions: [replyAction, markReadAction, viewAction],
            intentIdentifiers: [],
            hiddenPreviewsBodyPlaceholder: "New message",
            categorySummaryFormat: "%u more messages",
            options: [.customDismissAction]  // Notifies delegate when user dismisses
        )

        let reminderCategory = UNNotificationCategory(
            identifier: "REMINDER",
            actions: [
                UNNotificationAction(identifier: "SNOOZE", title: "Snooze 15 min", options: []),
                UNNotificationAction(identifier: "COMPLETE", title: "Mark Complete", options: .destructive)
            ],
            intentIdentifiers: [],
            options: []
        )

        center.setNotificationCategories([messageCategory, reminderCategory])
    }

    // Send a notification with a category
    func sendMessageNotification(from sender: String, message: String) async throws {
        let content = UNMutableNotificationContent()
        content.title = sender
        content.body = message
        content.categoryIdentifier = "MESSAGE"
        content.sound = .default
        content.threadIdentifier = "chat-\(sender)"

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }
}
```

## Handling Notification Actions via Delegate

```swift
class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {

    // Called when user taps a notification or performs an action
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let actionIdentifier = response.actionIdentifier
        let userInfo = response.notification.request.content.userInfo

        switch actionIdentifier {
        case "REPLY":
            if let textResponse = response as? UNTextInputNotificationResponse {
                print("User replied: \(textResponse.userText)")
                // Send the reply to your server
            }
        case "MARK_READ":
            print("Marked as read")
        case "VIEW":
            print("Opening detail view")
            // Navigate to the relevant screen using userInfo
        case "SNOOZE":
            // Reschedule the notification for 15 minutes later
            Task { try? await rescheduleNotification(from: response.notification.request) }
        case "COMPLETE":
            print("Task marked complete")
        case UNNotificationDefaultActionIdentifier:
            // User tapped the notification banner itself
            if let screen = userInfo["screen"] as? String {
                print("Navigate to: \(screen)")
            }
        case UNNotificationDismissActionIdentifier:
            // User dismissed the notification (requires .customDismissAction)
            print("Notification dismissed")
        default:
            break
        }

        completionHandler()
    }

    // Called when a notification arrives while the app is in the foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show banner even when app is in foreground
        completionHandler([.banner, .sound, .badge, .list])
    }

    private func rescheduleNotification(from request: UNNotificationRequest) async throws {
        let content = request.content.mutableCopy() as! UNMutableNotificationContent
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 900, repeats: false)
        let newRequest = UNNotificationRequest(
            identifier: request.identifier + "-snoozed",
            content: content,
            trigger: trigger
        )
        try await UNUserNotificationCenter.current().add(newRequest)
    }
}
```

## Remote Notifications (APNs Registration and Handling)

```swift
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = NotificationDelegate()
        application.registerForRemoteNotifications()
        return true
    }

    // Called when APNs registration succeeds
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNs device token: \(token)")
        // Send this token to your backend server
    }

    // Called when APNs registration fails
    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("APNs registration failed: \(error)")
    }

    // Handle silent push notifications (content-available: 1)
    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        if let aps = userInfo["aps"] as? [String: Any],
           aps["content-available"] as? Int == 1 {
            Task {
                // Perform background data fetch
                completionHandler(.newData)
            }
        } else {
            completionHandler(.noData)
        }
    }
}

// Example APNs JSON payload (sent from your server):
// {
//   "aps": {
//     "alert": {
//       "title": "New Message",
//       "subtitle": "From John",
//       "body": "Hey, are you available?"
//     },
//     "badge": 3,
//     "sound": "default",
//     "category": "MESSAGE",
//     "mutable-content": 1,
//     "thread-id": "chat-john",
//     "interruption-level": "time-sensitive"
//   },
//   "messageId": "msg-123",
//   "senderId": "user-456"
// }
```

## Notification Service Extension for Rich Notifications

Create a new target: File > New > Target > Notification Service Extension. This allows modifying remote notification content before display (download images, decrypt payloads, etc.). The extension has approximately 30 seconds to complete.

```swift
// NotificationService.swift (in the service extension target)
import UserNotifications

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        bestAttemptContent = request.content.mutableCopy() as? UNMutableNotificationContent

        guard let content = bestAttemptContent else {
            contentHandler(request.content)
            return
        }

        // Download and attach an image from the payload
        if let imageURLString = content.userInfo["imageURL"] as? String,
           let imageURL = URL(string: imageURLString) {
            downloadAttachment(from: imageURL) { localURL in
                if let localURL = localURL,
                   let attachment = try? UNNotificationAttachment(
                       identifier: "image",
                       url: localURL
                   ) {
                    content.attachments = [attachment]
                }
                contentHandler(content)
            }
        } else {
            contentHandler(content)
        }
    }

    // Called if the extension is about to be terminated (time limit reached)
    override func serviceExtensionTimeWillExpire() {
        if let content = bestAttemptContent {
            contentHandler?(content)
        }
    }

    private func downloadAttachment(from url: URL, completion: @escaping (URL?) -> Void) {
        URLSession.shared.downloadTask(with: url) { localURL, _, error in
            guard let localURL = localURL, error == nil else {
                completion(nil)
                return
            }
            let tmpURL = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString + ".jpg")
            try? FileManager.default.moveItem(at: localURL, to: tmpURL)
            completion(tmpURL)
        }.resume()
    }
}
```

## Provisional and Critical Alerts

```swift
extension NotificationManager {
    // Provisional: delivered quietly without showing a permission prompt.
    // Notifications appear in Notification Center but not on Lock Screen or as banners.
    // The user can later promote to prominent or disable entirely.
    func requestProvisionalPermission() async -> Bool {
        do {
            return try await center.requestAuthorization(
                options: [.alert, .sound, .badge, .provisional]
            )
        } catch {
            return false
        }
    }

    // Critical alerts bypass Do Not Disturb and silent mode.
    // Requires a special entitlement from Apple (medical, security, public safety apps only).
    func requestCriticalPermission() async -> Bool {
        do {
            return try await center.requestAuthorization(
                options: [.alert, .sound, .badge, .criticalAlert]
            )
        } catch {
            return false
        }
    }

    // Send a critical alert
    func sendCriticalAlert(title: String, body: String) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.interruptionLevel = .critical
        content.sound = UNNotificationSound.criticalSoundNamed(
            UNNotificationSoundName("alarm.caf"),
            withAudioVolume: 1.0
        )

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(
            identifier: "critical-\(UUID().uuidString)",
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }
}
```

## Managing Pending and Delivered Notifications

```swift
extension NotificationManager {
    // List all pending (scheduled but not yet delivered) notifications
    func getPendingNotifications() async -> [UNNotificationRequest] {
        return await center.pendingNotificationRequests()
    }

    // Remove specific pending notifications by identifier
    func removePending(identifiers: [String]) {
        center.removePendingNotificationRequests(withIdentifiers: identifiers)
    }

    // Remove all pending notifications
    func removeAllPending() {
        center.removeAllPendingNotificationRequests()
    }

    // Remove delivered notifications from Notification Center
    func removeDelivered(identifiers: [String]) {
        center.removeDeliveredNotifications(withIdentifiers: identifiers)
    }

    // Clear the badge count
    func clearBadge() async throws {
        try await center.setBadgeCount(0)
    }
}
```

## Complete Example: Notification Setup in App

```swift
import SwiftUI

@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
                .task {
                    let manager = NotificationManager.shared
                    let granted = await manager.requestPermission()
                    if granted {
                        manager.registerCategories()
                    }
                }
        }
    }
}

struct NotificationSettingsView: View {
    @StateObject private var manager = NotificationManager.shared
    @State private var dailyReminderEnabled = false
    @State private var reminderHour = 9

    var body: some View {
        Form {
            Section("Permissions") {
                Button("Request Notification Permission") {
                    Task { await manager.requestPermission() }
                }
                Text(manager.isAuthorized ? "Authorized" : "Not authorized")
                    .foregroundStyle(manager.isAuthorized ? .green : .red)
            }

            Section("Daily Reminder") {
                Toggle("Enable Daily Reminder", isOn: $dailyReminderEnabled)
                    .onChange(of: dailyReminderEnabled) { _, enabled in
                        Task {
                            if enabled {
                                try? await manager.scheduleDailyReminder(
                                    hour: reminderHour,
                                    minute: 0
                                )
                            } else {
                                manager.removePending(identifiers: ["daily-reminder"])
                            }
                        }
                    }

                if dailyReminderEnabled {
                    Picker("Hour", selection: $reminderHour) {
                        ForEach(0..<24, id: \.self) { hour in
                            Text("\(hour):00").tag(hour)
                        }
                    }
                }
            }

            Section("Debug") {
                Button("Send Test Notification") {
                    Task { try? await manager.scheduleLocalNotification() }
                }
                Button("Clear Badge") {
                    Task { try? await manager.clearBadge() }
                }
            }
        }
        .navigationTitle("Notifications")
    }
}
```
