import Foundation

/// The build agent launches the app with `-ios-agent-screen <screen-id>` to open
/// each top-level screen for a screenshot. Launch arguments of the form
/// `-key value` are readable through UserDefaults' argument domain.
enum AgentLaunch {
    static var requestedScreen: String? {
        UserDefaults.standard.string(forKey: "ios-agent-screen")
    }

    /// True when launched with `-ios-agent-sample-data YES`. The app then shows an
    /// isolated in-memory demo store and never touches the persistent one.
    static var usesSampleData: Bool {
        UserDefaults.standard.bool(forKey: "ios-agent-sample-data")
    }
}
