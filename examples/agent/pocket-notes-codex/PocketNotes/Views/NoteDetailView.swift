import SwiftUI

struct NoteDetailView: View {
    let note: Note?
    private let spacing = ScaledSpacing()

    var body: some View {
        ScrollView {
            if let note {
                VStack(alignment: .leading, spacing: spacing.roomy) {
                    HeroHeader(title: note.title, subtitle: note.createdAt.formatted(date: .abbreviated, time: .omitted), symbol: "note.text")
                        .accessibilityAddTraits(.isHeader)
                    if !note.body.isEmpty {
                        AppCard {
                            Text(note.body)
                                .font(.body)
                                .textSelection(.enabled)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppTheme.screenInset)
                .padding(.vertical, spacing.roomy)
            } else {
                AppEmptyStateView(title: "Select a note", message: "Open a note from the list to read it here.", symbol: "note.text")
            }
        }
        .background(AppColor.secondary.opacity(0.18).ignoresSafeArea())
        .navigationTitle("Note")
        .navigationBarTitleDisplayMode(.inline)
        .fontDesign(AppTheme.fontDesign)
        .accessibilityIdentifier("screen-note-detail")
    }
}

#Preview {
    NavigationStack {
        NoteDetailView(note: SampleData.makeNotes().first)
    }
}
