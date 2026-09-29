import AppIntents

/// A complete, neutral sample action. Replace the calculation with an app-owned use case.
struct CalculateDurationIntent: AppIntent {
    static let title: LocalizedStringResource = "Calculate duration"
    static let description = IntentDescription("Convert a number of minutes to seconds.")
    @Parameter(title: "Minutes") var minutes: Int
    func perform() async throws -> some IntentResult & ReturnsValue<Int> {
        guard minutes >= 0, minutes <= Int.max / 60 else { throw DurationError.outOfRange }
        return .result(value: minutes * 60)
    }
    enum DurationError: Error { case outOfRange }
}
struct IntegrationShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: CalculateDurationIntent(), phrases: ["Calculate duration with \(.applicationName)"], shortTitle: "Duration", systemImageName: "timer")
    }
}
