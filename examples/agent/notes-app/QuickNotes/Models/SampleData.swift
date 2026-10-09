import Foundation
import SwiftData

/// Synthetic example records from the plan, used by previews and the agent's sample-data launches.
enum SampleData {
    /// Fresh `Note` instances matching the plan's sample records. Insert them into a context to use them.
    @MainActor
    static func notes() -> [Note] {
        [
            Note(
                id: uuid("B0000000-0000-0000-0000-000000000001"),
                title: "A slower Sunday",
                body: "Make coffee, open the windows, and leave a little space between plans.",
                createdAt: date("2026-10-08T08:15:00Z"),
                updatedAt: date("2026-10-08T08:15:00Z")
            ),
            Note(
                id: uuid("B0000000-0000-0000-0000-000000000002"),
                title: "Ideas for the garden",
                body: "Try rosemary beside the steps and add a small bench near the herbs.",
                createdAt: date("2026-10-07T17:40:00Z"),
                updatedAt: date("2026-10-08T07:10:00Z")
            ),
            Note(
                id: uuid("B0000000-0000-0000-0000-000000000003"),
                title: "Book notes",
                body: "The best ideas are the ones that still feel useful the next morning.",
                createdAt: date("2026-10-06T20:00:00Z"),
                updatedAt: date("2026-10-06T20:00:00Z")
            ),
        ]
    }

    /// Inserts the sample notes into `context` and saves. Only call this on an in-memory container.
    @MainActor
    static func seed(into context: ModelContext) {
        for note in notes() {
            context.insert(note)
        }
        try? context.save()
    }

    /// An in-memory container for previews, seeded with the sample notes unless `seeded` is false.
    @MainActor
    static func previewContainer(seeded: Bool = true) -> ModelContainer {
        let container = PersistenceController.preview(for: [Note.self])
        if seeded {
            seed(into: container.mainContext)
        }
        return container
    }

    /// The most recently updated note in `container`, for detail and edit previews.
    @MainActor
    static func mostRecentNoteID(in container: ModelContainer) -> UUID? {
        var descriptor = FetchDescriptor<Note>(sortBy: [SortDescriptor(\Note.updatedAt, order: .reverse)])
        descriptor.fetchLimit = 1
        return (try? container.mainContext.fetch(descriptor))?.first?.id
    }

    private static func uuid(_ string: String) -> UUID {
        UUID(uuidString: string) ?? UUID()
    }

    private static func date(_ iso8601: String) -> Date {
        ISO8601DateFormatter().date(from: iso8601) ?? .now
    }
}
