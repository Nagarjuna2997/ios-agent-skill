# Device Integrity (DeviceCheck & App Attest)

## DeviceCheck — Per-Device Bits

DeviceCheck lets you store **two bits** per device on Apple's servers, persisting across app reinstalls.

```swift
import DeviceCheck

final class DeviceCheckManager {
    private let device = DCDevice.current

    /// Check if DeviceCheck is supported
    var isSupported: Bool {
        device.isSupported
    }

    /// Generate a device token to send to your server
    func generateToken() async throws -> Data {
        guard isSupported else {
            throw IntegrityError.deviceCheckNotSupported
        }
        return try await device.generateToken()
    }

    /// Server-side: Query Apple for the two bits
    /// POST https://api.development.devicecheck.apple.com/v1/query_two_bits
    ///
    /// Request body:
    /// {
    ///     "device_token": "<base64 token>",
    ///     "transaction_id": "<uuid>",
    ///     "timestamp": <milliseconds since epoch>
    /// }
    ///
    /// Response:
    /// { "bit0": true, "bit1": false, "last_update_time": "2025-01" }

    /// Server-side: Update the two bits
    /// POST https://api.development.devicecheck.apple.com/v1/update_two_bits
    ///
    /// Request body:
    /// {
    ///     "device_token": "<base64 token>",
    ///     "transaction_id": "<uuid>",
    ///     "timestamp": <milliseconds since epoch>,
    ///     "bit0": true,
    ///     "bit1": false
    /// }

    /// Example: Mark device as having redeemed a promo
    func markPromoRedeemed() async throws {
        let token = try await generateToken()
        let payload: [String: Any] = [
            "device_token": token.base64EncodedString(),
            "transaction_id": UUID().uuidString,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000),
            "bit0": true,    // bit0 = promo redeemed
            "bit1": false
        ]

        var request = URLRequest(url: URL(string: "https://api.yourserver.com/devicecheck/update")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw IntegrityError.serverError
        }
    }
}
```

## DCAppAttestService — Full Attestation Flow

App Attest cryptographically proves that API requests come from a genuine, unmodified copy of your app.

### Step 1: Generate a Key

```swift
import DeviceCheck

final class AppAttestManager {
    private let attest = DCAppAttestService.shared

    /// Check if App Attest is supported
    var isSupported: Bool {
        attest.isSupported
    }

    /// Step 1: Generate an attestation key pair (stored in Secure Enclave)
    func generateKey() async throws -> String {
        guard isSupported else {
            throw IntegrityError.appAttestNotSupported
        }
        let keyId = try await attest.generateKey()
        // Store keyId in Keychain for later use
        try KeychainHelper.save(keyId, forKey: "appAttestKeyId")
        return keyId
    }
}
```

### Step 2: Attest the Key with Apple

```swift
extension AppAttestManager {

    /// Step 2: Attest the key — do this ONCE per key
    /// Send the attestation object to your server for verification
    func attestKey(_ keyId: String) async throws -> Data {
        // 1. Get a one-time challenge from your server
        let challenge = try await fetchChallenge()

        // 2. Create a hash of the challenge
        let challengeHash = Data(SHA256.hash(data: challenge))

        // 3. Request attestation from Apple
        let attestation = try await attest.attestKey(keyId, clientDataHash: challengeHash)

        // 4. Send attestation + challenge to your server for verification
        try await verifyAttestationOnServer(
            keyId: keyId,
            attestation: attestation,
            challenge: challenge
        )

        return attestation
    }

    private func fetchChallenge() async throws -> Data {
        let url = URL(string: "https://api.yourserver.com/attest/challenge")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }

    private func verifyAttestationOnServer(
        keyId: String,
        attestation: Data,
        challenge: Data
    ) async throws {
        var request = URLRequest(url: URL(string: "https://api.yourserver.com/attest/verify")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: String] = [
            "keyId": keyId,
            "attestation": attestation.base64EncodedString(),
            "challenge": challenge.base64EncodedString()
        ]
        request.httpBody = try JSONEncoder().encode(body)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw IntegrityError.attestationFailed
        }
    }
}
```

### Step 3: Generate Assertions for API Calls

```swift
import CryptoKit

extension AppAttestManager {

    /// Step 3: Generate an assertion for each sensitive API request
    func generateAssertion(for requestData: Data) async throws -> Data {
        guard let keyId = try KeychainHelper.load(forKey: "appAttestKeyId") else {
            throw IntegrityError.noKeyFound
        }

        // Hash the request data (the payload you want to protect)
        let clientDataHash = Data(SHA256.hash(data: requestData))

        // Generate assertion
        let assertion = try await attest.generateAssertion(keyId, clientDataHash: clientDataHash)
        return assertion
    }

    /// Make an attested API request
    func makeAttestedRequest(
        url: URL,
        method: String = "POST",
        body: Data
    ) async throws -> (Data, HTTPURLResponse) {
        let assertion = try await generateAssertion(for: body)

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(assertion.base64EncodedString(), forHTTPHeaderField: "X-App-Assertion")
        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw IntegrityError.serverError
        }
        return (data, http)
    }
}
```

## Server-Side Verification (Reference)

Your server must verify attestations and assertions with Apple.

```swift
/// Server-side pseudocode (Node.js / Python / Swift on server):
///
/// Attestation verification:
/// 1. Decode the CBOR attestation object
/// 2. Verify the x5c certificate chain leads to Apple's App Attest root CA
/// 3. Extract the public key from the leaf certificate
/// 4. Verify nonce = SHA256(SHA256(challenge) + attestation.authData)
/// 5. Verify the App ID (team ID + bundle ID) in the credential certificate
/// 6. Store the public key and counter for the keyId
///
/// Assertion verification:
/// 1. Decode the CBOR assertion
/// 2. Compute authenticatorData + SHA256(clientData)
/// 3. Verify the signature using the stored public key for this keyId
/// 4. Verify the counter is greater than the stored counter (replay protection)
/// 5. Update the stored counter
///
/// Apple App Attest root certificate:
/// https://www.apple.com/certificateauthority/Apple_App_Attestation_Root_CA.pem
```

## Fraud Prevention Patterns

```swift
/// Comprehensive integrity guard combining DeviceCheck + App Attest
final class IntegrityGuard {
    private let appAttest = AppAttestManager()
    private let deviceCheck = DeviceCheckManager()
    private var isAttested = false

    /// Call during app launch or first sensitive action
    func initialize() async {
        // 1. Generate and attest key (one-time setup)
        guard appAttest.isSupported else {
            // Fallback: use DeviceCheck token for basic verification
            return
        }

        do {
            let existingKeyId = try? KeychainHelper.load(forKey: "appAttestKeyId")

            if existingKeyId == nil {
                let keyId = try await appAttest.generateKey()
                try await appAttest.attestKey(keyId)
            }

            isAttested = true
        } catch {
            // Handle attestation failure — device may be compromised
            // Log and potentially restrict features
        }
    }

    /// Protect a sensitive API call
    func protectedRequest(
        url: URL,
        body: Encodable
    ) async throws -> Data {
        let bodyData = try JSONEncoder().encode(body)

        if isAttested {
            let (data, response) = try await appAttest.makeAttestedRequest(
                url: url,
                body: bodyData
            )
            guard response.statusCode == 200 else {
                throw IntegrityError.serverError
            }
            return data
        } else {
            // Fallback: use DeviceCheck token
            let token = try await deviceCheck.generateToken()

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue(token.base64EncodedString(), forHTTPHeaderField: "X-Device-Token")
            request.httpBody = bodyData

            let (data, _) = try await URLSession.shared.data(for: request)
            return data
        }
    }
}

/// Keychain helper for storing the attest key ID
enum KeychainHelper {
    static func save(_ value: String, forKey key: String) throws {
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw IntegrityError.keychainError
        }
    }

    static func load(forKey key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }
}

enum IntegrityError: LocalizedError {
    case deviceCheckNotSupported
    case appAttestNotSupported
    case attestationFailed
    case noKeyFound
    case serverError
    case keychainError

    var errorDescription: String? {
        switch self {
        case .deviceCheckNotSupported: "DeviceCheck is not supported on this device."
        case .appAttestNotSupported: "App Attest is not supported on this device."
        case .attestationFailed: "Key attestation failed."
        case .noKeyFound: "No attestation key found. Re-enrollment required."
        case .serverError: "Server verification failed."
        case .keychainError: "Keychain operation failed."
        }
    }
}
```
