import Foundation
import SwiftData
import SwiftUI

// MARK: - SwiftData Model Example

@Model
final class TodoItem {
    var title: String
    var notes: String
    var isCompleted: Bool
    var createdAt: Date
    var dueDate: Date?
    var priority: Priority

    @Relationship(deleteRule: .cascade, inverse: \Tag.items)
    var tags: [Tag]

    enum Priority: Int, Codable, CaseIterable {
        case low = 0
        case medium = 1
        case high = 2

        var label: String {
            switch self {
            case .low: "Low"
            case .medium: "Medium"
            case .high: "High"
            }
        }
    }

    init(
        title: String,
        notes: String = "",
        isCompleted: Bool = false,
        createdAt: Date = .now,
        dueDate: Date? = nil,
        priority: Priority = .medium,
        tags: [Tag] = []
    ) {
        self.title = title
        self.notes = notes
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.dueDate = dueDate
        self.priority = priority
        self.tags = tags
    }
}

@Model
final class Tag {
    var name: String
    var color: String
    var items: [TodoItem]

    init(name: String, color: String = "blue", items: [TodoItem] = []) {
        self.name = name
        self.color = color
        self.items = items
    }
}

// MARK: - Model Container Setup

struct PersistenceConfiguration {
    static func makeContainer() throws -> ModelContainer {
        let schema = Schema([
            TodoItem.self,
            Tag.self,
        ])

        let configuration = ModelConfiguration(
            "TodoStore",
            schema: schema,
            isStoredInMemoryOnly: false,
            cloudKitDatabase: .none
        )

        return try ModelContainer(
            for: schema,
            configurations: [configuration]
        )
    }

    static func makePreviewContainer() throws -> ModelContainer {
        let schema = Schema([
            TodoItem.self,
            Tag.self,
        ])

        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: true
        )

        let container = try ModelContainer(
            for: schema,
            configurations: [configuration]
        )

        // Insert sample data
        let context = container.mainContext
        let sampleItems = [
            TodoItem(title: "Buy groceries", priority: .high),
            TodoItem(title: "Read Swift docs", priority: .medium),
            TodoItem(title: "Go for a walk", isCompleted: true, priority: .low),
        ]
        sampleItems.forEach { context.insert($0) }

        return container
    }
}

// MARK: - SwiftData View Integration

struct TodoListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TodoItem.createdAt, order: .reverse) private var items: [TodoItem]
    @State private var newItemTitle = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        TextField("New item...", text: $newItemTitle)
                        Button("Add") {
                            addItem()
                        }
                        .disabled(newItemTitle.isEmpty)
                    }
                }

                Section("Active") {
                    ForEach(items.filter { !$0.isCompleted }) { item in
                        TodoRow(item: item)
                    }
                    .onDelete(perform: deleteItems)
                }

                Section("Completed") {
                    ForEach(items.filter(\.isCompleted)) { item in
                        TodoRow(item: item)
                    }
                }
            }
            .navigationTitle("Todos")
        }
    }

    private func addItem() {
        let item = TodoItem(title: newItemTitle)
        modelContext.insert(item)
        newItemTitle = ""
    }

    private func deleteItems(at offsets: IndexSet) {
        let activeItems = items.filter { !$0.isCompleted }
        for index in offsets {
            modelContext.delete(activeItems[index])
        }
    }
}

struct TodoRow: View {
    @Bindable var item: TodoItem

    var body: some View {
        HStack {
            Button {
                item.isCompleted.toggle()
            } label: {
                Image(systemName: item.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(item.isCompleted ? .green : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading) {
                Text(item.title)
                    .strikethrough(item.isCompleted)
                if let dueDate = item.dueDate {
                    Text(dueDate, style: .date)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Text(item.priority.label)
                .font(.caption2)
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(.quaternary)
                .clipShape(Capsule())
        }
    }
}

// MARK: - Query with Predicate Example

struct FilteredTodoListView: View {
    @Query private var items: [TodoItem]

    init(showCompleted: Bool = false, priority: TodoItem.Priority? = nil) {
        let showCompleted = showCompleted
        var descriptor = FetchDescriptor<TodoItem>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )

        if let priority {
            let priorityRaw = priority.rawValue
            descriptor.predicate = #Predicate<TodoItem> { item in
                item.isCompleted == showCompleted && item.priority.rawValue == priorityRaw
            }
        } else {
            descriptor.predicate = #Predicate<TodoItem> { item in
                item.isCompleted == showCompleted
            }
        }

        _items = Query(descriptor)
    }

    var body: some View {
        List(items) { item in
            TodoRow(item: item)
        }
    }
}
