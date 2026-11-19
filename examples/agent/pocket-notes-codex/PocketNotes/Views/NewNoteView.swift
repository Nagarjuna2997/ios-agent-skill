import SwiftUI

struct NewNoteView: View {
    @Environment(\.dismiss) private var dismiss
    @State var model: NewNoteViewModel
    private let spacing = ScaledSpacing()

    var body: some View {
        @Bindable var draft = model

        Form {
            Section {
                TextField("Enter a title", text: $draft.title, axis: .vertical)
                    .font(.headline)
                    .lineLimit(1...4)
                    .accessibilityLabel("Title")
            } header: {
                AppSectionHeader(title: "Title")
                    .accessibilityAddTraits(.isHeader)
            }
            .listRowBackground(AppColor.surface)

            Section {
                TextEditor(text: $draft.body)
                    .font(.body)
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: spacing.roomy * 6)
                    .accessibilityLabel("Body, optional")
            } header: {
                AppSectionHeader(title: "Body (optional)")
                    .accessibilityAddTraits(.isHeader)
            }
            .listRowBackground(AppColor.surface)
        }
        .scrollContentBackground(.hidden)
        .background(AppColor.secondary.opacity(0.18).ignoresSafeArea())
        .navigationTitle("New Note")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
                    .minimumTapTarget()
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") {
                    if model.save() { dismiss() }
                }
                .fontWeight(.semibold)
                .minimumTapTarget()
                .disabled(!model.canSave)
            }
        }
        .alert("Couldn’t save note", isPresented: $draft.showsSaveError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your draft is still here. Try saving it again.")
        }
        .fontDesign(AppTheme.fontDesign)
        .accessibilityIdentifier("screen-new-note")
    }
}

#Preview {
    let container = SampleData.previewContainer()
    let draft = NewNoteViewModel(store: LocalNoteStore(context: container.mainContext))
    if let sample = SampleData.makeNotes().first {
        draft.title = sample.title
        draft.body = sample.body
    }
    return NavigationStack {
        NewNoteView(model: draft)
    }
    .modelContainer(container)
}
