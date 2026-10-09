import SwiftData
import SwiftUI

/// Top-level "notes-list" screen: an overview header followed by the notes, newest first.
struct NotesListView: View {
    @Query(sort: \Note.updatedAt, order: .reverse) private var notes: [Note]
    @State private var viewModel: NotesListViewModel
    private let spacing = ScaledSpacing()

    init(repository: any NoteRepository) {
        _viewModel = State(initialValue: NotesListViewModel(repository: repository))
    }

    var body: some View {
        @Bindable var vm = viewModel
        let visible = vm.filtered(notes)

        Group {
            if notes.isEmpty {
                emptyState
            } else {
                List {
                    Section {
                        overview
                            .listRowInsets(rowInsets(top: spacing.compact, bottom: spacing.standard))
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                    }

                    Section {
                        AppSectionHeader(title: vm.isSearching ? "Results" : "Newest first")
                            .accessibilityAddTraits(.isHeader)
                            .listRowInsets(rowInsets(top: 0, bottom: spacing.compact / 2))
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)

                        if visible.isEmpty {
                            AppEmptyStateView(
                                title: "No Results",
                                message: "Nothing matches “\(vm.searchText)”. Try another word from a title or note.",
                                symbol: "magnifyingglass"
                            )
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                        } else {
                            ForEach(visible) { note in
                                NavigationLink(value: Route.detail(note.id)) {
                                    NoteRow(note: note)
                                }
                                .listRowInsets(rowInsets(top: spacing.compact / 2, bottom: spacing.compact / 2))
                                .listRowSeparator(.hidden)
                                .listRowBackground(Color.clear)
                            }
                            .onDelete { offsets in
                                vm.delete(ids: offsets.map { visible[$0].id })
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .fontDesign(AppTheme.fontDesign)
        .navigationTitle("Notes")
        .navigationBarTitleDisplayMode(.inline)
        .searchable(text: $vm.searchText, prompt: "Search by title or text")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                NavigationLink(value: Route.compose(nil)) {
                    Label("New Note", systemImage: "square.and.pencil")
                }
                .minimumTapTarget()
            }
        }
        .appFeedback(.warning, trigger: vm.deleteCount)
        .alert("Something Went Wrong", isPresented: Binding(
            get: { vm.errorMessage != nil },
            set: { if !$0 { vm.errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(vm.errorMessage ?? "")
        }
    }

    private var overview: some View {
        VStack(alignment: .leading, spacing: spacing.standard) {
            HeroHeader(
                title: "Your notes",
                subtitle: "Saved on this device and kept newest first. Search by title or text to find one quickly.",
                symbol: "note.text"
            )
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: spacing.compact) { statTiles }
                VStack(spacing: spacing.compact) { statTiles }
            }
        }
    }

    @ViewBuilder
    private var statTiles: some View {
        AppStatTile(title: "Notes", value: notes.count.formatted(), symbol: "doc.text")
        AppStatTile(title: "This week", value: viewModel.updatedThisWeekCount(notes).formatted(), symbol: "calendar")
        AppStatTile(title: "Words", value: viewModel.totalWordCount(notes).formatted(), symbol: "textformat")
    }

    private var emptyState: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing.roomy) {
                HeroHeader(
                    title: "Your notes",
                    subtitle: "Saved on this device and kept newest first. Search by title or text to find one quickly.",
                    symbol: "note.text"
                )
                ThumbnailPlaceholder(symbol: "pencil.and.outline", title: "An empty page")
                    .frame(height: 140)
                AppEmptyStateView(
                    title: "No Notes Yet",
                    message: "Write a first note and it will still be here after you close the app.",
                    symbol: "note.text"
                )
                NavigationLink(value: Route.compose(nil)) {
                    Label("Write a Note", systemImage: "square.and.pencil")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(AppPrimaryButtonStyle())
            }
            .padding(AppTheme.screenInset)
        }
    }

    private func rowInsets(top: CGFloat, bottom: CGFloat) -> EdgeInsets {
        EdgeInsets(top: top, leading: AppTheme.screenInset, bottom: bottom, trailing: AppTheme.screenInset)
    }
}

/// One note in the list: an icon tile, title, a two-line excerpt and the last update.
private struct NoteRow: View {
    let note: Note
    private let spacing = ScaledSpacing()

    var body: some View {
        AppCard {
            HStack(alignment: .top, spacing: spacing.compact) {
                AppIconTile(symbol: "text.alignleft", accessibilityLabel: "Note")
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: spacing.compact / 2) {
                    Text(note.displayTitle)
                        .font(.headline)
                        .lineLimit(2)
                    if !note.body.isEmpty {
                        Text(note.body)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                    Text("Updated \(note.updatedAt, format: .dateTime.day().month().year())")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }
}

#Preview("With notes") {
    let container = SampleData.previewContainer()
    NavigationStack {
        NotesListView(repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}

#Preview("Empty") {
    let container = SampleData.previewContainer(seeded: false)
    NavigationStack {
        NotesListView(repository: SwiftDataNoteRepository(context: container.mainContext))
    }
    .modelContainer(container)
}
