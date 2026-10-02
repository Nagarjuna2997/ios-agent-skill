import Foundation
import SwiftData

@MainActor
protocol ProfileStoring {
    func loadOrCreate() throws -> UserProfile
    func save() throws
}

@MainActor
final class SwiftDataProfileStore: ProfileStoring {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func loadOrCreate() throws -> UserProfile {
        var descriptor = FetchDescriptor<UserProfile>()
        descriptor.fetchLimit = 1
        if let existing = try context.fetch(descriptor).first {
            return existing
        }
        let profile = UserProfile(displayName: "Guest")
        context.insert(profile)
        try context.save()
        return profile
    }

    func save() throws {
        try context.save()
    }
}
