# Security Checklist

A comprehensive security checklist for iOS applications. Each item includes context on why it matters and how to implement it correctly.

---

## Keychain for Sensitive Data

- [ ] Store authentication tokens in Keychain, never in `UserDefaults` or files
- [ ] Store API keys and secrets in Keychain (or better, fetch from server at runtime)
- [ ] Set appropriate Keychain accessibility level for each item
- [ ] Use `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` for tokens needed in background
- [ ] Use `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` for highly sensitive data
- [ ] Never use `kSecAttrAccessibleAlways` (deprecated and insecure)
- [ ] Set `kSecAttrAccessControl` with biometric requirement for high-value secrets
- [ ] Delete Keychain items on user logout

```swift
import Security

enum KeychainHelper {

    static func save(
        key: String,
        data: Data,
        accessibility: CFString = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    ) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: accessibility
        ]

        // Delete any existing item first
        SecItemDelete(query as CFDictionary)

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status: status)
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

        switch status {
        case errSecSuccess:
            return result as? Data
        case errSecItemNotFound:
            return nil
        default:
            throw KeychainError.loadFailed(status: status)
        }
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
    case saveFailed(status: OSStatus)
    case loadFailed(status: OSStatus)
}
```

---

## App Transport Security (ATS)

- [ ] ATS is enabled (default, do not disable globally)
- [ ] No `NSAllowsArbitraryLoads = YES` in production Info.plist
- [ ] All API endpoints use HTTPS with TLS 1.2 or higher
- [ ] If exceptions are needed, scope them to specific domains only
- [ ] Use `NSExceptionAllowsInsecureHTTPLoads` per-domain only when absolutely necessary
- [ ] Document and justify every ATS exception for App Review
- [ ] Test with `nscurl --ats-diagnostics https://yourdomain.com` to verify compliance
- [ ] Third-party SDKs vetted for ATS compliance

```xml
<!-- Scoped exception (prefer this over blanket disable) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>legacy-api.example.com</key>
        <dict>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <true/>
        </dict>
    </dict>
</dict>
```

---

## Certificate Pinning

- [ ] Implement certificate or public key pinning for critical API endpoints
- [ ] Pin the public key (SPKI hash), not the certificate (certificates rotate)
- [ ] Include backup pins for certificate rotation
- [ ] Implement pinning via `URLSessionDelegate`
- [ ] Plan for pin rotation before certificates expire
- [ ] Test pin validation failure handling (fail closed, not open)
- [ ] Consider using `NSPinnedDomains` in Info.plist (iOS 14+) for simpler pinning

```swift
// MARK: - Public Key Pinning via URLSessionDelegate

class PinnedSessionDelegate: NSObject, URLSessionDelegate {

    /// SHA-256 hashes of the Subject Public Key Info (SPKI)
    private let pinnedHashes: Set<String> = [
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // Primary
        "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=", // Backup
    ]

    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge
    ) async -> (URLSession.AuthChallengeDisposition, URLCredential?) {

        guard challenge.protectionSpace.authenticationMethod
                == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            return (.cancelAuthenticationChallenge, nil)
        }

        // Evaluate the server trust
        var error: CFError?
        guard SecTrustEvaluateWithError(serverTrust, &error) else {
            return (.cancelAuthenticationChallenge, nil)
        }

        // Check each certificate in the chain
        guard let certChain = SecTrustCopyCertificateChain(serverTrust) as? [SecCertificate] else {
            return (.cancelAuthenticationChallenge, nil)
        }

        for cert in certChain {
            guard let publicKey = SecCertificateCopyKey(cert),
                  let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, nil) as Data?
            else { continue }

            let hash = SHA256.hash(data: publicKeyData)
            let hashBase64 = Data(hash).base64EncodedString()

            if pinnedHashes.contains(hashBase64) {
                return (.useCredential, URLCredential(trust: serverTrust))
            }
        }

        // No pin matched -- reject the connection
        return (.cancelAuthenticationChallenge, nil)
    }
}
```

```xml
<!-- Info.plist-based pinning (simpler, iOS 14+) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSPinnedDomains</key>
    <dict>
        <key>api.example.com</key>
        <dict>
            <key>NSPinnedCAIdentities</key>
            <array>
                <dict>
                    <key>SPKI-SHA256-BASE64</key>
                    <string>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</string>
                </dict>
            </array>
        </dict>
    </dict>
</dict>
```

---

## Data Protection API (File Encryption at Rest)

- [ ] Set file protection attributes on sensitive files
- [ ] Use `.completeProtection` for files only needed when device is unlocked
- [ ] Use `.completeUnlessOpen` for files that need to finish writing in background
- [ ] Verify protection level with `FileManager.attributesOfItem`
- [ ] Sensitive databases (SwiftData/Core Data) stored with appropriate protection level
- [ ] Temporary files cleaned up after use

```swift
// Set file protection when writing
let sensitiveData = "secret content".data(using: .utf8)!
let fileURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    .appendingPathComponent("sensitive.dat")

try sensitiveData.write(to: fileURL, options: .completeFileProtection)

// Verify protection level
let attributes = try FileManager.default.attributesOfItem(atPath: fileURL.path)
let protection = attributes[.protectionKey] as? FileProtectionType
assert(protection == .complete)
```

---

## Biometric Authentication

- [ ] Use `LAContext` for Face ID / Touch ID authentication
- [ ] Always provide a fallback (device passcode)
- [ ] Add `NSFaceIDUsageDescription` to Info.plist with clear explanation
- [ ] Check `canEvaluatePolicy` before showing biometric UI
- [ ] Handle all `LAError` cases (user cancelled, biometry unavailable, lockout, etc.)
- [ ] Do not store biometric data yourself -- the system handles this securely
- [ ] Re-authenticate for high-value actions (payments, password changes)

```swift
import LocalAuthentication

actor BiometricAuthenticator {

    enum BiometricType {
        case faceID, touchID, none
    }

    var availableBiometric: BiometricType {
        let context = LAContext()
        guard context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics, error: nil
        ) else {
            return .none
        }
        switch context.biometryType {
        case .faceID: return .faceID
        case .touchID: return .touchID
        default: return .none
        }
    }

    func authenticate(reason: String) async throws -> Bool {
        let context = LAContext()
        context.localizedFallbackTitle = "Use Passcode"
        context.localizedCancelTitle = "Cancel"

        // Check if biometrics are available, fall back to passcode
        let policy: LAPolicy = .deviceOwnerAuthentication

        var error: NSError?
        guard context.canEvaluatePolicy(policy, error: &error) else {
            throw AuthError.biometricFailed(
                reason: error?.localizedDescription ?? "Unavailable"
            )
        }

        do {
            let success = try await context.evaluatePolicy(
                policy, localizedReason: reason
            )
            return success
        } catch let laError as LAError {
            switch laError.code {
            case .userCancel, .appCancel, .systemCancel:
                return false // User chose not to authenticate
            case .biometryLockout:
                throw AuthError.biometricFailed(
                    reason: "Biometrics locked. Use your passcode."
                )
            case .biometryNotAvailable:
                throw AuthError.biometricFailed(
                    reason: "Biometrics not available on this device."
                )
            default:
                throw AuthError.biometricFailed(reason: laError.localizedDescription)
            }
        }
    }
}
```

---

## Input Validation and Sanitization

- [ ] Validate all user input on the client before sending to server
- [ ] Server must also validate independently (defense in depth)
- [ ] Sanitize strings used in database queries (use parameterized queries)
- [ ] Validate URL schemes before opening (`canOpenURL` + allowlist)
- [ ] Validate deep link parameters before using them
- [ ] Limit text input lengths with `TextField` character limits
- [ ] Strip or escape HTML/script content if displaying in `WKWebView`
- [ ] Validate file types and sizes before processing uploads

```swift
// URL scheme allowlist
func safeOpen(url: URL) {
    let allowedSchemes = ["https", "mailto", "tel"]
    guard let scheme = url.scheme?.lowercased(),
          allowedSchemes.contains(scheme) else {
        return // Reject unknown schemes (e.g., javascript:, file:)
    }
    UIApplication.shared.open(url)
}

// Deep link parameter validation
func handleDeepLink(parameters: [String: String]) {
    guard let userId = parameters["userId"],
          userId.allSatisfy({ $0.isLetter || $0.isNumber || $0 == "-" }),
          userId.count <= 36 else {
        return // Invalid user ID format
    }
    // Proceed with validated userId
}
```

---

## Secure Coding Practices

- [ ] No hardcoded API keys, secrets, or passwords in source code
- [ ] No hardcoded URLs for staging/debug environments in release builds
- [ ] Secrets fetched from server at runtime or injected via CI/CD into Keychain
- [ ] Use `#if DEBUG` to gate any debug-only functionality
- [ ] Disable debug logging in release builds
- [ ] Disable `NSLog` or use `os_log` with appropriate log levels
- [ ] Do not write sensitive data to `NSLog` or `print` (logs are accessible)
- [ ] Clear pasteboard of sensitive data when app enters background
- [ ] Disable third-party keyboard for sensitive fields (`.textContentType(.password)`)
- [ ] Prevent screen capture of sensitive screens if required

```swift
// Clear sensitive pasteboard content
NotificationCenter.default.addObserver(
    forName: UIApplication.willResignActiveNotification,
    object: nil, queue: .main
) { _ in
    if UIPasteboard.general.hasStrings {
        UIPasteboard.general.items = []
    }
}

// Secure text entry for sensitive fields
SecureField("Password", text: $password)
    .textContentType(.password)
```

---

## Network Security

- [ ] All communication over HTTPS (enforced by ATS)
- [ ] Authentication tokens sent in `Authorization` header, not URL query parameters
- [ ] Tokens are short-lived with refresh token rotation
- [ ] Refresh tokens stored in Keychain with device-only accessibility
- [ ] Implement token refresh transparently in your network layer
- [ ] Invalidate tokens on the server when user logs out
- [ ] Do not cache responses containing sensitive data (set `Cache-Control: no-store`)
- [ ] Verify SSL/TLS certificate chain in production (do not disable validation)
- [ ] Use `URLSession` with ephemeral configuration for sensitive requests

```swift
// Ephemeral session for sensitive requests (no disk caching)
let ephemeralSession = URLSession(configuration: .ephemeral)

// Token refresh interceptor pattern
class AuthenticatedSession {
    private let session: URLSession
    private let tokenStore: TokenStore

    func authenticatedRequest(
        _ request: URLRequest
    ) async throws -> (Data, URLResponse) {
        var request = request
        request.setValue(
            "Bearer \(try tokenStore.accessToken())",
            forHTTPHeaderField: "Authorization"
        )

        let (data, response) = try await session.data(for: request)

        if let http = response as? HTTPURLResponse, http.statusCode == 401 {
            // Attempt token refresh
            try await tokenStore.refreshTokens()
            request.setValue(
                "Bearer \(try tokenStore.accessToken())",
                forHTTPHeaderField: "Authorization"
            )
            return try await session.data(for: request)
        }

        return (data, response)
    }
}
```

---

## Jailbreak Detection

- [ ] Decide whether jailbreak detection is appropriate for your app's threat model
- [ ] If implemented, check for common indicators (not foolproof but raises the bar):
  - [ ] Check for Cydia or Sileo URL schemes
  - [ ] Check for writable system paths (`/private/var/lib/apt/`)
  - [ ] Check for suspicious dylibs in process
  - [ ] Check if `fork()` succeeds (should fail on non-jailbroken devices)
- [ ] Do not rely solely on jailbreak detection for security (it can be bypassed)
- [ ] Use it as one signal among many (defense in depth)
- [ ] Respond proportionally: warn user, disable sensitive features, or refuse to run

```swift
enum JailbreakDetector {
    static var isJailbroken: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        // Check for common jailbreak artifacts
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
            try "test".write(
                toFile: testPath, atomically: true, encoding: .utf8
            )
            try FileManager.default.removeItem(atPath: testPath)
            return true // Should not be able to write here
        } catch {
            return false
        }
        #endif
    }
}
```

---

## Privacy and Data Minimization

- [ ] Collect only data that is necessary for the app's functionality
- [ ] Clearly explain what data is collected and why (in-app and in privacy policy)
- [ ] Implement data deletion capability (account deletion per App Store requirement)
- [ ] Request permissions only when the feature is used (not at launch)
- [ ] Explain the benefit before showing the system permission dialog
- [ ] Handle permission denial gracefully (show what is unavailable and why)
- [ ] Anonymize analytics data where possible
- [ ] Do not share user data with third parties without explicit consent
- [ ] Implement GDPR data export if serving EU users
- [ ] Provide opt-out for non-essential data collection
- [ ] Audit third-party SDKs for data collection practices
- [ ] Update App Privacy labels in App Store Connect whenever data practices change

```swift
// Pre-permission explanation pattern
struct LocationPermissionView: View {
    let locationManager = CLLocationManager()

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "location.fill")
                .font(.system(size: 60))
                .foregroundStyle(.blue)

            Text("Enable Location")
                .font(.title2.bold())

            Text("We use your location to show nearby restaurants. "
                 + "Your location is never shared with third parties.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)

            Button("Allow Location Access") {
                locationManager.requestWhenInUseAuthorization()
            }

            Button("Not Now") {
                // Continue without location
            }
            .foregroundStyle(.secondary)
        }
        .padding()
    }
}
```

---

## Security Testing

- [ ] Run Xcode static analyzer (Product > Analyze) and address warnings
- [ ] Check for hardcoded secrets with tools like `trufflehog` or `gitleaks` in CI
- [ ] Test with network proxy (Charles/Proxyman) to verify no sensitive data leaks in plaintext
- [ ] Verify Keychain items are not accessible after app uninstall (use `ThisDeviceOnly`)
- [ ] Test behavior on jailbroken device or simulator with security bypasses
- [ ] Review third-party SDK permissions and network behavior
- [ ] Conduct periodic security review of authentication and token handling flows
