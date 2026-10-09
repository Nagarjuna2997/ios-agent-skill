import SwiftUI
import SwiftData

/// Dashboard: hero summary, progress ring, stat tiles and a card per habit.
struct HabitListView: View {
    @Query(sort: \Habit.createdAt) private var habits: [Habit]
    @State private var viewModel: HabitListViewModel
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    private let spacing = ScaledSpacing()

    init(store: any HabitStoring) {
        _viewModel = State(initialValue: HabitListViewModel(store: store))
    }

    var body: some View {
        let today = Date()
        ScrollView {
            if habits.isEmpty {
                AppEmptyStateView(
                    title: "No Habits Yet",
                    message: "Add a habit to start building a streak.",
                    symbol: "leaf",
                    actionTitle: "Add Habit"
                ) {
                    viewModel.isPresentingAdd = true
                }
                .padding(.top, AppTheme.Space.section)
            } else {
                dashboard(today: today)
            }
        }
        .background(Color(.systemGroupedBackground))
        .fontDesign(AppTheme.fontDesign)
        .navigationTitle("Habits")
        .navigationBarTitleDisplayMode(.inline)
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

    // MARK: - Dashboard

    private func dashboard(today: Date) -> some View {
        let summary = viewModel.summary(for: habits, today: today)
        return VStack(alignment: .leading, spacing: AppTheme.Space.xLarge) {
            HeroHeader(
                title: summary.headline,
                subtitle: today.formatted(.dateTime.weekday(.wide).month(.wide).day()),
                symbol: "leaf.fill"
            )
            progressCard(summary)
            statTiles(summary)
            VStack(alignment: .leading, spacing: spacing.compact) {
                AppSectionHeader(title: "Today's habits", actionTitle: "Add") {
                    viewModel.isPresentingAdd = true
                }
                ForEach(habits) { habit in
                    habitCard(habit, today: today)
                }
            }
        }
        .padding(.horizontal, AppTheme.screenInset)
        .padding(.vertical, AppTheme.Space.large)
    }

    private func progressCard(_ summary: HabitDashboardSummary) -> some View {
        AppCard {
            HStack(spacing: spacing.standard) {
                AppProgressRing(title: "Today", value: summary.progress)
                VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                    Text("\(summary.doneToday) of \(summary.total) done")
                        .font(.headline)
                        .contentTransition(.numericText())
                    Text(summary.detail)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .motionAwareAnimation(.snappy(duration: AppTheme.motionDuration), value: summary)
    }

    private func statTiles(_ summary: HabitDashboardSummary) -> some View {
        let layout = dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(spacing: spacing.compact))
            : AnyLayout(HStackLayout(spacing: spacing.compact))
        return layout {
            AppStatTile(title: "Best streak", value: dayCount(summary.bestStreak), symbol: "flame.fill")
            AppStatTile(title: "Check-ins", value: "\(summary.totalCompletions)", symbol: "calendar")
            AppStatTile(title: "Habits", value: "\(summary.total)", symbol: "list.bullet")
        }
    }

    private func habitCard(_ habit: Habit, today: Date) -> some View {
        let done = habit.isCompleted(on: today)
        let streak = habit.currentStreak(asOf: today)
        return AppCard {
            HStack(alignment: .center, spacing: spacing.standard) {
                Button {
                    viewModel.toggleToday(habit)
                } label: {
                    Image(systemName: done ? "checkmark.circle.fill" : "circle")
                        .font(.title)
                        .foregroundStyle(done ? AppColor.primary : Color.secondary)
                        .minimumTapTarget()
                }
                .buttonStyle(.plain)
                .motionAwareAnimation(.snappy(duration: AppTheme.motionDuration), value: done)
                .accessibilityLabel(done ? "Mark \(habit.name) not done" : "Mark \(habit.name) done")
                .accessibilityValue(done ? "Done today" : "Not done today")

                NavigationLink(value: AppRoute.habit(habit.id)) {
                    HStack(spacing: spacing.compact) {
                        VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                            Text(habit.name)
                                .font(.headline)
                                .foregroundStyle(.primary)
                            Label(streakText(streak), systemImage: "flame.fill")
                                .font(.subheadline)
                                .foregroundStyle(streak > 0 ? AppColor.secondary : Color.secondary)
                        }
                        Spacer(minLength: AppTheme.Space.small)
                        if !dynamicTypeSize.isAccessibilitySize {
                            AppChip(title: done ? "Done" : "To do", selected: done)
                        }
                        Image(systemName: "chevron.right")
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(.tertiary)
                            .accessibilityHidden(true)
                    }
                }
                .buttonStyle(.plain)
                .accessibilityHint("Opens habit details")
            }
        }
        .contextMenu {
            Button("Delete", systemImage: "trash", role: .destructive) {
                viewModel.delete([habit])
            }
        }
    }

    private func dayCount(_ days: Int) -> String {
        days == 1 ? "1 day" : "\(days) days"
    }

    private func streakText(_ streak: Int) -> String {
        streak == 1 ? "1 day streak" : "\(streak) day streak"
    }
}

#Preview {
    let container = SampleData.previewContainer()
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
