import SwiftUI

private enum ExampleState: String, CaseIterable, Identifiable {
    case loading = "Loading"
    case empty = "Empty"
    case error = "Error"
    case content = "Content"

    var id: Self { self }
}

struct StatesGallery: View {
    @State private var state: ExampleState = .content

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Picker("Example state", selection: $state) {
                    ForEach(ExampleState.allCases) { state in
                        Text(state.rawValue).tag(state)
                    }
                }
                .pickerStyle(.menu)
                .padding(.horizontal)

                Group {
                    switch state {
                    case .loading:
                        ProgressView("Loading example")
                    case .empty:
                        ContentUnavailableView("No items yet", systemImage: "tray", description: Text("Add an item to get started."))
                    case .error:
                        ContentUnavailableView {
                            Label("Couldn't load", systemImage: "exclamationmark.triangle")
                        } description: {
                            Text("This is a simulated error.")
                        } actions: {
                            Button("Try again") { state = .content }
                        }
                    case .content:
                        VStack(spacing: 12) {
                            Label("Ready to go", systemImage: "checkmark.circle")
                                .font(.title3)
                            Text("This is an example of populated content.")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .navigationTitle("States")
        }
    }
}

#Preview {
    StatesGallery()
}
