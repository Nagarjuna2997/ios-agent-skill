# Home Screen widget

Adds a WidgetKit extension target (`<AppName>Widgets`) with `SummaryWidget`, a small and medium widget. The app writes a `WidgetSnapshot` into a shared App Group; the widget reads it.

Files:

- `Shared/WidgetSnapshot.swift`: the snapshot type and `WidgetSnapshotStore`, compiled into both targets.
- `Widget/SummaryWidget.swift`: the timeline provider and view, compiled into the extension only.

## Use

```swift
// After the data the widget summarizes changes:
WidgetSnapshotStore.publish(WidgetSnapshot(title: "Orders", value: "3", detail: "1 on the way"))
```

## Rules

From [WidgetKit](../../docs/frameworks/widgetkit.md):

- Widgets do not run continuously; the app publishes data and asks WidgetKit to reload.
- Use `.containerBackground(for: .widget)` so the widget adapts to every placement.
- App and extension share data through an App Group (`group.<bundle id>`); register it for the team before building for a device.
