import Foundation
import Observation

/// Aggregate numbers for the dashboard header and stat tiles.
struct HabitDashboardSummary: Equatable, Sendable {
    let total: Int
    let doneToday: Int
    let bestStreak: Int
    let totalCompletions: Int

    var remaining: Int { max(total - doneToday, 0) }

    var progress: Double {
        total == 0 ? 0 : Double(doneToday) / Double(total)
    }

    var headline: String {
        if total == 0 { return "Nothing planned yet" }
        if remaining == 0 { return "All done for today" }
        return remaining == 1 ? "One more to go" : "\(remaining) more to go"
    }

    var detail: String {
        if total > 0 && remaining == 0 { return "Every habit is checked off. Rest well." }
        if bestStreak == 1 { return "Keep your 1-day streak alive." }
        if bestStreak > 1 { return "Keep your \(bestStreak)-day streak alive." }
        return "Check one off to start a streak."
    }
}

@MainActor @Observable
final class HabitListViewModel {
    private let store: any HabitStoring
    var errorMessage: String?
    var isPresentingAdd = false
    private(set) var completionTick = 0

    init(store: any HabitStoring) {
        self.store = store
    }

    func summary(for habits: [Habit], today: Date = Date()) -> HabitDashboardSummary {
        let calendar = Calendar.current
        let done = habits.filter { $0.isCompleted(on: today, calendar: calendar) }.count
        let best = habits.map { $0.currentStreak(asOf: today, calendar: calendar) }.max() ?? 0
        let completions = habits.reduce(0) { $0 + $1.history(calendar: calendar).count }
        return HabitDashboardSummary(total: habits.count, doneToday: done, bestStreak: best, totalCompletions: completions)
    }

    func toggleToday(_ habit: Habit) {
        let now = Date()
        let wasDone = habit.isCompleted(on: now)
        do {
            try store.setCompleted(habit, completed: !wasDone, on: now)
            if !wasDone { completionTick += 1 }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func add(name: String, notes: String?) {
        do {
            try store.add(name: name, notes: notes)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func delete(_ habits: [Habit]) {
        do {
            for habit in habits { try store.delete(habit) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
