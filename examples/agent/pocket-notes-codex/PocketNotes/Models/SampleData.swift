import Foundation
import SwiftData

enum SampleData {
    static let firstNoteID = UUID(uuidString: "7CF5D978-6C5A-4C4F-AE29-5B4D6FB4D03A")!

    @MainActor
    static func makeNotes() -> [Note] {
        let dates = ISO8601DateFormatter()
        return [
            Note(id: firstNoteID, title: "Pantry restock", body: "Rolled oats\nCanned tomatoes\nBrown rice", createdAt: dates.date(from: "2026-01-12T15:30:00Z")!),
            Note(id: UUID(uuidString: "9DE11C99-2A5C-482F-8565-0B1A7159BB10")!, title: "Balcony garden ideas", body: "Try basil near the railing where it gets morning sun. Check that the pots drain before planting.", createdAt: dates.date(from: "2026-01-10T19:45:00Z")!),
            Note(id: UUID(uuidString: "CF195E62-606A-4020-9E3F-733560847D48")!, title: "Sketch prompt", body: "Draw the same coffee mug from three angles.", createdAt: dates.date(from: "2026-01-08T17:00:00Z")!)
        ]
    }

    @MainActor
    static func previewContainer() -> ModelContainer {
        let container = PersistenceController.preview(for: [Note.self])
        try! LocalNoteStore(context: container.mainContext).insertStarterNotesIfEmpty()
        return container
    }
}
