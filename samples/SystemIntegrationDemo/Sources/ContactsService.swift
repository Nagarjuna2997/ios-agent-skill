import Contacts
import ContactsUI
import SwiftUI

/// Prefer this picker when the user only needs to select a contact. No store permission.
struct ContactSelection: UIViewControllerRepresentable {
    let selected: (CNContact) -> Void
    let cancelled: () -> Void
    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> CNContactPickerViewController {
        let picker = CNContactPickerViewController(); picker.delegate = context.coordinator; return picker
    }
    func updateUIViewController(_ controller: CNContactPickerViewController, context: Context) { context.coordinator.parent = self }
    @MainActor final class Coordinator: NSObject, @preconcurrency CNContactPickerDelegate {
        var parent: ContactSelection
        init(parent: ContactSelection) { self.parent = parent }
        func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) { parent.selected(contact) }
        func contactPickerDidCancel(_ picker: CNContactPickerViewController) { parent.cancelled() }
    }
}

/// Direct access is a separate opt-in operation. Returned results may be limited by the user.
@MainActor
final class ContactsService {
    enum Failure: Error { case denied, immutableContact }
    private let store: CNContactStore
    init(store: CNContactStore = CNContactStore()) { self.store = store }
    func authorize() async throws {
        guard try await store.requestAccess(for: .contacts) else { throw Failure.denied }
    }
    func search(_ name: String) throws -> [CNContact] {
        let keys: [CNKeyDescriptor] = [CNContactIdentifierKey as CNKeyDescriptor, CNContactGivenNameKey as CNKeyDescriptor, CNContactFamilyNameKey as CNKeyDescriptor, CNContactThumbnailImageDataKey as CNKeyDescriptor]
        return try store.unifiedContacts(matching: CNContact.predicateForContacts(matchingName: name), keysToFetch: keys)
    }
    func create(givenName: String, familyName: String) throws {
        let contact = CNMutableContact(); contact.givenName = givenName; contact.familyName = familyName
        let request = CNSaveRequest(); request.add(contact, toContainerWithIdentifier: nil); try store.execute(request)
    }
    func update(_ contact: CNContact, givenName: String, familyName: String) throws {
        guard let mutable = contact.mutableCopy() as? CNMutableContact else { throw Failure.immutableContact }
        mutable.givenName = givenName; mutable.familyName = familyName
        let request = CNSaveRequest(); request.update(mutable); try store.execute(request)
    }
}
