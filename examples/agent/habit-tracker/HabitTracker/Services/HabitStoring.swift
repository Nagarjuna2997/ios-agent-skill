import Foundation
import SwiftData

@MainActor
protocol HabitStoring {
    func add(name: String, notes: String?) throws
    func update(_ habit: Habit, name: String, notes: String?) throws
    func delete(_ habit: Habit) throws
    func setCompleted(_ habit: Habit, completed: Bool, on day: Date) throws
}

@MainActor
final class SwiftDataHabitStore: HabitStoring {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func add(name: String, notes: String?) throws {
        context.insert(Habit(name: name, notes: notes))
        try context.save()
    }

    func update(_ habit: Habit, name: String, notes: String?) throws {
        habit.name = name
        habit.notes = notes
        try context.save()
    }

    func delete(_ habit: Habit) throws {
        context.delete(habit)
        try context.save()
    }

    func setCompleted(_ habit: Habit, completed: Bool, on day: Date) throws {
        let calendar = Calendar.current
        if completed {
            if !habit.isCompleted(on: day, calendar: calendar) {
                habit.completedDates.append(calendar.startOfDay(for: day))
            }
        } else {
            habit.completedDates.removeAll { calendar.isDate($0, inSameDayAs: day) }
        }
        try context.save()
    }
}
