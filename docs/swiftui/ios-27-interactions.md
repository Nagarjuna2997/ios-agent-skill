# SwiftUI iOS 27 Interactions

## Overview

SwiftUI's iOS 27 generation adds interaction APIs for custom containers that previously required `List` or hand-rolled drag/swipe behavior: reorderable content, swipe actions in arbitrary row containers, and richer toolbar adaptation.

> These APIs are beta in the iOS 27 SDK. Guard examples with availability and check the latest SDK signatures before shipping.

---

## 1. Reordering in Lists, Stacks, Grids, and Custom Layouts

Use `reorderable()` on the `ForEach` that produces reorderable views, then place a `reorderContainer` on the enclosing container.

```swift
import SwiftUI

@available(iOS 27.0, macOS 27.0, *)
struct PhotoGrid: View {
    @State private var photos: [Photo] = []

    var body: some View {
        LazyVGrid(columns: [.init(.adaptive(minimum: 120))]) {
            ForEach(photos) { photo in
                PhotoTile(photo: photo)
            }
            .reorderable()
        }
        .reorderContainer(for: Photo.self) { difference in
            apply(difference)
        }
    }

    private func apply(_ difference: ReorderDifference<Photo.ID, ReorderableSingleCollectionIdentifier>) {
        // Update the source of truth from the system-provided difference.
    }
}
```

Rules:

- Item identifiers must be stable, `Hashable`, and `Sendable`.
- Update the data source in the `move` closure; do not rely on view order alone.
- Disable reordering while saves or sync merges are in flight.
- For multiple sections, use `reorderable(collectionID:)`.

---

## 2. Swipe Actions Outside `List`

Use the new `swipeActions` overload when you need presentation state, and add `swipeActionsContainer()` to the scroll/container view.

```swift
@available(iOS 27.0, *)
struct MessagesView: View {
    @State private var swipedMessageID: Message.ID?
    let messages: [Message]

    var body: some View {
        ScrollView {
            LazyVStack {
                ForEach(messages) { message in
                    MessageRow(message: message)
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                delete(message)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        } onPresentationChanged: { isPresented in
                            swipedMessageID = isPresented ? message.id : nil
                        }
                }
            }
        }
        .swipeActionsContainer()
    }
}
```

`List` already coordinates swipe actions. Use `swipeActionsContainer()` for `ScrollView`, stacks, grids, and custom row layouts so only one row is open and scrolling/tapping dismisses actions.

---

## 3. Adaptive Toolbars

The iOS 27 toolbar direction is adaptive: content should survive compact widths, overflow, user customization, and platform differences.

Review toolbars for:

- semantic placement instead of hardcoded positions
- stable labels and SF Symbols
- priority for actions that must remain visible
- overflow behavior for secondary actions
- pinned trailing items only when the task requires persistent access
- keyboard and pointer alternatives on iPad/macOS

Avoid toolbar-only workflows. Every critical action still needs an accessible path when it moves to overflow.

---

## 4. Testing

Test these interaction surfaces on:

- compact iPhone portrait
- iPhone landscape
- iPad split view
- iPad Stage Manager / resizable windows
- Dynamic Type accessibility sizes
- VoiceOver
- pointer/keyboard input

For reordering, include sync and persistence tests. For swipe actions, include dismissal, full-swipe, destructive confirmation, and VoiceOver action alternatives.

---

## 5. Review Checklist

- [ ] iOS 27 APIs have availability guards
- [ ] Reorder identifiers are stable, `Hashable`, and `Sendable`
- [ ] Reorder closure updates the source of truth
- [ ] Reordering disables during conflicting saves/sync
- [ ] Custom swipe rows use `swipeActionsContainer()`
- [ ] Destructive swipe actions have undo or confirmation where needed
- [ ] Toolbar actions remain reachable in compact/overflow states
- [ ] Interaction tests cover iPad resizability and accessibility

See also: `docs/swiftui/views-and-controls.md`, `docs/swiftui/layout.md`, `docs/tooling/device-hub.md`.
