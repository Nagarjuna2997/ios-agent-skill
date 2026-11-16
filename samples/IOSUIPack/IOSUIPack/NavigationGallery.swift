import SwiftUI

private struct SampleItem: Identifiable, Hashable {
    let id: UUID
    let title: String

    init(title: String) {
        self.id = UUID()
        self.title = title
    }
}

struct NavigationGallery: View {
    @State private var items = [SampleItem(title: "Ideas"), SampleItem(title: "Reading"), SampleItem(title: "Travel")]
    @State private var query = ""
    @State private var showAdd = false
    @State private var showRemoveAll = false

    private var visibleItems: [SampleItem] {
        query.isEmpty ? items : items.filter { $0.title.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        NavigationStack {
            List {
                if visibleItems.isEmpty {
                    ContentUnavailableView(
                        items.isEmpty ? "No items" : "No matches",
                        systemImage: "tray",
                        description: Text(items.isEmpty ? "Add an item to get started." : "Try another search.")
                    )
                } else {
                    ForEach(visibleItems) { item in
                        NavigationLink(value: item) {
                            Label(item.title, systemImage: "doc.text")
                        }
                    }
                    .onDelete { offsets in
                        let ids = Set(offsets.map { visibleItems[$0].id })
                        items.removeAll { ids.contains($0.id) }
                    }
                }
            }
            .navigationTitle("Lists")
            .searchable(text: $query, prompt: "Search items")
            .navigationDestination(for: SampleItem.self) { item in
                VStack(alignment: .leading, spacing: 12) {
                    Text(item.title).font(.title.bold())
                    Text("A sample detail screen with native navigation.")
                        .foregroundStyle(.secondary)
                    Spacer()
                }
                .padding()
                .navigationTitle("Details")
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add item", systemImage: "plus") { showAdd = true }
                }
                ToolbarItem(placement: .secondaryAction) {
                    Button("Remove all", role: .destructive) { showRemoveAll = true }
                        .disabled(items.isEmpty)
                }
            }
            .sheet(isPresented: $showAdd) {
                AddItemSheet { title in
                    items.append(SampleItem(title: title))
                }
            }
            .confirmationDialog("Remove all items?", isPresented: $showRemoveAll, titleVisibility: .visible) {
                Button("Remove all", role: .destructive) { items.removeAll() }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("This only changes the example for this session.")
            }
        }
    }
}

private struct AddItemSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    let onAdd: (String) -> Void

    private var cleanTitle: String {
        title.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Item name", text: $title)
            }
            .navigationTitle("Add item")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        onAdd(cleanTitle)
                        dismiss()
                    }
                    .disabled(cleanTitle.isEmpty)
                }
            }
        }
    }
}

#Preview {
    NavigationGallery()
}
