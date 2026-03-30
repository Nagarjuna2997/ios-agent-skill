# EventKit

## EKEventStore Setup and Authorization

Add to `Info.plist`:
- `NSCalendarsUsageDescription` — required for calendar access
- `NSCalendarsFullAccessUsageDescription` — iOS 17+ full access
- `NSCalendarsWriteOnlyAccessUsageDescription` — iOS 17+ write-only access
- `NSRemindersUsageDescription` — required for reminders access
- `NSRemindersFullAccessUsageDescription` — iOS 17+ reminders

```swift
import EventKit

@Observable
final class CalendarManager {
    var calendars: [EKCalendar] = []
    var events: [EKEvent] = []
    var authorizationStatus: EKAuthorizationStatus = .notDetermined
    var error: Error?

    private let store = EKEventStore()

    /// Request calendar access (iOS 17+)
    func requestAccess() async {
        do {
            if #available(iOS 17, *) {
                let granted = try await store.requestFullAccessToEvents()
                authorizationStatus = granted ? .fullAccess : .denied
            } else {
                let granted = try await store.requestAccess(to: .event)
                authorizationStatus = granted ? .authorized : .denied
            }
        } catch {
            self.error = error
            authorizationStatus = .denied
        }
    }

    /// Request reminders access (iOS 17+)
    func requestRemindersAccess() async throws -> Bool {
        if #available(iOS 17, *) {
            return try await store.requestFullAccessToReminders()
        } else {
            return try await store.requestAccess(to: .reminder)
        }
    }
}
```

## Reading Calendars and Events

```swift
extension CalendarManager {

    func loadCalendars() {
        calendars = store.calendars(for: .event)
    }

    /// Fetch events within a date range
    func fetchEvents(from startDate: Date, to endDate: Date, calendars: [EKCalendar]? = nil) {
        let predicate = store.predicateForEvents(
            withStart: startDate,
            end: endDate,
            calendars: calendars  // nil = all calendars
        )
        events = store.events(matching: predicate)
            .sorted { $0.startDate < $1.startDate }
    }

    /// Fetch events for today
    func fetchTodayEvents() {
        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay)!
        fetchEvents(from: startOfDay, to: endOfDay)
    }

    /// Fetch events for the next N days
    func fetchUpcomingEvents(days: Int = 7) {
        let now = Date()
        let future = Calendar.current.date(byAdding: .day, value: days, to: now)!
        fetchEvents(from: now, to: future)
    }

    /// Get a single event by identifier
    func event(withIdentifier id: String) -> EKEvent? {
        store.event(withIdentifier: id)
    }
}
```

## Creating, Editing, and Deleting Events

```swift
extension CalendarManager {

    /// Create a new event
    func createEvent(
        title: String,
        startDate: Date,
        endDate: Date,
        calendar: EKCalendar? = nil,
        location: String? = nil,
        notes: String? = nil,
        url: URL? = nil,
        alarms: [TimeInterval] = [-600] // 10 minutes before
    ) throws -> EKEvent {
        let event = EKEvent(eventStore: store)
        event.title = title
        event.startDate = startDate
        event.endDate = endDate
        event.calendar = calendar ?? store.defaultCalendarForNewEvents
        event.location = location
        event.notes = notes
        event.url = url

        // Add alarms
        for offset in alarms {
            event.addAlarm(EKAlarm(relativeOffset: offset))
        }

        try store.save(event, span: .thisEvent)
        return event
    }

    /// Edit an existing event
    func updateEvent(_ event: EKEvent, span: EKSpan = .thisEvent) throws {
        try store.save(event, span: span)
    }

    /// Delete an event
    func deleteEvent(_ event: EKEvent, span: EKSpan = .thisEvent) throws {
        try store.remove(event, span: span)
    }
}
```

## Recurrence Rules

```swift
extension CalendarManager {

    /// Create a daily recurring event
    func createDailyEvent(title: String, startDate: Date, endDate: Date) throws -> EKEvent {
        let rule = EKRecurrenceRule(
            recurrenceWith: .daily,
            interval: 1,             // Every 1 day
            end: EKRecurrenceEnd(occurrenceCount: 30) // 30 occurrences
        )
        return try createRecurringEvent(title: title, start: startDate, end: endDate, rule: rule)
    }

    /// Create a weekly recurring event (e.g., every Monday and Wednesday)
    func createWeeklyEvent(title: String, startDate: Date, endDate: Date) throws -> EKEvent {
        let daysOfWeek = [
            EKRecurrenceDayOfWeek(.monday),
            EKRecurrenceDayOfWeek(.wednesday)
        ]
        let rule = EKRecurrenceRule(
            recurrenceWith: .weekly,
            interval: 1,
            daysOfTheWeek: daysOfWeek,
            daysOfTheMonth: nil,
            monthsOfTheYear: nil,
            weeksOfTheYear: nil,
            daysOfTheYear: nil,
            setPositions: nil,
            end: EKRecurrenceEnd(end: Calendar.current.date(byAdding: .month, value: 6, to: startDate)!)
        )
        return try createRecurringEvent(title: title, start: startDate, end: endDate, rule: rule)
    }

    /// Create a monthly recurring event (e.g., 15th of each month)
    func createMonthlyEvent(title: String, startDate: Date, endDate: Date) throws -> EKEvent {
        let rule = EKRecurrenceRule(
            recurrenceWith: .monthly,
            interval: 1,
            daysOfTheWeek: nil,
            daysOfTheMonth: [15 as NSNumber],
            monthsOfTheYear: nil,
            weeksOfTheYear: nil,
            daysOfTheYear: nil,
            setPositions: nil,
            end: nil // Repeats forever
        )
        return try createRecurringEvent(title: title, start: startDate, end: endDate, rule: rule)
    }

    private func createRecurringEvent(
        title: String, start: Date, end: Date, rule: EKRecurrenceRule
    ) throws -> EKEvent {
        let event = EKEvent(eventStore: store)
        event.title = title
        event.startDate = start
        event.endDate = end
        event.calendar = store.defaultCalendarForNewEvents
        event.addRecurrenceRule(rule)
        try store.save(event, span: .futureEvents)
        return event
    }
}
```

## Reminders (EKReminder)

```swift
extension CalendarManager {

    func fetchReminders(in calendars: [EKCalendar]? = nil) async -> [EKReminder] {
        let predicate = store.predicateForReminders(in: calendars)
        return await withCheckedContinuation { continuation in
            store.fetchReminders(matching: predicate) { reminders in
                continuation.resume(returning: reminders ?? [])
            }
        }
    }

    func fetchIncompleteReminders(
        from start: Date? = nil,
        to end: Date? = nil
    ) async -> [EKReminder] {
        let predicate = store.predicateForIncompleteReminders(
            withDueDateStarting: start,
            ending: end,
            calendars: nil
        )
        return await withCheckedContinuation { continuation in
            store.fetchReminders(matching: predicate) { reminders in
                continuation.resume(returning: reminders ?? [])
            }
        }
    }

    func createReminder(
        title: String,
        dueDate: DateComponents? = nil,
        priority: Int = 0,
        notes: String? = nil,
        list: EKCalendar? = nil
    ) throws -> EKReminder {
        let reminder = EKReminder(eventStore: store)
        reminder.title = title
        reminder.dueDateComponents = dueDate
        reminder.priority = priority  // 0 = none, 1 = high, 5 = medium, 9 = low
        reminder.notes = notes
        reminder.calendar = list ?? store.defaultCalendarForNewReminders()

        try store.save(reminder, commit: true)
        return reminder
    }

    func completeReminder(_ reminder: EKReminder) throws {
        reminder.isCompleted = true
        reminder.completionDate = Date()
        try store.save(reminder, commit: true)
    }
}
```

## EKEventEditViewController (UIKit / SwiftUI Bridge)

```swift
import SwiftUI
import EventKitUI

struct EventEditView: UIViewControllerRepresentable {
    @Environment(\.dismiss) private var dismiss
    let store: EKEventStore
    var event: EKEvent?

    func makeUIViewController(context: Context) -> EKEventEditViewController {
        let controller = EKEventEditViewController()
        controller.eventStore = store
        controller.event = event ?? EKEvent(eventStore: store)
        controller.editViewDelegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: EKEventEditViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(dismiss: dismiss)
    }

    final class Coordinator: NSObject, EKEventEditViewDelegate {
        let dismiss: DismissAction

        init(dismiss: DismissAction) {
            self.dismiss = dismiss
        }

        func eventEditViewController(
            _ controller: EKEventEditViewController,
            didCompleteWith action: EKEventEditViewAction
        ) {
            dismiss()
        }
    }
}
```

## Complete Calendar Integration Example

```swift
import SwiftUI
import EventKit

struct CalendarIntegrationView: View {
    @State private var manager = CalendarManager()
    @State private var showingAddEvent = false
    @State private var newTitle = ""
    @State private var newStartDate = Date()
    @State private var newEndDate = Date().addingTimeInterval(3600)

    var body: some View {
        NavigationStack {
            Group {
                if manager.authorizationStatus == .notDetermined {
                    ContentUnavailableView(
                        "Calendar Access Required",
                        systemImage: "calendar",
                        description: Text("Grant access to view and manage events.")
                    )
                } else if manager.events.isEmpty {
                    ContentUnavailableView("No Events", systemImage: "calendar.badge.exclamationmark")
                } else {
                    eventList
                }
            }
            .navigationTitle("Calendar")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add", systemImage: "plus") {
                        showingAddEvent = true
                    }
                }
            }
            .sheet(isPresented: $showingAddEvent) {
                addEventSheet
            }
            .task {
                await manager.requestAccess()
                manager.loadCalendars()
                manager.fetchUpcomingEvents(days: 14)
            }
        }
    }

    private var eventList: some View {
        List {
            ForEach(manager.events, id: \.eventIdentifier) { event in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Circle()
                            .fill(Color(cgColor: event.calendar.cgColor))
                            .frame(width: 10, height: 10)
                        Text(event.title)
                            .font(.headline)
                    }
                    Text(event.startDate, format: .dateTime)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    if let location = event.location, !location.isEmpty {
                        Label(location, systemImage: "mappin")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .onDelete { indexSet in
                for index in indexSet {
                    try? manager.deleteEvent(manager.events[index])
                }
                manager.fetchUpcomingEvents(days: 14)
            }
        }
    }

    private var addEventSheet: some View {
        NavigationStack {
            Form {
                TextField("Event Title", text: $newTitle)
                DatePicker("Start", selection: $newStartDate)
                DatePicker("End", selection: $newEndDate)
            }
            .navigationTitle("New Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showingAddEvent = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        try? manager.createEvent(
                            title: newTitle,
                            startDate: newStartDate,
                            endDate: newEndDate
                        )
                        manager.fetchUpcomingEvents(days: 14)
                        showingAddEvent = false
                    }
                    .disabled(newTitle.isEmpty)
                }
            }
        }
    }
}
```
