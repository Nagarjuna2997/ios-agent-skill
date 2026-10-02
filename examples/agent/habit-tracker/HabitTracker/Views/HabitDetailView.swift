import SwiftUI
import SwiftData

/// Looks up a habit by id and shows its detail, or an empty state if it no longer exists.
struct HabitDetailLoader: View {
    @Query private var habits: [Habit]
    let store: any HabitStoring

    init(id: UUID, store: any HabitStoring) {
        self.store = store
        _habits = Query(filter: #Predicate<Habit> { $0.id == id })
    }

    var body: some View {
        if let habit = habits.first {
            HabitDetailView(habit: habit, store: store)
        } else {
            ContentUnavailableView("Habit Not Found", systemImage: "questionmark.circle")
        }
    }
}

struct HabitDetailView: View {
    let habit: Habit
    @State private var viewModel: HabitDetailViewModel
    @Environment(\.dismiss) private var dismiss

    init(habit: Habit, store: any HabitStoring) {
        self.habit = habit
        _viewModel = State(initialValue: HabitDetailViewModel(store: store))
    }

    var body: some View {
        let done = habit.isCompleted(on: Date())
        List {
            Section {
                if let notes = habit.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.body)
                } else {
                    Text("No notes")
                        .font(.body)
                        .foregroundStyle(.secondary)
                }
            } header: {
                Text("Notes").accessibilityAddTraits(.isHeader)
            }

            Section {
                Label("\(habit.currentStreak()) day streak", systemImage: "flame.fill")
                    .font(.title3.bold())
                    .foregroundStyle(AppColor.secondary)
                Button {
                    viewModel.toggleToday(habit)
                } label: {
                    Label(done ? "Mark Not Done" : "Mark Done Today",
                          systemImage: done ? "arrow.uturn.backward.circle" : "checkmark.circle.fill")
                        .minimumTapTarget()
                }
            } header: {
                Text("Streak").accessibilityAddTraits(.isHeader)
            }

            Section {
                let history = habit.history()
                if history.isEmpty {
                    Text("No completions yet")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(history, id: \.self) { day in
                        Label(day.formatted(date: .complete, time: .omitted), systemImage: "checkmark")
                    }
                }
            } header: {
                Text("History").accessibilityAddTraits(.isHeader)
            }
        }
        .navigationTitle(habit.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("Edit", systemImage: "pencil") { viewModel.isEditing = true }
                    Button("Delete", systemImage: "trash", role: .destructive) {
                        viewModel.isConfirmingDelete = true
                    }
                } label: {
                    Label("More", systemImage: "ellipsis.circle")
                        .labelStyle(.iconOnly)
                        .minimumTapTarget()
                }
            }
        }
        .sheet(isPresented: $viewModel.isEditing) {
            HabitFormView(title: "Edit Habit", name: habit.name, notes: habit.notes ?? "") { name, notes in
                viewModel.save(habit, name: name, notes: notes)
            }
        }
        .confirmationDialog("Delete this habit?", isPresented: $viewModel.isConfirmingDelete, titleVisibility: .visible) {
            Button("Delete", role: .destructive) {
                if viewModel.delete(habit) { dismiss() }
            }
            Button("Cancel", role: .cancel) {}
        }
        .alert("Something went wrong", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { if !$0 { viewModel.errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
        .appFeedback(.success, trigger: viewModel.completionTick)
    }
}

#Preview {
    let container = HabitSamples.container()
    let habit = (try? container.mainContext.fetch(FetchDescriptor<Habit>()))?.first ?? Habit(name: "Sample")
    NavigationStack {
        HabitDetailView(habit: habit, store: SwiftDataHabitStore(context: container.mainContext))
    }
    .modelContainer(container)
}
