import Foundation
import WidgetKit

/// What the Home Screen widget shows. Written by the app, read by the widget.
struct WidgetSnapshot: Codable, Hashable, Sendable {
    var title: String
    var value: String
    var detail: String
    var updatedAt: Date = .now

    static let placeholder = WidgetSnapshot(title: "__DISPLAY_NAME__", value: "--", detail: "Open the app to update")
}

/// Stores the snapshot in the App Group shared by the app and its widget extension.
enum WidgetSnapshotStore {
    static let appGroup = "group.__BUNDLE_ID__"
    private static let key = "widget.snapshot"

    private static var defaults: UserDefaults {
        UserDefaults(suiteName: appGroup) ?? .standard
    }

    static func load() -> WidgetSnapshot? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }

    /// Saves the snapshot and asks WidgetKit to refresh the widget.
    static func publish(_ snapshot: WidgetSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        defaults.set(data, forKey: key)
        WidgetCenter.shared.reloadAllTimelines()
    }
}
