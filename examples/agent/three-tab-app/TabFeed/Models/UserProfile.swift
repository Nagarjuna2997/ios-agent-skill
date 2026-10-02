import Foundation
import SwiftData

@Model
final class UserProfile {
    var id: UUID
    var displayName: String
    var bio: String?
    @Attribute(.externalStorage) var avatarData: Data?

    init(id: UUID = UUID(), displayName: String, bio: String? = nil, avatarData: Data? = nil) {
        self.id = id
        self.displayName = displayName
        self.bio = bio
        self.avatarData = avatarData
    }
}
