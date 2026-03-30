# Contacts Framework

## CNContactStore Setup and Authorization

Add to `Info.plist`:
- `NSContactsUsageDescription` — required for contact access

```swift
import Contacts

@Observable
final class ContactManager {
    var contacts: [CNContact] = []
    var authorizationStatus: CNAuthorizationStatus = .notDetermined
    var error: Error?

    private let store = CNContactStore()

    /// Check current authorization status
    func checkAuthorization() {
        authorizationStatus = CNContactStore.authorizationStatus(for: .contacts)
    }

    /// Request access to contacts
    func requestAccess() async -> Bool {
        do {
            let granted = try await store.requestAccess(for: .contacts)
            authorizationStatus = granted ? .authorized : .denied
            return granted
        } catch {
            self.error = error
            authorizationStatus = .denied
            return false
        }
    }
}
```

## CNContactFetchRequest with Key Descriptors

Key descriptors specify which contact properties to fetch. Only request what you need for performance.

```swift
extension ContactManager {

    /// Standard keys for displaying a contact list
    static let listKeys: [CNKeyDescriptor] = [
        CNContactIdentifierKey as CNKeyDescriptor,
        CNContactGivenNameKey as CNKeyDescriptor,
        CNContactFamilyNameKey as CNKeyDescriptor,
        CNContactOrganizationNameKey as CNKeyDescriptor,
        CNContactPhoneNumbersKey as CNKeyDescriptor,
        CNContactEmailAddressesKey as CNKeyDescriptor,
        CNContactImageDataAvailableKey as CNKeyDescriptor,
        CNContactThumbnailImageDataKey as CNKeyDescriptor,
        CNContactFormatter.descriptorForRequiredKeys(for: .fullName)
    ]

    /// Extended keys for a contact detail view
    static let detailKeys: [CNKeyDescriptor] = listKeys + [
        CNContactImageDataKey as CNKeyDescriptor,
        CNContactPostalAddressesKey as CNKeyDescriptor,
        CNContactBirthdayKey as CNKeyDescriptor,
        CNContactUrlAddressesKey as CNKeyDescriptor,
        CNContactSocialProfilesKey as CNKeyDescriptor,
        CNContactNoteKey as CNKeyDescriptor,
        CNContactJobTitleKey as CNKeyDescriptor,
        CNContactDepartmentNameKey as CNKeyDescriptor,
    ]

    /// Fetch all contacts
    func fetchAllContacts() throws {
        var results: [CNContact] = []
        let request = CNContactFetchRequest(keysToFetch: Self.listKeys)
        request.sortOrder = .userDefault

        try store.enumerateContacts(with: request) { contact, _ in
            results.append(contact)
        }
        contacts = results
    }
}
```

## Searching Contacts

```swift
extension ContactManager {

    /// Search by name
    func searchByName(_ name: String) throws -> [CNContact] {
        let predicate = CNContact.predicateForContacts(matchingName: name)
        return try store.unifiedContacts(
            matching: predicate,
            keysToFetch: Self.listKeys
        )
    }

    /// Search by email
    func searchByEmail(_ email: String) throws -> [CNContact] {
        let predicate = CNContact.predicateForContacts(matchingEmailAddress: email)
        return try store.unifiedContacts(
            matching: predicate,
            keysToFetch: Self.listKeys
        )
    }

    /// Search by phone number
    func searchByPhone(_ phoneNumber: String) throws -> [CNContact] {
        let phoneValue = CNPhoneNumber(stringValue: phoneNumber)
        let predicate = CNContact.predicateForContacts(matching: phoneValue)
        return try store.unifiedContacts(
            matching: predicate,
            keysToFetch: Self.listKeys
        )
    }

    /// Fetch a single contact by identifier
    func fetchContact(identifier: String) throws -> CNContact {
        let predicate = CNContact.predicateForContacts(withIdentifiers: [identifier])
        guard let contact = try store.unifiedContacts(
            matching: predicate,
            keysToFetch: Self.detailKeys
        ).first else {
            throw ContactError.notFound
        }
        return contact
    }

    /// Fetch contacts in a specific group
    func fetchContacts(inGroup groupIdentifier: String) throws -> [CNContact] {
        let predicate = CNContact.predicateForContactsInGroup(withIdentifier: groupIdentifier)
        return try store.unifiedContacts(
            matching: predicate,
            keysToFetch: Self.listKeys
        )
    }

    /// Fetch contacts in a specific container (iCloud, Google, etc.)
    func fetchContacts(inContainer containerIdentifier: String) throws -> [CNContact] {
        let predicate = CNContact.predicateForContactsInContainer(withIdentifier: containerIdentifier)
        return try store.unifiedContacts(
            matching: predicate,
            keysToFetch: Self.listKeys
        )
    }
}

enum ContactError: LocalizedError {
    case notFound, notAuthorized, saveFailed

    var errorDescription: String? {
        switch self {
        case .notFound: "Contact not found."
        case .notAuthorized: "Contacts access not authorized."
        case .saveFailed: "Failed to save contact."
        }
    }
}
```

## Creating and Updating Contacts

```swift
extension ContactManager {

    /// Create a new contact
    func createContact(
        givenName: String,
        familyName: String,
        phoneNumbers: [(label: String, number: String)] = [],
        emailAddresses: [(label: String, email: String)] = [],
        organization: String? = nil,
        jobTitle: String? = nil,
        birthday: DateComponents? = nil,
        imageData: Data? = nil
    ) throws -> CNContact {
        let contact = CNMutableContact()
        contact.givenName = givenName
        contact.familyName = familyName

        contact.phoneNumbers = phoneNumbers.map {
            CNLabeledValue(
                label: $0.label,
                value: CNPhoneNumber(stringValue: $0.number)
            )
        }

        contact.emailAddresses = emailAddresses.map {
            CNLabeledValue(label: $0.label, value: $0.email as NSString)
        }

        if let organization { contact.organizationName = organization }
        if let jobTitle { contact.jobTitle = jobTitle }
        if let birthday { contact.birthday = birthday }
        if let imageData { contact.imageData = imageData }

        let saveRequest = CNSaveRequest()
        saveRequest.add(contact, toContainerWithIdentifier: nil) // Default container
        try store.execute(saveRequest)

        return contact
    }

    /// Update an existing contact
    func updateContact(_ contact: CNContact, updates: (CNMutableContact) -> Void) throws {
        guard let mutable = contact.mutableCopy() as? CNMutableContact else { return }
        updates(mutable)

        let saveRequest = CNSaveRequest()
        saveRequest.update(mutable)
        try store.execute(saveRequest)
    }

    /// Delete a contact
    func deleteContact(_ contact: CNContact) throws {
        guard let mutable = contact.mutableCopy() as? CNMutableContact else { return }
        let saveRequest = CNSaveRequest()
        saveRequest.delete(mutable)
        try store.execute(saveRequest)
    }

    /// Add a phone number to an existing contact
    func addPhoneNumber(to contact: CNContact, label: String, number: String) throws {
        try updateContact(contact) { mutable in
            let newPhone = CNLabeledValue(
                label: label,
                value: CNPhoneNumber(stringValue: number)
            )
            mutable.phoneNumbers.append(newPhone)
        }
    }
}
```

## Contact Images and Thumbnails

```swift
import SwiftUI

extension ContactManager {
    /// Get a SwiftUI Image from contact thumbnail data
    static func contactImage(for contact: CNContact) -> Image? {
        if let data = contact.thumbnailImageData,
           let uiImage = UIImage(data: data) {
            return Image(uiImage: uiImage)
        }
        return nil
    }

    /// Get full-resolution contact image
    static func contactFullImage(for contact: CNContact) -> Image? {
        if let data = contact.imageData,
           let uiImage = UIImage(data: data) {
            return Image(uiImage: uiImage)
        }
        return nil
    }
}

struct ContactAvatarView: View {
    let contact: CNContact

    var body: some View {
        Group {
            if let image = ContactManager.contactImage(for: contact) {
                image
                    .resizable()
                    .scaledToFill()
            } else {
                Text(initials)
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.accentColor.gradient)
            }
        }
        .frame(width: 44, height: 44)
        .clipShape(Circle())
    }

    private var initials: String {
        let first = contact.givenName.prefix(1)
        let last = contact.familyName.prefix(1)
        return "\(first)\(last)"
    }
}
```

## CNContactPickerViewController

```swift
import SwiftUI
import ContactsUI

struct ContactPickerView: UIViewControllerRepresentable {
    @Environment(\.dismiss) private var dismiss
    var onSelect: (CNContact) -> Void

    func makeUIViewController(context: Context) -> CNContactPickerViewController {
        let picker = CNContactPickerViewController()
        picker.delegate = context.coordinator

        // Optional: filter contacts
        picker.predicateForEnablingContact = NSPredicate(
            format: "phoneNumbers.@count > 0"
        )

        // Optional: show only specific properties
        picker.displayedPropertyKeys = [
            CNContactGivenNameKey,
            CNContactFamilyNameKey,
            CNContactPhoneNumbersKey
        ]

        return picker
    }

    func updateUIViewController(_ uiViewController: CNContactPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onSelect: onSelect, dismiss: dismiss)
    }

    final class Coordinator: NSObject, CNContactPickerDelegate {
        let onSelect: (CNContact) -> Void
        let dismiss: DismissAction

        init(onSelect: @escaping (CNContact) -> Void, dismiss: DismissAction) {
            self.onSelect = onSelect
            self.dismiss = dismiss
        }

        func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) {
            onSelect(contact)
        }

        func contactPickerDidCancel(_ picker: CNContactPickerViewController) {
            dismiss()
        }
    }
}
```

## Complete Contact Picker Example

```swift
import SwiftUI
import Contacts

struct ContactListView: View {
    @State private var manager = ContactManager()
    @State private var searchText = ""
    @State private var showPicker = false
    @State private var selectedContact: CNContact?

    var filteredContacts: [CNContact] {
        guard !searchText.isEmpty else { return manager.contacts }
        return manager.contacts.filter { contact in
            let fullName = CNContactFormatter.string(from: contact, style: .fullName) ?? ""
            return fullName.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List(filteredContacts, id: \.identifier) { contact in
                HStack(spacing: 12) {
                    ContactAvatarView(contact: contact)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(CNContactFormatter.string(from: contact, style: .fullName) ?? "No Name")
                            .font(.body.weight(.medium))

                        if let phone = contact.phoneNumbers.first {
                            Text(phone.value.stringValue)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .contentShape(Rectangle())
                .onTapGesture { selectedContact = contact }
            }
            .searchable(text: $searchText, prompt: "Search contacts")
            .navigationTitle("Contacts")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Pick", systemImage: "person.crop.circle.badge.plus") {
                        showPicker = true
                    }
                }
            }
            .sheet(isPresented: $showPicker) {
                ContactPickerView { contact in
                    selectedContact = contact
                }
            }
            .sheet(item: $selectedContact) { contact in
                ContactDetailSheet(contact: contact)
            }
            .task {
                let granted = await manager.requestAccess()
                if granted {
                    try? manager.fetchAllContacts()
                }
            }
        }
    }
}

extension CNContact: @retroactive Identifiable {
    public var id: String { identifier }
}

struct ContactDetailSheet: View {
    let contact: CNContact
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            ContactAvatarView(contact: contact)
                                .scaleEffect(2)
                                .padding(22)
                            Text(CNContactFormatter.string(from: contact, style: .fullName) ?? "")
                                .font(.title2.bold())
                            if !contact.organizationName.isEmpty {
                                Text(contact.organizationName)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Spacer()
                    }
                    .listRowBackground(Color.clear)
                }

                if !contact.phoneNumbers.isEmpty {
                    Section("Phone") {
                        ForEach(contact.phoneNumbers, id: \.identifier) { phone in
                            LabeledContent(
                                CNLabeledValue<NSString>.localizedString(forLabel: phone.label ?? ""),
                                value: phone.value.stringValue
                            )
                        }
                    }
                }

                if !contact.emailAddresses.isEmpty {
                    Section("Email") {
                        ForEach(contact.emailAddresses, id: \.identifier) { email in
                            LabeledContent(
                                CNLabeledValue<NSString>.localizedString(forLabel: email.label ?? ""),
                                value: email.value as String
                            )
                        }
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
```
