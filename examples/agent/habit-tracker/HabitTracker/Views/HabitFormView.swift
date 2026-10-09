import SwiftUI

/// Shared data-entry form for adding and editing a habit.
struct HabitFormView: View {
    let title: LocalizedStringKey
    let onSave: (String, String?) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var name: String
    @State private var notes: String

    init(title: LocalizedStringKey, name: String = "", notes: String = "", onSave: @escaping (String, String?) -> Void) {
        self.title = title
        self.onSave = onSave
        _name = State(initialValue: name)
        _notes = State(initialValue: notes)
    }

    private var trimmedName: String {
        name.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("e.g. Read 20 minutes", text: $name)
                } header: {
                    Text("Name").accessibilityAddTraits(.isHeader)
                }
                Section {
                    TextField("Optional notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                } header: {
                    Text("Notes").accessibilityAddTraits(.isHeader)
                } footer: {
                    Text("A short reminder of what counts, like \"Any book counts.\"")
                }
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let trimmedNotes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
                        onSave(trimmedName, trimmedNotes.isEmpty ? nil : trimmedNotes)
                        dismiss()
                    }
                    .disabled(trimmedName.isEmpty)
                }
            }
        }
        .fontDesign(AppTheme.fontDesign)
    }
}

#Preview {
    HabitFormView(title: "New Habit") { _, _ in }
}

#Preview("Editing") {
    HabitFormView(title: "Edit Habit", name: "Walk outside", notes: "A short loop after lunch.") { _, _ in }
}
