import SwiftUI

@main struct ReadingListApp: App {
    @State private var store: ReadingStore
    init() {
        let args = ProcessInfo.processInfo.arguments
        let persistence: any BookPersistence
        if args.contains("--test-error") { persistence = UnavailableBooks() }
        else {
            let filename = args.contains("--ui-testing") ? "ui-test-books.json" : "books.json"
            let url = URL.documentsDirectory.appending(path: filename)
            if args.contains("--reset-test-data") && args.contains("--ui-testing") {
                try? FileManager.default.removeItem(at: url)
            }
            persistence = DiskBooks(url: url)
        }
        _store = State(initialValue: ReadingStore(persistence: persistence))
    }
    var body: some Scene { WindowGroup { LibraryView(store: store) } }
}
struct LibraryView: View {
    @Bindable var store: ReadingStore
    @State private var query = ""
    @State private var adding = false
    var body: some View {
        NavigationStack {
            Group {
                if store.loading { ProgressView("Opening your library") }
                else if let message = store.message {
                    ContentUnavailableView {
                        Label("Library unavailable", systemImage: "exclamationmark.triangle")
                    } description: { Text(message) } actions: {
                        Button("Try again") { store.load() }.accessibilityIdentifier("retry")
                    }
                } else if store.books.isEmpty {
                    ContentUnavailableView("Your next chapter starts here", systemImage: "books.vertical", description: Text("Add a book you'd like to read. Your library stays on this device."))
                } else if store.filtered(query).isEmpty {
                    ContentUnavailableView.search(text: query)
                } else {
                    List(store.filtered(query)) { book in
                        NavigationLink {
                            BookDetail(store: store, id: book.id)
                        } label: {
                            HStack(spacing: 14) {
                                Image(systemName: book.finished ? "checkmark.circle.fill" : "book.closed")
                                    .foregroundStyle(book.finished ? Color.green : Color.accentColor)
                                    .accessibilityHidden(true)
                                VStack(alignment: .leading) {
                                    Text(book.title).font(.headline)
                                    if !book.author.isEmpty { Text(book.author).font(.subheadline).foregroundStyle(.secondary) }
                                    Text(book.finished ? "Finished" : "To read").font(.caption).foregroundStyle(.secondary)
                                }
                            }.padding(.vertical, 6)
                        }.accessibilityIdentifier("book-\(book.title)")
                    }
                }
            }
            .navigationTitle("Reading List")
            .searchable(text: $query, prompt: "Title or author")
            .toolbar { Button { adding = true } label: { Label("Add book", systemImage: "plus") }.accessibilityIdentifier("add-book").disabled(store.message != nil) }
            .sheet(isPresented: $adding) { AddBook(store: store) }
            .task { store.load() }
        }
    }
}
struct AddBook: View {
    @Bindable var store: ReadingStore
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var author = ""
    var body: some View {
        NavigationStack {
            Form {
                Section("Book details") {
                    TextField("Title", text: $title).accessibilityIdentifier("book-title")
                    TextField("Author", text: $author).accessibilityIdentifier("book-author")
                }
                if let message = store.message { Text(message).foregroundStyle(.red) }
            }
            .navigationTitle("Add a book")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { if store.add(title: title, author: author) { dismiss() } }
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        .accessibilityIdentifier("save-book")
                }
            }
        }
    }
}
struct BookDetail: View {
    @Bindable var store: ReadingStore
    let id: UUID
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        if let book = store.books.first(where: { $0.id == id }) {
            Form {
                Section { Text(book.title).font(.title2.bold()); Text(book.author).foregroundStyle(.secondary) }
                Section("Reading progress") {
                    Button(book.finished ? "Mark as unread" : "Mark as finished") { store.toggle(book) }.accessibilityIdentifier("toggle-finished")
                }
                Section { Button("Delete book", role: .destructive) { store.delete(book); if store.message == nil { dismiss() } } }
                if let message = store.message { Text(message).foregroundStyle(.red) }
            }.navigationTitle("Book details")
        }
    }
}
#Preview { LibraryView(store: ReadingStore(persistence: MemoryBooks(books: [Book(title: "A Room of One's Own", author: "Virginia Woolf")]))) }
