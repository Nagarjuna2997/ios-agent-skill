import SwiftUI

struct NotesListView: View {
    let notes: [Note]
    let selectedID: UUID?
    let store: any NoteStore
    let open: (UUID) -> Void
    let add: () -> Void
    let didDelete: (UUID) -> Void

    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var editing = false
    @State private var pendingDeletion: Note?
    @State private var confirmingDeletion = false
    @State private var showsDeleteError = false

    private let spacing = ScaledSpacing()

    private var ink: Color {
        colorScheme == .dark ? Color(red: 0.98, green: 0.96, blue: 0.92) : AppColor.primary
    }

    private var noteIconTint: Color {
        colorScheme == .dark ? Color(red: 0.66, green: 0.83, blue: 0.72) : AppColor.accent
    }

    var body: some View {
        List {
            if notes.isEmpty {
                rowStyle(AppEmptyStateView(title: "No notes yet", message: "Add a note to keep a thought, list, or reminder handy.", symbol: "note.text", actionTitle: "Add Note", action: add))
            } else {
                rowStyle(notebookHeader.padding(.vertical, spacing.compact))

                rowStyle(AppSectionHeader(title: notes.count == 1 ? "1 note" : "\(notes.count) notes")
                    .accessibilityAddTraits(.isHeader))

                ForEach(notes, id: \.id) { note in
                    rowStyle(noteRow(note))
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            Button {
                                requestDeletion(note)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                            .tint(.red)
                        }
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(AppColor.secondary.opacity(0.18).ignoresSafeArea())
        .navigationTitle("Notes")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                if !notes.isEmpty {
                    Button {
                        editing.toggle()
                    } label: {
                        Text(editing ? "Done" : "Edit")
                            .foregroundStyle(ink)
                    }
                    .minimumTapTarget()
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: add) {
                    Image(systemName: "square.and.pencil")
                        .foregroundStyle(ink)
                        .minimumTapTarget()
                }
                .accessibilityLabel("Add Note")
            }
        }
        .alert("Delete note?", isPresented: $confirmingDeletion, presenting: pendingDeletion) { note in
            Button("Cancel", role: .cancel) { pendingDeletion = nil }
            Button("Delete", role: .destructive) { delete(note) }
        } message: { note in
            Text("“\(note.title)” will be permanently deleted.")
        }
        .alert("Couldn’t delete note", isPresented: $showsDeleteError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("The note is still saved. Try deleting it again.")
        }
        .onChange(of: notes.isEmpty) { _, isEmpty in
            if isEmpty { editing = false }
        }
        .fontDesign(AppTheme.fontDesign)
        .accessibilityIdentifier("screen-notes")
    }

    private var notebookHeader: some View {
        VStack(alignment: .leading, spacing: AppTheme.Space.medium) {
            Image(systemName: "book.closed")
                .font(.title2.weight(.semibold))
                .foregroundStyle(ink)
                .accessibilityHidden(true)
            Text("Pocket Notes")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Saved on this device")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }

    private func rowStyle<Content: View>(_ content: Content) -> some View {
        content
            .listRowInsets(EdgeInsets(top: AppTheme.Space.xSmall, leading: AppTheme.screenInset, bottom: AppTheme.Space.xSmall, trailing: AppTheme.screenInset))
            .listRowSeparator(.hidden)
            .listRowBackground(Color.clear)
    }

    private func noteRow(_ note: Note) -> some View {
        AppCard {
            HStack(spacing: spacing.compact) {
                Button {
                    open(note.id)
                } label: {
                    let layout = typeSize.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: spacing.compact)) : AnyLayout(HStackLayout(spacing: spacing.standard))
                    layout {
                        AppIconTile(symbol: "note.text", tint: noteIconTint)
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                            Text(note.title)
                                .font(.headline)
                                .foregroundStyle(.primary)
                            if !note.body.isEmpty {
                                Text(note.body.split(whereSeparator: \.isWhitespace).joined(separator: " "))
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(2)
                            }
                            Text(note.createdAt, format: .dateTime.month(.abbreviated).day().year())
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityElement(children: .combine)
                .accessibilityAddTraits(selectedID == note.id ? .isSelected : [])

                if editing {
                    Button(role: .destructive) {
                        requestDeletion(note)
                    } label: {
                        Image(systemName: "trash")
                            .foregroundStyle(.red)
                            .minimumTapTarget()
                    }
                    .buttonStyle(.borderless)
                    .accessibilityLabel("Delete \(note.title)")
                } else if !typeSize.isAccessibilitySize {
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .accessibilityHidden(true)
                }
            }
        }
    }

    private func requestDeletion(_ note: Note) {
        pendingDeletion = note
        confirmingDeletion = true
    }

    private func delete(_ note: Note) {
        let id = note.id
        pendingDeletion = nil
        do {
            try store.delete(note)
            didDelete(id)
        } catch {
            showsDeleteError = true
        }
    }
}

#Preview {
    let container = SampleData.previewContainer()
    return NavigationStack {
        NotesListView(notes: SampleData.makeNotes(), selectedID: nil, store: LocalNoteStore(context: container.mainContext), open: { _ in }, add: {}, didDelete: { _ in })
    }
    .modelContainer(container)
}
