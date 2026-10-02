import Foundation
import SwiftData

/// In-memory sample data for previews.
enum HabitSamples {
    @MainActor
    static func container() -> ModelContainer {
        let container = PersistenceController.preview(for: [Habit.self])
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        func days(_ offsets: [Int]) -> [Date] {
            offsets.compactMap { calendar.date(byAdding: .day, value: -$0, to: today) }
        }
        container.mainContext.insert(Habit(name: "Read 20 minutes", notes: "Any book counts.", completedDates: days([0, 1, 2, 4])))
        container.mainContext.insert(Habit(name: "Drink water", notes: nil, completedDates: days([1, 2, 3])))
        container.mainContext.insert(Habit(name: "Stretch", notes: "Morning routine", completedDates: []))
        return container
    }
}
