import Foundation
import Observation

@MainActor @Observable
final class HabitListViewModel {
    private let store: any HabitStoring
    var errorMessage: String?
    var isPresentingAdd = false
    private(set) var completionTick = 0

    init(store: any HabitStoring) {
        self.store = store
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
