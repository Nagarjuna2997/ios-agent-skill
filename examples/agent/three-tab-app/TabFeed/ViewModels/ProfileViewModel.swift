import Observation
import UIKit

@MainActor @Observable
final class ProfileViewModel {
    private let store: any ProfileStoring
    private var profile: UserProfile?

    var displayName = ""
    var bio = ""
    var image: UIImage?
    var isLoading = true
    var errorMessage: String?
    var didSave = false

    init(store: any ProfileStoring) {
        self.store = store
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

    func save() {
        didSave = false
        let name = displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            errorMessage = "Please enter a name."
            return
        }
        guard let profile else { return }
        errorMessage = nil
        profile.displayName = name
        let trimmedBio = bio.trimmingCharacters(in: .whitespacesAndNewlines)
        profile.bio = trimmedBio.isEmpty ? nil : trimmedBio
        profile.avatarData = image?.jpegData(compressionQuality: 0.8)
        do {
            try store.save()
            didSave = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removePhoto() {
        image = nil
        didSave = false
    }
}
