# User Notifications

## UNUserNotificationCenter and Permissions

```swift
import UserNotifications

class NotificationManager {
    static let shared = NotificationManager()

    func requestPermission() async throws -> Bool {
        let center = UNUserNotificationCenter.current()
        let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge, .provisional])
        return granted
    }

    func checkPermissionStatus() async -> UNAuthorizationStatus {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        return settings.authorizationStatus
    }

    // Remove delivered notifications
    func clearDelivered(identifiers: [String]? = nil) {
        let center = UNUserNotificationCenter.current()
        if let identifiers {
            center.removeDeliveredNotifications(withIdentifiers: identifiers)
        } else {
            center.removeAllDeliveredNotifications()
        }
    }

    // Remove pending notifications
    func cancelPending(identifiers: [String]? = nil) {
        let center = UNUserNotificationCenter.current()
        if let identifiers {
            center.removePendingNotificationRequests(withIdentifiers: identifiers)
        } else {
            center.removeAllPendingNotificationRequests()
        }
    }
}
```

## Local Notifications (UNNotificationRequest)

```swift
extension NotificationManager {

    // Basic local notification
    func scheduleNotification(
        id: String = UUID().uuidString,
        title: String,
        body: String,
        subtitle: String? = nil,
        sound: UNNotificationSound = .default,
        badge: Int? = nil,
        timeInterval: TimeInterval,
        repeats: Bool = false,
        userInfo: [String: Any] = [:]
    ) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        if let subtitle { content.subtitle = subtitle }
        content.sound = sound
        if let badge { content.badge = NSNumber(value: badge) }
        content.userInfo = userInfo

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: repeats)
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)

        try await UNUserNotificationCenter.current().add(request)
    }

    // Notification with image attachment
    func scheduleWithImage(
        title: String,
        body: String,
        imageURL: URL,
        timeInterval: TimeInterval
    ) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let attachment = try UNNotificationAttachment(
            identifier: UUID().uuidString,
            url: imageURL,
            options: [UNNotificationAttachmentOptionsTypeHintKey: "public.jpeg"]
        )
        content.attachments = [attachment]

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        try await UNUserNotificationCenter.current().add(request)
    }
}
```

## Notification Triggers

```swift
extension NotificationManager {

    // Time interval trigger — fire after N seconds
    func scheduleAfterDelay(title: String, body: String, delay: TimeInterval) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        try await UNUserNotificationCenter.current().add(request)
    }

    // Calendar trigger — fire at specific date/time
    func scheduleAtDate(title: String, body: String, date: Date, repeats: Bool = false) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: repeats)

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        try await UNUserNotificationCenter.current().add(request)
    }

    // Daily repeating (e.g., every day at 9:00 AM)
    func scheduleDailyReminder(title: String, body: String, hour: Int, minute: Int) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        var components = DateComponents()
        components.hour = hour
        components.minute = minute
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        let request = UNNotificationRequest(identifier: "daily-reminder", content: content, trigger: trigger)
        try await UNUserNotificationCenter.current().add(request)
    }

    // Location trigger — fire when entering a region
    func scheduleLocationNotification(
        title: String,
        body: String,
        latitude: Double,
        longitude: Double,
        radius: Double = 100
    ) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let region = CLCircularRegion(
            center: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
            radius: radius,
            identifier: UUID().uuidString
        )
        region.notifyOnEntry = true
        region.notifyOnExit = false

        let trigger = UNLocationNotificationTrigger(region: region, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        try await UNUserNotificationCenter.current().add(request)
    }
}
```

## Notification Actions and Categories

```swift
extension NotificationManager {

    func registerCategories() {
        // Define actions
        let replyAction = UNNotificationAction(
            identifier: "REPLY_ACTION",
            title: "Reply",
            options: [.foreground]
        )

        let markReadAction = UNNotificationAction(
            identifier: "MARK_READ_ACTION",
            title: "Mark as Read",
            options: []
        )

        let deleteAction = UNNotificationAction(
            identifier: "DELETE_ACTION",
            title: "Delete",
            options: [.destructive]
        )

        // Text input action
        let textReplyAction = UNTextInputNotificationAction(
            identifier: "TEXT_REPLY_ACTION",
            title: "Quick Reply",
            options: [],
            textInputButtonTitle: "Send",
            textInputPlaceholder: "Type your reply..."
        )

        // Define categories
        let messageCategory = UNNotificationCategory(
            identifier: "MESSAGE_CATEGORY",
            actions: [textReplyAction, markReadAction, deleteAction],
            intentIdentifiers: [],
            hiddenPreviewsBodyPlaceholder: "New message",
            options: .customDismissAction
        )

        let reminderCategory = UNNotificationCategory(
            identifier: "REMINDER_CATEGORY",
            actions: [replyAction, deleteAction],
            intentIdentifiers: [],
            options: []
        )

        UNUserNotificationCenter.current().setNotificationCategories([messageCategory, reminderCategory])
    }

    // Send notification with category
    func sendMessage(from sender: String, message: String) async throws {
        let content = UNMutableNotificationContent()
        content.title = sender
        content.body = message
        content.categoryIdentifier = "MESSAGE_CATEGORY"
        content.userInfo = ["senderId": "user123"]
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        try await UNUserNotificationCenter.current().add(request)
    }
}

// Handle notification actions
class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {

    // Called when user taps notification or action
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        let userInfo = response.notification.request.content.userInfo

        switch response.actionIdentifier {
        case "REPLY_ACTION":
            // Open reply screen
            break
        case "MARK_READ_ACTION":
            if let senderId = userInfo["senderId"] as? String {
                // Mark conversation as read
                print("Marked read for \(senderId)")
            }
        case "TEXT_REPLY_ACTION":
            if let textResponse = response as? UNTextInputNotificationResponse {
                let replyText = textResponse.userText
                print("Quick reply: \(replyText)")
            }
        case "DELETE_ACTION":
            // Delete the message
            break
        case UNNotificationDefaultActionIdentifier:
            // User tapped the notification itself
            break
        default:
            break
        }
    }

    // Called when notification arrives while app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        return [.banner, .sound, .badge]
    }
}
```

## Remote Notifications (APNs)

```swift
// AppDelegate setup
class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Set notification delegate
        UNUserNotificationCenter.current().delegate = NotificationDelegate.shared

        // Register for remote notifications
        application.registerForRemoteNotifications()
        return true
    }

    // Called when APNs registration succeeds
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNs token: \(token)")
        // Send token to your server
    }

    // Called when registration fails
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("APNs registration failed: \(error)")
    }

    // Handle silent push notification
    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any]
    ) async -> UIBackgroundFetchResult {
        // Process background data
        if let data = userInfo["data"] as? [String: Any] {
            // Update local data
            return .newData
        }
        return .noData
    }
}

// Wire up in SwiftUI App
@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

## Notification Service Extension

Create a Notification Service Extension target in Xcode to modify notification content before display.

```swift
// NotificationService.swift (in the extension target)
import UserNotifications

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        guard let bestAttemptContent else {
            contentHandler(request.content)
            return
        }

        // Modify the notification content
        bestAttemptContent.title = "[Modified] " + bestAttemptContent.title

        // Download and attach an image
        if let imageURLString = bestAttemptContent.userInfo["imageURL"] as? String,
           let imageURL = URL(string: imageURLString) {
            downloadImage(from: imageURL) { localURL in
                if let localURL,
                   let attachment = try? UNNotificationAttachment(identifier: "image", url: localURL) {
                    bestAttemptContent.attachments = [attachment]
                }
                contentHandler(bestAttemptContent)
            }
        } else {
            contentHandler(bestAttemptContent)
        }
    }

    // Called if the extension is about to be terminated (30-second limit)
    override func serviceExtensionTimeWillExpire() {
        if let contentHandler, let bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }

    private func downloadImage(from url: URL, completion: @escaping (URL?) -> Void) {
        URLSession.shared.downloadTask(with: url) { localURL, _, error in
            guard let localURL, error == nil else {
                completion(nil)
                return
            }
            let tempURL = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString + ".jpg")
            try? FileManager.default.moveItem(at: localURL, to: tempURL)
            completion(tempURL)
        }.resume()
    }
}
```
