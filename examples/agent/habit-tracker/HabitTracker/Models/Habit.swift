import Foundation
import SwiftData

@Model
final class Habit {
    var id: UUID
    var name: String
    var notes: String?
    var createdAt: Date
    var completedDates: [Date]

    init(id: UUID = UUID(), name: String, notes: String? = nil, createdAt: Date = Date(), completedDates: [Date] = []) {
        self.id = id
        self.name = name
        self.notes = notes
        self.createdAt = createdAt
        self.completedDates = completedDates
    }
}

extension Habit {
    func isCompleted(on day: Date, calendar: Calendar = .current) -> Bool {
        completedDates.contains { calendar.isDate($0, inSameDayAs: day) }
    }

    /// Consecutive completed days ending today (or yesterday if today is not done yet).
    func currentStreak(asOf today: Date = Date(), calendar: Calendar = .current) -> Int {
        let days = Set(completedDates.map { calendar.startOfDay(for: $0) })
        var cursor = calendar.startOfDay(for: today)
        if !days.contains(cursor) {
            guard let yesterday = calendar.date(byAdding: .day, value: -1, to: cursor) else { return 0 }
            cursor = yesterday
        }
        var count = 0
        while days.contains(cursor) {
            count += 1
            guard let previous = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = previous
        }
        return count
    }

    /// Unique completed days, newest first.
    func history(calendar: Calendar = .current) -> [Date] {
        Set(completedDates.map { calendar.startOfDay(for: $0) }).sorted(by: >)
    }
}
