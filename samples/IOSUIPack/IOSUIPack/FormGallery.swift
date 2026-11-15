import SwiftUI

struct FormGallery: View {
    @State private var name = ""
    @State private var notes = ""
    @State private var reminder = false
    @State private var priority = "Normal"
    @State private var dueDate = Date()
    @State private var color = Color.blue
    @State private var showSaved = false

    private let priorities = ["Low", "Normal", "High"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Name", text: $name)
                        .textContentType(.name)
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(2...5)
                }
                Section("Preferences") {
                    Toggle("Reminder", isOn: $reminder)
                    Picker("Priority", selection: $priority) {
                        ForEach(priorities, id: \.self) { value in
                            Text(value).tag(value)
                        }
                    }
                    DatePicker("Due date", selection: $dueDate, displayedComponents: .date)
                    ColorPicker("Accent color", selection: $color)
                }
                Section {
                    Button("Save example") {
                        showSaved = true
                    }
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                } footer: {
                    Text("This is a local example. No data is saved or sent.")
                }
            }
            .navigationTitle("Forms")
            .alert("Example complete", isPresented: $showSaved) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("The example is not connected to storage.")
            }
        }
    }
}

#Preview {
    FormGallery()
}
