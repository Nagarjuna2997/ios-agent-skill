import SwiftUI

/// Shared form for adding and editing a habit.
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
                Section("Name") {
                    TextField("e.g. Read 20 minutes", text: $name)
                }
                Section("Notes") {
                    TextField("Optional notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
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
    }
}

#Preview {
    HabitFormView(title: "New Habit") { _, _ in }
}
