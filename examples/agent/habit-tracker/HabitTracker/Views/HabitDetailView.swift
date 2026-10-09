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
            AppEmptyStateView(title: "Habit Not Found",
                              message: "This habit may have been deleted.",
                              symbol: "questionmark.circle")
                .fontDesign(AppTheme.fontDesign)
        }
    }
}

/// Detail: illustration, hero title, status chips, stat tiles, primary action and history.
struct HabitDetailView: View {
    let habit: Habit
    @State private var viewModel: HabitDetailViewModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    private let spacing = ScaledSpacing()
    private let calendar = Calendar.current

    init(habit: Habit, store: any HabitStoring) {
        self.habit = habit
        _viewModel = State(initialValue: HabitDetailViewModel(store: store))
    }

    var body: some View {
        let today = Date()
        let done = habit.isCompleted(on: today, calendar: calendar)
        let streak = habit.currentStreak(asOf: today, calendar: calendar)
        let history = habit.history(calendar: calendar)
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Space.xLarge) {
                ThumbnailPlaceholder(symbol: habit.symbolName, title: "\(habit.name) illustration")
                    .frame(height: 150)
                HeroHeader(title: habit.name,
                           subtitle: notesText,
                           symbol: done ? "checkmark.seal.fill" : "leaf")
                chips(done: done)
                stats(streak: streak, total: history.count)
                Button {
                    viewModel.toggleToday(habit)
                } label: {
                    Label(done ? "Mark Not Done" : "Mark Done Today",
                          systemImage: done ? "arrow.uturn.backward.circle" : "checkmark.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(AppPrimaryButtonStyle())
                .motionAwareAnimation(.snappy(duration: AppTheme.motionDuration), value: done)
                VStack(alignment: .leading, spacing: spacing.compact) {
                    AppSectionHeader(title: "History")
                    historyCard(history)
                }
            }
            .padding(.horizontal, AppTheme.screenInset)
            .padding(.vertical, AppTheme.Space.large)
        }
        .background(Color(.systemGroupedBackground))
        .fontDesign(AppTheme.fontDesign)
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

    // MARK: - Sections

    private var notesText: String {
        if let notes = habit.notes, !notes.isEmpty { return notes }
        return "No notes yet."
    }

    private func chips(done: Bool) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: spacing.compact) {
                AppChip(title: done ? "Done today" : "Not done yet", selected: done)
                AppChip(title: "Started \(habit.createdAt.formatted(.dateTime.month(.abbreviated).day()))")
                AppChip(title: "Daily")
            }
        }
    }

    private func stats(streak: Int, total: Int) -> some View {
        let layout = dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(spacing: spacing.compact))
            : AnyLayout(HStackLayout(spacing: spacing.compact))
        return layout {
            AppStatTile(title: "Current streak", value: streak == 1 ? "1 day" : "\(streak) days", symbol: "flame.fill")
            AppStatTile(title: "Total check-ins", value: "\(total)", symbol: "calendar")
        }
    }

    @ViewBuilder
    private func historyCard(_ history: [Date]) -> some View {
        if history.isEmpty {
            AppCard {
                AppEmptyStateView(title: "No check-ins yet",
                                  message: "Mark today done to start your history.",
                                  symbol: "calendar")
            }
        } else {
            AppCard {
                VStack(alignment: .leading, spacing: spacing.compact) {
                    ForEach(Array(history.enumerated()), id: \.element) { index, day in
                        if index > 0 { Divider() }
                        HStack(spacing: spacing.compact) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(AppColor.primary)
                                .accessibilityHidden(true)
                            Text(day.formatted(date: .complete, time: .omitted))
                                .font(.body)
                            Spacer(minLength: AppTheme.Space.small)
                            if let label = relativeLabel(for: day) {
                                Text(label)
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .accessibilityElement(children: .combine)
                    }
                }
            }
        }
    }

    private func relativeLabel(for day: Date) -> String? {
        if calendar.isDateInToday(day) { return "Today" }
        if calendar.isDateInYesterday(day) { return "Yesterday" }
        return nil
    }
}

#Preview {
    let container = SampleData.previewContainer()
    NavigationStack {
        HabitDetailView(habit: SampleData.firstHabit(in: container),
                        store: SwiftDataHabitStore(context: container.mainContext))
    }
    .modelContainer(container)
}

#Preview("Loader") {
    let container = SampleData.previewContainer()
    NavigationStack {
        HabitDetailLoader(id: SampleData.walkHabitID,
                          store: SwiftDataHabitStore(context: container.mainContext))
    }
    .modelContainer(container)
}
