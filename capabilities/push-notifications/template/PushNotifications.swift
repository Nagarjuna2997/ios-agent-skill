import Observation
import SwiftUI
import UIKit
import UserNotifications

@MainActor
@Observable
final class PushRegistration {
    static let shared = PushRegistration()

    private(set) var deviceToken: String?
    private(set) var errorMessage: String?
    private(set) var isAuthorized = false

    /// Asks for alert, sound and badge permission, then registers with APNs.
    func requestAndRegister() async {
        do {
            isAuthorized = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
            if isAuthorized {
                UIApplication.shared.registerForRemoteNotifications()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func didRegister(token: Data) {
        deviceToken = token.map { String(format: "%02x", $0) }.joined()
        errorMessage = nil
    }

    func didFail(_ error: Error) {
        errorMessage = error.localizedDescription
    }
}

final class PushAppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        PushRegistration.shared.didRegister(token: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        PushRegistration.shared.didFail(error)
    }
}
