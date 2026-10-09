import Observation
import UIKit

@MainActor @Observable
final class ProfileViewModel {
    private let store: any ProfileStoring
    private var profile: UserProfile?

    /// Saved values shown on the Profile screen.
    var displayName = ""
    var bio = ""
    var image: UIImage?
    var isLoading = true
    var errorMessage: String?
    var didSave = false

    /// Draft values edited in the sheet; copied back only on a successful save.
    var isEditing = false
    var draftName = ""
    var draftBio = ""
    var draftImage: UIImage?
    var draftError: String?

    init(store: any ProfileStoring) {
        self.store = store
    }

    var hasBio: Bool { !bio.isEmpty }

    var initials: String { Self.initials(for: displayName) }

    var draftInitials: String { Self.initials(for: draftName) }

    static func initials(for name: String) -> String {
        let letters = name
            .split(separator: " ")
            .prefix(2)
            .compactMap { $0.first }
            .map { String($0).uppercased() }
            .joined()
        return letters.isEmpty ? "?" : letters
    }

    func load() {
        guard profile == nil else {
            isLoading = false
            return
        }
        isLoading = true
        errorMessage = nil
        do {
            let loaded = try store.loadOrCreate()
            profile = loaded
            displayName = loaded.displayName
            bio = loaded.bio ?? ""
            image = loaded.avatarData.flatMap { UIImage(data: $0) }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func beginEditing() {
        draftName = displayName
        draftBio = bio
        draftImage = image
        draftError = nil
        didSave = false
        isEditing = true
    }

    func cancelEditing() {
        draftError = nil
        isEditing = false
    }

    func removeDraftPhoto() {
        draftImage = nil
    }

    func save() {
        let name = draftName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            draftError = "Please enter a name."
            return
        }
        guard let profile else {
            draftError = "The profile is still loading. Try again in a moment."
            return
        }
        let trimmedBio = draftBio.trimmingCharacters(in: .whitespacesAndNewlines)
        profile.displayName = name
        profile.bio = trimmedBio.isEmpty ? nil : trimmedBio
        profile.avatarData = draftImage?.jpegData(compressionQuality: 0.8)
        do {
            try store.save()
            displayName = name
            bio = trimmedBio
            image = draftImage
            draftError = nil
            didSave = true
            isEditing = false
        } catch {
            draftError = error.localizedDescription
        }
    }
}
