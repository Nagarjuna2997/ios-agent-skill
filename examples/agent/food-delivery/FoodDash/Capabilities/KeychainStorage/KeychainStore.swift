import Foundation
import Security

/// Storage for small secrets, injected so previews and tests avoid the real Keychain.
protocol SecureStore {
    func set(_ data: Data, for account: String) throws
    func data(for account: String) throws -> Data?
    func remove(_ account: String) throws
}

extension SecureStore {
    func setString(_ value: String, for account: String) throws {
        try set(Data(value.utf8), for: account)
    }

    func string(for account: String) throws -> String? {
        try data(for: account).map { String(decoding: $0, as: UTF8.self) }
    }
}

enum KeychainError: Error, Equatable {
    case unexpectedStatus(OSStatus)
    case invalidData
}

/// Generic-password items for this app, available after first unlock, this device only.
struct KeychainStore: SecureStore, Sendable {
    let service: String

    init(service: String = "com.example.fooddash") {
        self.service = service
    }

    func set(_ data: Data, for account: String) throws {
        let query = baseQuery(account)
        let status = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        if status == errSecItemNotFound {
            var item = query
            item[kSecValueData as String] = data
            item[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            let added = SecItemAdd(item as CFDictionary, nil)
            guard added == errSecSuccess else { throw KeychainError.unexpectedStatus(added) }
        } else if status != errSecSuccess {
            throw KeychainError.unexpectedStatus(status)
        }
    }

    func data(for account: String) throws -> Data? {
        var query = baseQuery(account)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess else { throw KeychainError.unexpectedStatus(status) }
        guard let data = result as? Data else { throw KeychainError.invalidData }
        return data
    }

    func remove(_ account: String) throws {
        let status = SecItemDelete(baseQuery(account) as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw KeychainError.unexpectedStatus(status) }
    }

    private func baseQuery(_ account: String) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
    }
}

/// For previews and tests only.
final class InMemorySecureStore: SecureStore {
    private var items: [String: Data] = [:]

    func set(_ data: Data, for account: String) throws { items[account] = data }
    func data(for account: String) throws -> Data? { items[account] }
    func remove(_ account: String) throws { items[account] = nil }
}
