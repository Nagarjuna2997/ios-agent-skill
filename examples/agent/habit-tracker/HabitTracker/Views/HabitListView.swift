import SwiftUI
import SwiftData

struct HabitListView: View {
    @Query(sort: \Habit.createdAt) private var habits: [Habit]
    @State private var viewModel: HabitListViewModel
    @State private var spacing = ScaledSpacing()

    init(store: any HabitStoring) {
        _viewModel = State(initialValue: HabitListViewModel(store: store))
    }

    var body: some View {
        Group {
            if habits.isEmpty {
                ContentUnavailableView {
                    Label("No Habits Yet", systemImage: "checkmark.circle")
                } description: {
                    Text("Add a habit to start building a streak.")
                } actions: {
                    Button("Add Habit") { viewModel.isPresentingAdd = true }
                        .buttonStyle(.borderedProminent)
                }
            } else {
                List {
                    ForEach(habits) { habit in
                        row(for: habit)
                    }
                    .onDelete { offsets in
                        viewModel.delete(offsets.map { habits[$0] })
                    }
                }
            }
        }
        .navigationTitle("Habits")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                NavigationLink(value: AppRoute.settings) {
                    Label("Settings", systemImage: "gearshape")
                        .labelStyle(.iconOnly)
                        .minimumTapTarget()
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    viewModel.isPresentingAdd = true
                } label: {
                    Label("Add Habit", systemImage: "plus")
                        .labelStyle(.iconOnly)
                        .minimumTapTarget()
                }
            }
        }
        .sheet(isPresented: $viewModel.isPresentingAdd) {
            HabitFormView(title: "New Habit") { name, notes in
                viewModel.add(name: name, notes: notes)
            }
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

    private func row(for habit: Habit) -> some View {
        let done = habit.isCompleted(on: Date())
        let streak = habit.currentStreak()
        return HStack(spacing: spacing.standard) {
            Button {
                viewModel.toggleToday(habit)
            } label: {
                Image(systemName: done ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(done ? AppColor.primary : Color.secondary)
                    .minimumTapTarget()
            }
            .buttonStyle(.borderless)
            .motionAwareAnimation(.spring, value: done)
            .accessibilityLabel(habit.name)
            .accessibilityValue(done ? "Done today" : "Not done today")
            .accessibilityHint("Toggles today's completion")

            NavigationLink(value: AppRoute.habit(habit.id)) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(habit.name)
                        .font(.headline)
                    Label("\(streak) day streak", systemImage: "flame.fill")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

#Preview {
    let container = HabitSamples.container()
    NavigationStack {
        HabitListView(store: SwiftDataHabitStore(context: container.mainContext))
    }
    .modelContainer(container)
}

#Preview("Empty") {
    let container = PersistenceController.preview(for: [Habit.self])
    NavigationStack {
        HabitListView(store: SwiftDataHabitStore(context: container.mainContext))
    }
    .modelContainer(container)
}
