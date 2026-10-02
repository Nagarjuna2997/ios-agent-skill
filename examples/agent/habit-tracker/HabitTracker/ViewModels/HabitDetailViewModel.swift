import Foundation
import Observation

@MainActor @Observable
final class HabitDetailViewModel {
    private let store: any HabitStoring
    var errorMessage: String?
    var isEditing = false
    var isConfirmingDelete = false
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

    func save(_ habit: Habit, name: String, notes: String?) {
        do {
            try store.update(habit, name: name, notes: notes)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    /// Returns true when the habit was deleted.
    func delete(_ habit: Habit) -> Bool {
        do {
            try store.delete(habit)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
