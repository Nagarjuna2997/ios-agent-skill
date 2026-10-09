import Foundation
import SwiftData

/// Realistic, synthetic examples for every model. Used by previews and by
/// `-ios-agent-sample-data YES` launches. Completion dates are relative to today so
/// streaks and the dashboard stay meaningful whenever the app is opened.
enum SampleData {
    static let readHabitID = UUID(uuidString: "A0000000-0000-0000-0000-000000000001")!
    static let walkHabitID = UUID(uuidString: "A0000000-0000-0000-0000-000000000002")!
    static let stretchHabitID = UUID(uuidString: "A0000000-0000-0000-0000-000000000003")!

    /// The plan's three example habits, not yet inserted into any context.
    @MainActor
    static func habits(today: Date = Date(), calendar: Calendar = .current) -> [Habit] {
        let start = calendar.startOfDay(for: today)

        func days(_ offsets: [Int]) -> [Date] {
            offsets.compactMap { calendar.date(byAdding: .day, value: -$0, to: start) }
        }

        func created(daysAgo: Int, hour: Int, minute: Int = 0) -> Date {
            let day = calendar.date(byAdding: .day, value: -daysAgo, to: start) ?? start
            return calendar.date(bySettingHour: hour, minute: minute, second: 0, of: day) ?? day
        }

        return [
            Habit(id: readHabitID,
                  name: "Read 20 minutes",
                  notes: "Any book counts.",
                  createdAt: created(daysAgo: 8, hour: 9),
                  completedDates: days([0, 1, 2])),
            Habit(id: walkHabitID,
                  name: "Walk outside",
                  notes: "A short loop after lunch.",
                  createdAt: created(daysAgo: 7, hour: 12),
                  completedDates: days([0, 1])),
            Habit(id: stretchHabitID,
                  name: "Stretch",
                  notes: "Five quiet minutes.",
                  createdAt: created(daysAgo: 6, hour: 7, minute: 30),
                  completedDates: days([1]))
        ]
    }

    /// An in-memory container seeded with the sample habits. Never touches the on-disk store.
    @MainActor
    static func container() throws -> ModelContainer {
        let container = try PersistenceController.container(for: [Habit.self], inMemory: true)
        for habit in habits() {
            container.mainContext.insert(habit)
        }
        try container.mainContext.save()
        return container
    }

    /// For #Preview blocks, which cannot recover from a container error.
    @MainActor
    static func previewContainer() -> ModelContainer {
        do {
            return try container()
        } catch {
            fatalError("Sample container failed: \(error)")
        }
    }

    /// The first sample habit from a seeded container, for detail previews.
    @MainActor
    static func firstHabit(in container: ModelContainer) -> Habit {
        var descriptor = FetchDescriptor<Habit>(sortBy: [SortDescriptor(\Habit.createdAt)])
        descriptor.fetchLimit = 1
        return (try? container.mainContext.fetch(descriptor).first) ?? habits()[0]
    }
}
