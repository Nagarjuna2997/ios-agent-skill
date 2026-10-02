# Searchable lists

Matching and empty-state helpers for SwiftUI's `.searchable`.

## Use

```swift
List(model.filtered) { note in NoteRow(note: note) }
    .searchable(text: $model.query, prompt: "Search notes")
    .overlay {
        if model.filtered.isEmpty, !model.query.isEmpty { SearchNoResultsView(query: model.query) }
    }

// In the view model:
var filtered: [Note] { notes.filter { $0.title.matchesSearch(query) || $0.body.matchesSearch(query) } }
```

## Rules

From [views and controls](../../docs/swiftui/views-and-controls.md):

- Filter in the view model, not in `body`.
- Matching ignores case and diacritics and follows the user's locale.
- Distinguish "no data yet" from "no results for this query".
