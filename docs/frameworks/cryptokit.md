# CryptoKit

## Hashing (SHA-256, SHA-384, SHA-512)

```swift
import CryptoKit
import Foundation

// SHA-256
func sha256Hash(data: Data) -> String {
    let digest = SHA256.hash(data: data)
    return digest.compactMap { String(format: "%02x", $0) }.joined()
}

// SHA-384
func sha384Hash(data: Data) -> String {
    let digest = SHA384.hash(data: data)
    return digest.compactMap { String(format: "%02x", $0) }.joined()
}

// SHA-512
func sha512Hash(data: Data) -> String {
    let digest = SHA512.hash(data: data)
    return digest.compactMap { String(format: "%02x", $0) }.joined()
}

// Hash a string
let message = "Hello, CryptoKit!"
let messageData = Data(message.utf8)
let hash = sha256Hash(data: messageData)
// "a1b2c3..." (64 hex characters)

// Hash a file
func hashFile(at url: URL) throws -> SHA256Digest {
    let data = try Data(contentsOf: url)
    return SHA256.hash(data: data)
}

// Compare digests securely (constant-time comparison)
let digest1 = SHA256.hash(data: Data("abc".utf8))
let digest2 = SHA256.hash(data: Data("abc".utf8))
let isEqual = digest1 == digest2 // true — uses constant-time comparison
```

## HMAC Authentication

```swift
func createHMAC(message: Data, key: SymmetricKey) -> Data {
    let mac = HMAC<SHA256>.authenticationCode(for: message, using: key)
    return Data(mac)
}

func verifyHMAC(message: Data, mac: Data, key: SymmetricKey) -> Bool {
    HMAC<SHA256>.isValidAuthenticationCode(mac, authenticating: message, using: key)
}

// Usage
let key = SymmetricKey(size: .bits256)
let message = Data("Authenticate this message".utf8)
let mac = createHMAC(message: message, key: key)
let isValid = verifyHMAC(message: message, mac: mac, key: key) // true

// HMAC for API request signing
func signRequest(_ request: inout URLRequest, body: Data, secretKey: SymmetricKey) {
    let timestamp = String(Int(Date().timeIntervalSince1970))
    let payload = timestamp.data(using: .utf8)! + body
    let signature = HMAC<SHA256>.authenticationCode(for: payload, using: secretKey)
    request.setValue(Data(signature).base64EncodedString(), forHTTPHeaderField: "X-Signature")
    request.setValue(timestamp, forHTTPHeaderField: "X-Timestamp")
}
```

## AES-GCM Symmetric Encryption / Decryption

```swift
struct AESEncryptor {
    /// Encrypt data with AES-GCM
    static func encrypt(data: Data, key: SymmetricKey) throws -> Data {
        let sealedBox = try AES.GCM.seal(data, using: key)
        // combined = nonce + ciphertext + tag
        guard let combined = sealedBox.combined else {
            throw CryptoError.encryptionFailed
        }
        return combined
    }

    /// Decrypt AES-GCM sealed data
    static func decrypt(data: Data, key: SymmetricKey) throws -> Data {
        let sealedBox = try AES.GCM.SealedBox(combined: data)
        return try AES.GCM.open(sealedBox, using: key)
    }

    /// Encrypt a string
    static func encryptString(_ string: String, key: SymmetricKey) throws -> Data {
        try encrypt(data: Data(string.utf8), key: key)
    }

    /// Decrypt to string
    static func decryptString(data: Data, key: SymmetricKey) throws -> String {
        let decrypted = try decrypt(data: data, key: key)
        guard let string = String(data: decrypted, encoding: .utf8) else {
            throw CryptoError.decodingFailed
        }
        return string
    }

    /// Generate a key from a password using HKDF
    static func deriveKey(from password: String, salt: Data) -> SymmetricKey {
        let inputKey = SymmetricKey(data: Data(password.utf8))
        let derived = HKDF<SHA256>.deriveKey(
            inputKeyMaterial: inputKey,
            salt: salt,
            info: Data("AES-GCM-Encryption".utf8),
            outputByteCount: 32
        )
        return derived
    }
}

enum CryptoError: LocalizedError {
    case encryptionFailed, decodingFailed

    var errorDescription: String? {
        switch self {
        case .encryptionFailed: "Encryption failed."
        case .decodingFailed: "Failed to decode decrypted data."
        }
    }
}
```

## P256 / P384 / P521 Key Agreement and Signing

```swift
// Digital signatures with P256
struct ECDSASigner {
    let privateKey: P256.Signing.PrivateKey

    init() {
        privateKey = P256.Signing.PrivateKey()
    }

    var publicKey: P256.Signing.PublicKey {
        privateKey.publicKey
    }

    func sign(data: Data) throws -> P256.Signing.ECDSASignature {
        try privateKey.signature(for: data)
    }

    static func verify(
        signature: P256.Signing.ECDSASignature,
        data: Data,
        publicKey: P256.Signing.PublicKey
    ) -> Bool {
        publicKey.isValidSignature(signature, for: data)
    }
}

// Key agreement (Diffie-Hellman) with P256
struct KeyAgreement {
    static func sharedSecret(
        privateKey: P256.KeyAgreement.PrivateKey,
        publicKey: P256.KeyAgreement.PublicKey
    ) throws -> SymmetricKey {
        let sharedSecret = try privateKey.sharedSecretFromKeyAgreement(with: publicKey)
        // Derive a symmetric key using HKDF
        return sharedSecret.hkdfDerivedSymmetricKey(
            using: SHA256.self,
            salt: Data(),
            sharedInfo: Data("P256-Key-Agreement".utf8),
            outputByteCount: 32
        )
    }
}

// Usage: Two parties derive the same shared key
let alicePrivate = P256.KeyAgreement.PrivateKey()
let bobPrivate = P256.KeyAgreement.PrivateKey()

let aliceSharedKey = try KeyAgreement.sharedSecret(
    privateKey: alicePrivate, publicKey: bobPrivate.publicKey
)
let bobSharedKey = try KeyAgreement.sharedSecret(
    privateKey: bobPrivate, publicKey: alicePrivate.publicKey
)
// aliceSharedKey == bobSharedKey
```

## Curve25519 Key Exchange

```swift
struct Curve25519Exchange {
    static func deriveSharedKey(
        privateKey: Curve25519.KeyAgreement.PrivateKey,
        peerPublicKey: Curve25519.KeyAgreement.PublicKey
    ) throws -> SymmetricKey {
        let shared = try privateKey.sharedSecretFromKeyAgreement(with: peerPublicKey)
        return shared.hkdfDerivedSymmetricKey(
            using: SHA256.self,
            salt: Data(),
            sharedInfo: Data("Curve25519-Exchange".utf8),
            outputByteCount: 32
        )
    }
}

// Curve25519 signing
let signingKey = Curve25519.Signing.PrivateKey()
let message = Data("Sign this message".utf8)
let signature = try signingKey.signature(for: message)
let isValid = signingKey.publicKey.isValidSignature(signature, for: message)

// Export / import keys
let publicKeyData = signingKey.publicKey.rawRepresentation // 32 bytes
let restoredPublicKey = try Curve25519.Signing.PublicKey(rawRepresentation: publicKeyData)
```

## Secure Enclave Integration

```swift
struct SecureEnclaveManager {
    /// Create a private key stored in the Secure Enclave
    static func createKey() throws -> SecureEnclave.P256.Signing.PrivateKey {
        guard SecureEnclave.isAvailable else {
            throw SecureEnclaveError.notAvailable
        }

        // Key with access control
        let accessControl = SecAccessControlCreateWithFlags(
            nil,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            [.privateKeyUsage, .biometryCurrentSet],
            nil
        )!

        return try SecureEnclave.P256.Signing.PrivateKey(
            accessControl: accessControl
        )
    }

    /// Sign data with Secure Enclave key (requires biometric auth)
    static func sign(data: Data, key: SecureEnclave.P256.Signing.PrivateKey) throws -> Data {
        let signature = try key.signature(for: data)
        return signature.derRepresentation
    }

    /// Persist and restore Secure Enclave keys
    static func persistKey(_ key: SecureEnclave.P256.Signing.PrivateKey) throws -> Data {
        key.dataRepresentation
    }

    static func restoreKey(from data: Data) throws -> SecureEnclave.P256.Signing.PrivateKey {
        try SecureEnclave.P256.Signing.PrivateKey(dataRepresentation: data)
    }
}

enum SecureEnclaveError: LocalizedError {
    case notAvailable
    var errorDescription: String? { "Secure Enclave is not available on this device." }
}
```

## ChaChaPoly for Performance

ChaChaPoly (ChaCha20-Poly1305) is faster than AES-GCM on devices without AES hardware acceleration.

```swift
struct ChaChaEncryptor {
    static func encrypt(data: Data, key: SymmetricKey) throws -> Data {
        let sealedBox = try ChaChaPoly.seal(data, using: key)
        return sealedBox.combined
    }

    static func decrypt(data: Data, key: SymmetricKey) throws -> Data {
        let sealedBox = try ChaChaPoly.SealedBox(combined: data)
        return try ChaChaPoly.open(sealedBox, using: key)
    }
}
```

## Complete Secure Messaging Example

```swift
import CryptoKit
import Foundation

/// End-to-end encrypted messaging using Curve25519 key exchange + AES-GCM
final class SecureMessenger {
    let identityKey: Curve25519.KeyAgreement.PrivateKey
    var peerPublicKey: Curve25519.KeyAgreement.PublicKey?

    var publicKeyData: Data {
        identityKey.publicKey.rawRepresentation
    }

    init() {
        identityKey = Curve25519.KeyAgreement.PrivateKey()
    }

    /// Set the peer's public key (received over network)
    func setPeerPublicKey(_ data: Data) throws {
        peerPublicKey = try Curve25519.KeyAgreement.PublicKey(rawRepresentation: data)
    }

    /// Derive the shared encryption key
    private func sharedKey() throws -> SymmetricKey {
        guard let peerPublicKey else { throw MessengerError.noPeerKey }
        let shared = try identityKey.sharedSecretFromKeyAgreement(with: peerPublicKey)
        return shared.hkdfDerivedSymmetricKey(
            using: SHA256.self,
            salt: Data("SecureMessenger-v1".utf8),
            sharedInfo: Data(),
            outputByteCount: 32
        )
    }

    /// Encrypt a message
    func encrypt(_ plaintext: String) throws -> Data {
        let key = try sharedKey()
        let data = Data(plaintext.utf8)
        let sealed = try AES.GCM.seal(data, using: key)
        guard let combined = sealed.combined else {
            throw MessengerError.encryptionFailed
        }
        return combined
    }

    /// Decrypt a message
    func decrypt(_ ciphertext: Data) throws -> String {
        let key = try sharedKey()
        let box = try AES.GCM.SealedBox(combined: ciphertext)
        let decrypted = try AES.GCM.open(box, using: key)
        guard let message = String(data: decrypted, encoding: .utf8) else {
            throw MessengerError.decodingFailed
        }
        return message
    }

    /// Sign a message for authenticity
    func sign(_ data: Data) throws -> Data {
        let signingKey = Curve25519.Signing.PrivateKey()
        let signature = try signingKey.signature(for: data)
        return signature
    }
}

enum MessengerError: LocalizedError {
    case noPeerKey, encryptionFailed, decodingFailed

    var errorDescription: String? {
        switch self {
        case .noPeerKey: "Peer public key not set."
        case .encryptionFailed: "Message encryption failed."
        case .decodingFailed: "Failed to decode decrypted message."
        }
    }
}

// Usage
let alice = SecureMessenger()
let bob = SecureMessenger()

try alice.setPeerPublicKey(bob.publicKeyData)
try bob.setPeerPublicKey(alice.publicKeyData)

let encrypted = try alice.encrypt("Hello, Bob!")
let decrypted = try bob.decrypt(encrypted) // "Hello, Bob!"
```
