import EventKit

@MainActor
final class ReminderService {
    enum Failure: Error { case denied, noWritableList, invalidPriority }
    private let store: EKEventStore
    init(store: EKEventStore = EKEventStore()) { self.store = store }
    func authorize() async throws {
        guard try await store.requestFullAccessToReminders() else { throw Failure.denied }
    }
    private func checkAccess() throws {
        guard EKEventStore.authorizationStatus(for: .reminder) == .fullAccess else { throw Failure.denied }
    }
    func lists() throws -> [EKCalendar] {
        try checkAccess()
        return store.calendars(for: .reminder).filter(\.allowsContentModifications)
    }
    func create(title: String, list: EKCalendar? = nil, due: DateComponents? = nil, priority: Int = 0, notes: String? = nil, recurrence: EKRecurrenceRule? = nil) throws -> EKReminder {
        try checkAccess()
        guard (0...9).contains(priority) else { throw Failure.invalidPriority }
        guard let selected = list ?? store.defaultCalendarForNewReminders(), selected.allowsContentModifications else { throw Failure.noWritableList }
        let reminder = EKReminder(eventStore: store)
        reminder.calendar = selected; reminder.title = title; reminder.dueDateComponents = due
        reminder.priority = priority; reminder.notes = notes
        if let recurrence { reminder.addRecurrenceRule(recurrence) }
        try store.save(reminder, commit: true)
        return reminder
    }
    func complete(_ reminder: EKReminder, completed: Bool) throws {
        try checkAccess()
        reminder.isCompleted = completed
        try store.save(reminder, commit: true)
    }
}
