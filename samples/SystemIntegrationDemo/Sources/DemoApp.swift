import SwiftUI
import MapKit

@main
struct SystemIntegrationDemoApp: App {
    var body: some Scene { WindowGroup { IntegrationDemoView() } }
}
struct IntegrationDemoView: View {
    @State private var message = "Choose a feature. Permissions are requested only after your action."
    @State private var calendars = CalendarService()
    @State private var reminders = ReminderService()
    @State private var notifications = NotificationService { url in
        guard url.scheme == "integration-demo", url.host == "item" else { return }
        Task { @MainActor in await UIApplication.shared.open(url) }
    }
    var body: some View {
        NavigationStack {
            Form {
                Section("Import") { PhotoImportView { data in message = "Received \(data.count) photo files" } }
                Section("Create after confirmation") {
                    Button("Create a demo calendar event") {
                        Task { await perform {
                            try await calendars.authorize()
                            let start = Date().addingTimeInterval(3600)
                            _ = try calendars.create(title: "Integration demo", start: start, end: start.addingTimeInterval(1800))
                            return "Created Integration demo in your default calendar"
                        } }
                    }
                    Button("Create a demo reminder") {
                        Task { await perform {
                            try await reminders.authorize()
                            _ = try reminders.create(title: "Try system integrations")
                            return "Created Try system integrations in your default reminders list"
                        } }
                    }
                }
                Section("System UI") {
                    Button("Open San Francisco in Maps") {
                        let item = MKMapItem(placemark: MKPlacemark(coordinate: .init(latitude: 37.7749, longitude: -122.4194)))
                        message = MapsService.open(item) ? "Opened Maps" : "Maps could not open"
                    }
                    ShareLink(item: "Testing Apple system integrations")
                    Button("Notify me in 10 seconds") {
                        Task { await perform {
                            try await notifications.authorize()
                            guard let url = URL(string: "integration-demo://item/demo") else { throw CocoaError(.fileReadInvalidFileName) }
                            try await notifications.schedule(id: "demo", title: "Integration demo", after: 10, link: url)
                            return "Scheduled. Background the app to see the notification."
                        } }
                    }
                }
                Section("Result") { Text(message).accessibilityIdentifier("integration-result") }
            }
            .navigationTitle("System integrations")
            .task { notifications.configure() }
            .onOpenURL { url in
                guard url.scheme == "integration-demo", url.host == "item" else { return }
                message = "Opened notification item: \(url.lastPathComponent)"
            }
        }
    }
    @MainActor private func perform(_ action: () async throws -> String) async {
        do { message = try await action() }
        catch is CancellationError { message = "Cancelled" }
        catch { message = "Could not complete: \(error.localizedDescription)" }
    }
}
