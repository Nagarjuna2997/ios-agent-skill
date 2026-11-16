import SwiftUI

struct ControlsGallery: View {
    @State private var saved = false
    @State private var quantity = 1
    @State private var soundLevel = 0.5
    @State private var showDetail = false

    var body: some View {
        NavigationStack {
            List {
                Section("Text and symbols") {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("A clear heading").font(.title2.bold())
                        Text("System text styles adapt to the person's text size.")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    Label("Calendar", systemImage: "calendar")
                    Label("Favorites", systemImage: "star.fill")
                }
                Section("Actions") {
                    Button(saved ? "Remove from favorites" : "Add to favorites") {
                        saved.toggle()
                    }
                    Label(saved ? "Saved" : "Not saved", systemImage: saved ? "star.fill" : "star")
                        .foregroundStyle(.secondary)
                    Menu("More actions", systemImage: "ellipsis.circle") {
                        Button("Show details", systemImage: "info.circle") {
                            showDetail = true
                        }
                        ShareLink(item: "A sample item from the UI gallery")
                    }
                }
                Section("Selection") {
                    Stepper("Quantity: \(quantity)", value: $quantity, in: 1...10)
                    VStack(alignment: .leading) {
                        Text("Sound level")
                        Slider(value: $soundLevel, in: 0...1)
                            .accessibilityLabel("Sound level")
                            .accessibilityValue("\(Int(soundLevel * 100)) percent")
                    }
                }
                Section("Progress") {
                    ProgressView("Uploading", value: 0.65)
                    Gauge(value: 0.65, in: 0...1) {
                        Text("Storage used")
                    } currentValueLabel: {
                        Text("65%")
                    }
                }
                Section("Disclosure") {
                    DisclosureGroup("More information") {
                        Text("Use native controls when they fit the task.")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Controls")
            .alert("Details", isPresented: $showDetail) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("This is a local example of an alert.")
            }
        }
    }
}

#Preview {
    ControlsGallery()
}
