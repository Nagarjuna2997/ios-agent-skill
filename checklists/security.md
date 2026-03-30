# Security Checklist

## Keychain for Sensitive Data

### Never Use UserDefaults for Secrets

```swift
// BAD — stored in plain text plist
UserDefaults.standard.set("token123", forKey: "authToken")

// GOOD — stored in encrypted Keychain
import Security

enum KeychainService {
    static func save(key: String, data: Data, accessibility: CFString = kSecAttrAccessibleWhenUnlockedThisDeviceOnly) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: accessibility
        ]

        SecItemDelete(query as CFDictionary) // Remove existing
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    static func load(key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound { return nil }
            throw KeychainError.loadFailed(status)
        }
        return result as? Data
    }

    static func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

enum KeychainError: Error {
    case saveFailed(OSStatus)
    case loadFailed(OSStatus)
}
```

### Keychain Accessibility Levels

| Level | Use When |
|-------|----------|
| `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` | Default for most tokens |
| `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` | Background tasks needing credentials |
| `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` | Highest security, requires passcode |

- [ ] Auth tokens stored in Keychain (not UserDefaults or files)
- [ ] API keys not hardcoded in source code
- [ ] Keychain items use `ThisDeviceOnly` to prevent iCloud sync of secrets
- [ ] Sensitive data cleared from Keychain on account deletion

---

## App Transport Security (ATS)

- [ ] All endpoints use HTTPS with TLS 1.2 or later
- [ ] No `NSAllowsArbitraryLoads = YES` in production
- [ ] Any ATS exceptions are narrowly scoped to specific domains
- [ ] Forward secrecy enabled on server (ECDHE ciphers)

```swift
// Verify server TLS configuration programmatically
let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)

func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge) async
    -> (URLSession.AuthChallengeDisposition, URLCredential?) {

    guard let trust = challenge.protectionSpace.serverTrust else {
        return (.cancelAuthenticationChallenge, nil)
    }

    // Evaluate trust
    let policy = SecPolicyCreateSSL(true, challenge.protectionSpace.host as CFString)
    SecTrustSetPolicies(trust, policy)

    var error: CFError?
    let isValid = SecTrustEvaluateWithError(trust, &error)

    if isValid {
        return (.useCredential, URLCredential(trust: trust))
    } else {
        return (.cancelAuthenticationChallenge, nil)
    }
}
```

---

## Certificate Pinning

```swift
class PinnedSessionDelegate: NSObject, URLSessionDelegate {
    // SHA256 hash of the server's public key
    private let pinnedHashes: Set<String> = [
        "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=", // Primary
        "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=", // Backup
    ]

    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge) async
        -> (URLSession.AuthChallengeDisposition, URLCredential?) {

        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            return (.cancelAuthenticationChallenge, nil)
        }

        // Extract public key and compute hash
        guard let certificate = SecTrustCopyCertificateChain(serverTrust)?.first,
              let publicKey = SecCertificateCopyKey(certificate),
              let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, nil) as? Data else {
            return (.cancelAuthenticationChallenge, nil)
        }

        let hash = SHA256.hash(data: publicKeyData)
        let hashString = Data(hash).base64EncodedString()

        if pinnedHashes.contains(hashString) {
            return (.useCredential, URLCredential(trust: serverTrust))
        }
        return (.cancelAuthenticationChallenge, nil)
    }
}
```

- [ ] Pin at least 2 certificates (primary + backup)
- [ ] Have a rotation plan before certificates expire
- [ ] Consider using a CDN/proxy that handles certificate management

---

## Data Protection (File Encryption)

```swift
// Set file protection level when writing
let data = sensitiveData
let fileURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    .appendingPathComponent("sensitive.dat")

try data.write(to: fileURL, options: .completeFileProtection)

// Or set via file attributes
try FileManager.default.setAttributes(
    [.protectionKey: FileProtectionType.complete],
    ofItemAtPath: fileURL.path
)
```

### Protection Levels

| Level | Available | Use For |
|-------|-----------|---------|
| `.complete` | Only when unlocked | Most sensitive data |
| `.completeUnlessOpen` | Open files stay accessible | Active downloads |
| `.completeUntilFirstUserAuthentication` | After first unlock | Background fetch data |

- [ ] Sensitive files use `.complete` protection
- [ ] No sensitive data written to temporary directories without protection
- [ ] Cache directories cleared of sensitive data periodically

---

## Biometric Authentication (Face ID / Touch ID)

```swift
import LocalAuthentication

class BiometricAuth {
    func authenticate(reason: String) async throws -> Bool {
        let context = LAContext()
        context.localizedCancelTitle = "Use Password"
        context.localizedFallbackTitle = "Enter Password"

        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            if let error {
                switch error.code {
                case LAError.biometryNotAvailable.rawValue:
                    throw AuthError.biometryNotAvailable
                case LAError.biometryNotEnrolled.rawValue:
                    throw AuthError.biometryNotEnrolled
                case LAError.biometryLockout.rawValue:
                    throw AuthError.biometryLockedOut
                default:
                    throw AuthError.unknown(error)
                }
            }
            return false
        }

        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )
    }

    var biometryType: LABiometryType {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType
    }
}

// Usage
let auth = BiometricAuth()
let label = auth.biometryType == .faceID ? "Face ID" : "Touch ID"

Button("Unlock with \(label)") {
    Task {
        if try await auth.authenticate(reason: "Access your account") {
            isUnlocked = true
        }
    }
}
```

- [ ] `NSFaceIDUsageDescription` set in Info.plist
- [ ] Fallback to passcode when biometrics fail
- [ ] Do not store biometric data yourself (system handles it)

---

## Input Validation

```swift
// Server-side validation is authoritative; client-side is UX
struct InputValidator {
    static func sanitizeHTML(_ input: String) -> String {
        input.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression)
    }

    static func validateEmail(_ email: String) -> Bool {
        let regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        return email.wholeMatch(of: regex) != nil
    }

    static func validatePassword(_ password: String) -> [String] {
        var issues: [String] = []
        if password.count < 8 { issues.append("At least 8 characters") }
        if !password.contains(where: \.isUppercase) { issues.append("One uppercase letter") }
        if !password.contains(where: \.isNumber) { issues.append("One number") }
        return issues
    }
}
```

- [ ] All user input sanitized before display (prevent XSS in web views)
- [ ] SQL/predicate injection prevented (use parameterized queries)
- [ ] File paths validated (no path traversal: `../`)
- [ ] URL schemes validated before opening
- [ ] Deep link parameters sanitized

---

## Code Obfuscation

### Strategies
- [ ] Strip debug symbols in release builds (`STRIP_INSTALLED_PRODUCT = YES`)
- [ ] Enable Bitcode (if still supported by your deployment target)
- [ ] Obfuscate string literals containing API endpoints or keys
- [ ] Use Swift (harder to reverse-engineer than Objective-C)

```swift
// Obfuscate sensitive strings
enum ObfuscatedStrings {
    // Instead of hardcoding "api.example.com"
    static var apiHost: String {
        let bytes: [UInt8] = [97, 112, 105, 46, 101, 120, 97, 109, 112, 108, 101, 46, 99, 111, 109]
        return String(bytes: bytes, encoding: .utf8) ?? ""
    }
}

// Better: fetch configuration from server at runtime
// Best: use CloudKit or a config service
```

---

## Jailbreak Detection

```swift
struct SecurityCheck {
    static var isCompromised: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        // Check for common jailbreak indicators
        let suspiciousPaths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash",
            "/usr/sbin/sshd",
            "/etc/apt",
            "/private/var/lib/apt/"
        ]

        for path in suspiciousPaths {
            if FileManager.default.fileExists(atPath: path) {
                return true
            }
        }

        // Check if app can write outside sandbox
        let testPath = "/private/jailbreak_test_\(UUID().uuidString)"
        do {
            try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
            try FileManager.default.removeItem(atPath: testPath)
            return true // Should not be able to write here
        } catch {
            // Expected behavior on non-jailbroken device
        }

        // Check for dynamic library injection
        if let _ = getenv("DYLD_INSERT_LIBRARIES") {
            return true
        }

        return false
        #endif
    }
}

// Usage at app launch
if SecurityCheck.isCompromised {
    // Show warning or limit functionality
    // Do NOT crash — App Store reviewers may flag this
}
```

---

## Security Audit Summary

| Area | Tool | Frequency |
|------|------|-----------|
| Dependencies | `swift package audit` / Dependabot | Every build |
| Static analysis | Xcode analyzer, SwiftLint security rules | Every PR |
| Secrets scanning | git-secrets, GitHub secret scanning | Every commit |
| Penetration testing | OWASP Mobile Testing Guide | Before major release |
| SSL configuration | SSL Labs test | Monthly |
| Privacy compliance | App Privacy Report (iOS Settings) | Before submission |
