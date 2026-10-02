import SwiftUI
import WidgetKit

struct SummaryEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
}

struct SummaryProvider: TimelineProvider {
    func placeholder(in context: Context) -> SummaryEntry {
        SummaryEntry(date: .now, snapshot: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (SummaryEntry) -> Void) {
        completion(SummaryEntry(date: .now, snapshot: WidgetSnapshotStore.load() ?? .placeholder))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SummaryEntry>) -> Void) {
        let entry = SummaryEntry(date: .now, snapshot: WidgetSnapshotStore.load() ?? .placeholder)
        // The app reloads timelines when it publishes; .never avoids needless wakeups.
        completion(Timeline(entries: [entry], policy: .never))
    }
}

struct SummaryWidgetView: View {
    let entry: SummaryEntry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.snapshot.title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(entry.snapshot.value)
                .font(family == .systemSmall ? .title.bold() : .largeTitle.bold())
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Spacer(minLength: 0)
            Text(entry.snapshot.detail)
                .font(.footnote)
                .lineLimit(2)
            Text(entry.snapshot.updatedAt, style: .relative)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct SummaryWidget: Widget {
    let kind = "SummaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SummaryProvider()) { entry in
            SummaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Summary")
        .description("The latest summary from __DISPLAY_NAME__.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    SummaryWidget()
} timeline: {
    SummaryEntry(date: .now, snapshot: WidgetSnapshot(title: "Orders", value: "3", detail: "1 on the way"))
}
