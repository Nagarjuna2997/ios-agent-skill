#if canImport(CloudKit)
import CloudKit

public actor CloudAccountReader {
    private let container: CKContainer
    public init(containerIdentifier: String) { container = CKContainer(identifier: containerIdentifier) }
    public func status() async throws -> CKAccountStatus {
        try Task.checkCancellation()
        return try await container.accountStatus()
    }
}
#endif

#if canImport(Security)
import Foundation
import Security

/// Example for foreground-only device-local credentials. Not a replacement for SDK session storage.
public actor KeychainTokenStore {
    private let service: String
    public init(service: String) { self.service = service }
    public struct Failure: Error { public let status: OSStatus }
    private func query(_ account: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: service, kSecAttrAccount as String: account]
    }
    public func save(_ data: Data, account: String) throws {
        let base = query(account)
        let attributes: [String: Any] = [kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        let updated = SecItemUpdate(base as CFDictionary, attributes as CFDictionary)
        if updated == errSecItemNotFound {
            let inserted = SecItemAdd(base.merging(attributes) { _, new in new } as CFDictionary, nil)
            guard inserted == errSecSuccess else { throw Failure(status: inserted) }
        } else if updated != errSecSuccess { throw Failure(status: updated) }
    }
    public func read(account: String) throws -> Data? {
        var request = query(account)
        request[kSecReturnData as String] = true
        request[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(request as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess else { throw Failure(status: status) }
        guard let data = result as? Data else { throw Failure(status: errSecDecode) }
        return data
    }
    public func remove(account: String) throws {
        let status = SecItemDelete(query(account) as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw Failure(status: status) }
    }
}
#endif
