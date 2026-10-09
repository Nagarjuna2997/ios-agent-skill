import Foundation
import SwiftData

/// Realistic, synthetic records for previews and `-ios-agent-sample-data` launches.
/// Every access builds fresh model instances, so each container gets its own copies.
@MainActor
enum SampleData {
    static var feedCards: [FeedCard] {
        [
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000001"),
                title: "Make room for focus",
                subtitle: "A small practice",
                body: "Choose one thing to finish before opening another tab.",
                imageName: "scope",
                createdAt: date("2026-10-09T09:00:00Z"),
                isFavorite: true
            ),
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000002"),
                title: "Notice the details",
                subtitle: "Field notes",
                body: "A walk can change the shape of an idea. Take the long way home.",
                imageName: "figure.walk",
                createdAt: date("2026-10-08T16:30:00Z"),
                isFavorite: false
            ),
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000003"),
                title: "Start with a sketch",
                subtitle: "Creative work",
                body: "A rough outline makes the first real decision easier.",
                imageName: "paintbrush.pointed",
                createdAt: date("2026-10-07T13:15:00Z"),
                isFavorite: false
            ),
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000004"),
                title: "Write it down",
                subtitle: "Field notes",
                body: "Ideas evaporate quickly. A pocket notebook catches more than memory does, and rereading it a week later shows which ones still matter.",
                imageName: "pencil.and.outline",
                createdAt: date("2026-10-06T18:45:00Z"),
                isFavorite: true
            ),
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000005"),
                title: "Slow mornings",
                subtitle: "Routine",
                body: "Ten minutes without a screen changes how the rest of the day unfolds. Make tea, open a window, and let the first thought arrive on its own.",
                imageName: "sunrise",
                createdAt: date("2026-10-05T07:20:00Z"),
                isFavorite: false
            ),
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000006"),
                title: "Ask a better question",
                subtitle: "Thinking tools",
                body: "When stuck, rewrite the problem in one plain sentence. The answer often follows the rewrite.",
                imageName: "questionmark.bubble",
                createdAt: date("2026-10-04T11:10:00Z"),
                isFavorite: false
            ),
            FeedCard(
                id: id("C0000000-0000-0000-0000-000000000007"),
                title: "Keep a shelf of unfinished things",
                subtitle: "Creative work",
                body: "Half-done projects are not failures. They are material for the next good idea, waiting for the right afternoon.",
                imageName: "books.vertical",
                createdAt: date("2026-10-02T15:00:00Z"),
                isFavorite: true
            )
        ]
    }

    static var userProfiles: [UserProfile] {
        [
            UserProfile(
                id: id("D0000000-0000-0000-0000-000000000001"),
                displayName: "Alex Morgan",
                bio: "Collecting good ideas and quiet moments."
            ),
            UserProfile(
                id: id("D0000000-0000-0000-0000-000000000002"),
                displayName: "Sam Rivera",
                bio: "Learning one small thing every day."
            )
        ]
    }

    /// The single profile shown on the Profile tab in demo mode and previews.
    static var userProfile: UserProfile { userProfiles[0] }

    /// Inserts the sample cards and the demo profile into `context` and saves.
    static func seed(into context: ModelContext) throws {
        for card in feedCards {
            context.insert(card)
        }
        context.insert(userProfile)
        try context.save()
    }

    private static func id(_ string: String) -> UUID {
        UUID(uuidString: string) ?? UUID()
    }

    private static func date(_ iso8601: String) -> Date {
        ISO8601DateFormatter().date(from: iso8601) ?? .now
    }
}
