import EventKit

/// App-facing EventKit objects stay on the main actor; do not send EKEvent across actors.
@MainActor
final class CalendarService {
    enum Failure: Error { case denied, noWritableCalendar, invalidDates }
    private let store: EKEventStore
    init(store: EKEventStore = EKEventStore()) { self.store = store }
    func authorize() async throws {
        guard try await store.requestFullAccessToEvents() else { throw Failure.denied }
    }
    private func checkAccess() throws {
        guard EKEventStore.authorizationStatus(for: .event) == .fullAccess else { throw Failure.denied }
    }
    func calendars() throws -> [EKCalendar] {
        try checkAccess()
        return store.calendars(for: .event).filter(\.allowsContentModifications)
    }
    func events(from start: Date, to end: Date, calendars: [EKCalendar]? = nil) throws -> [EKEvent] {
        try checkAccess()
        guard start < end else { throw Failure.invalidDates }
        return store.events(matching: store.predicateForEvents(withStart: start, end: end, calendars: calendars))
    }
    func create(title: String, start: Date, end: Date, calendar: EKCalendar? = nil, alarmOffsets: [TimeInterval] = []) throws -> EKEvent {
        try checkAccess()
        guard start < end else { throw Failure.invalidDates }
        guard let selected = calendar ?? store.defaultCalendarForNewEvents, selected.allowsContentModifications else { throw Failure.noWritableCalendar }
        let event = EKEvent(eventStore: store)
        event.calendar = selected; event.title = title; event.startDate = start; event.endDate = end
        event.alarms = alarmOffsets.map { EKAlarm(relativeOffset: $0) }
        try store.save(event, span: .thisEvent)
        return event
    }
    /// Caller edits the event, asks for confirmation and chooses recurring-event scope.
    func update(_ event: EKEvent, span: EKSpan) throws {
        try checkAccess()
        guard event.calendar.allowsContentModifications else { throw Failure.noWritableCalendar }
        guard event.startDate < event.endDate else { throw Failure.invalidDates }
        try store.save(event, span: span)
    }
    func delete(_ event: EKEvent, span: EKSpan) throws {
        try checkAccess()
        try store.remove(event, span: span)
    }
}
