# LocalAuthentication

**Load this when:** gating a screen or an action behind Face ID, Touch ID, or
Optic ID; unlocking a value from the Keychain with biometrics; or deciding what
to do when biometry is unavailable, locked out, or refused.

Covers `LAContext`, the policies, the error cases that actually occur, and the
line between LocalAuthentication and Keychain access control.

**Availability:** framework iOS 8+; `.biometryAny` / `.biometryCurrentSet`
Keychain flags iOS 11.3+; Optic ID visionOS 1+; `LAContext` is **not**
`Sendable`.

---

## 1. The one thing to understand before writing any of this

**`evaluatePolicy` returning `true` is not a security boundary. It is a UI
event.**

It tells you the system displayed a prompt and the user satisfied it. It does
not protect anything. An attacker with your binary can patch the branch, and a
jailbroken device can lie about the result. If the only thing standing between
someone and the data is `if success { showSecrets() }`, the data is not
protected — it is merely inconvenient to reach.

The real boundary is the **Keychain**, with a `SecAccessControl` that names
biometry. There, the Secure Enclave refuses to release the bytes until biometry
succeeds; there is no branch to patch, because the decryption key is never
handed over. See §5.

Use `evaluatePolicy` when the goal is *presence* — "confirm it's you before
transferring money", "re-authenticate after backgrounding". Use Keychain access
control when the goal is *secrecy*.

**A second fact worth knowing up front:** `LAContext` caches a successful
evaluation for the lifetime of the context object. Reusing one context across
screens means the second screen silently unlocks with no prompt. That is
occasionally what you want (`touchIDAuthenticationAllowableReuseDuration`) and
usually a bug. **One context per authentication.**

---

## 2. The seam

Biometrics is a dependency like any other. Behind a protocol it is injectable,
so a `#Preview` and a unit test never trigger a real prompt — which they cannot
do headlessly anyway, so a design that skips the seam is a design with no tests.

```swift
import Foundation
import LocalAuthentication

/// What the app actually needs. Not "an LAContext".
public protocol BiometricAuthenticating: Sendable {
    /// What the device offers right now, including why it cannot be used.
    func availability() -> BiometricAvailability

    /// Prompts, and returns only on success. Throws `BiometricError` otherwise.
    func authenticate(reason: String) async throws
}

public enum Biometry: Equatable, Sendable {
    case none, touchID, faceID, opticID
}

public enum BiometricAvailability: Equatable, Sendable {
    case available(Biometry)
    /// Hardware exists, but the user has not enrolled a face or finger.
    case notEnrolled(Biometry)
    /// Too many failures. Only a device passcode clears this.
    case lockedOut(Biometry)
    /// No biometric hardware, or the user disabled it for this app.
    case unavailable
}

public enum BiometricError: LocalizedError, Equatable {
    case cancelledByUser
    case cancelledBySystem
    case fellBackToPasscode
    case notEnrolled
    case lockedOut
    case notAvailable
    case failed

    public var errorDescription: String? {
        switch self {
        case .cancelledByUser, .cancelledBySystem, .fellBackToPasscode:
            // Not failures. See the anti-patterns.
            nil
        case .notEnrolled:
            String(localized: "Set up Face ID in Settings to unlock this way.")
        case .lockedOut:
            String(localized: "Face ID is locked. Enter your device passcode to re-enable it.")
        case .notAvailable:
            String(localized: "This device can't use biometric unlock.")
        case .failed:
            String(localized: "Couldn't verify it's you. Try again.")
        }
    }
}
```

---

## 3. The implementation

```swift
import LocalAuthentication

/// `LAContext` is not `Sendable` and a context must not be reused across
/// authentications, so this type creates one per call and never stores it.
/// That is what makes the actor safe *and* correct at the same time.
public actor BiometricAuthenticator: BiometricAuthenticating {

    /// `.deviceOwnerAuthenticationWithBiometrics` — biometry only, no passcode
    /// fallback. Use when the whole point is "prove it's this person".
    ///
    /// `.deviceOwnerAuthentication` — biometry, then passcode. Use when the
    /// point is "prove it's the device owner", which is almost every case that
    /// is not a payment confirmation.
    private let policy: LAPolicy

    public init(policy: LAPolicy = .deviceOwnerAuthentication) {
        self.policy = policy
    }

    public nonisolated func availability() -> BiometricAvailability {
        let context = LAContext()
        var error: NSError?

        // canEvaluatePolicy must be called before biometryType is meaningful.
        // Read in the other order it reports .none on a perfectly good device.
        let canEvaluate = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        let biometry: Biometry = switch context.biometryType {
        case .faceID: .faceID
        case .touchID: .touchID
        case .opticID: .opticID
        default: .none
        }

        if canEvaluate { return .available(biometry) }

        return switch LAError.Code(rawValue: error?.code ?? -1) {
        case .biometryNotEnrolled: .notEnrolled(biometry)
        case .biometryLockout: .lockedOut(biometry)
        default: .unavailable
        }
    }

    public func authenticate(reason: String) async throws {
        let context = LAContext()

        // Shown beneath the prompt on Touch ID, and in the passcode sheet.
        // It must say what happens, not what the app is: "Unlock your vault",
        // never "Authenticate with Face ID". The user can see it is Face ID.
        context.localizedFallbackTitle = String(localized: "Use Passcode")

        do {
            // The throwing async overload. The completion-handler form calls
            // back on an arbitrary queue, which is where "UI updated from a
            // background thread" crashes come from.
            try await context.evaluatePolicy(policy, localizedReason: reason)
        } catch let error as LAError {
            throw Self.map(error)
        }
    }

    private static func map(_ error: LAError) -> BiometricError {
        switch error.code {
        case .userCancel:           .cancelledByUser
        case .systemCancel, .appCancel: .cancelledBySystem
        case .userFallback:         .fellBackToPasscode
        case .biometryNotEnrolled:  .notEnrolled
        case .biometryLockout:      .lockedOut
        case .biometryNotAvailable, .passcodeNotSet: .notAvailable
        default:                    .failed
        }
    }
}
```

**On `localizedReason`:** it is user-facing, on screen, in the system prompt.
It must be localized, and it must complete the sentence *"<App> is trying to
…"*. "Unlock your saved cards" is right. "Authenticate" is not a sentence.

---

## 4. The view model

```swift
import Observation

@MainActor
@Observable
public final class VaultLockModel {
    public private(set) var isUnlocked = false
    public private(set) var isAuthenticating = false
    public var errorMessage: String?

    /// Drives the button label and the empty state — a screen that says
    /// "Unlock with Face ID" on a device with no Face ID is a dead end.
    public private(set) var availability: BiometricAvailability = .unavailable

    private let authenticator: any BiometricAuthenticating

    public init(authenticator: any BiometricAuthenticating) {
        self.authenticator = authenticator
    }

    public func refreshAvailability() {
        availability = authenticator.availability()
    }

    public func unlock() async {
        isAuthenticating = true
        defer { isAuthenticating = false }

        do {
            try await authenticator.authenticate(
                reason: String(localized: "Unlock your saved cards")
            )
            isUnlocked = true
            errorMessage = nil
        } catch let error as BiometricError {
            // A cancel is a decision, not a failure. `errorDescription` is nil
            // for those cases, so this assignment is the whole policy.
            errorMessage = error.errorDescription
        } catch {
            errorMessage = String(localized: "Couldn't verify it's you. Try again.")
        }
    }

    /// Call from `.onChange(of: scenePhase)`. Leaving a vault unlocked across
    /// backgrounding defeats the lock — the next person to pick up the phone is
    /// already inside.
    public func lock() {
        isUnlocked = false
    }
}
```

---

## 5. The real boundary: Keychain access control

When the requirement is that data stays unreadable without biometry, the check
belongs in the Keychain, not in an `if`.

```swift
import Foundation
import LocalAuthentication
import Security

public enum BiometricKeychain {

    /// `.biometryCurrentSet` invalidates the item when a face or fingerprint is
    /// added or removed. `.biometryAny` survives enrolment changes — which means
    /// someone who can add their own face to an unlocked device inherits access
    /// to the secret. For anything worth protecting, use `.biometryCurrentSet`
    /// and accept that re-enrolment forces the user to sign in again.
    public static func store(_ secret: Data, account: String) throws {
        var error: Unmanaged<CFError>?
        guard let access = SecAccessControlCreateWithFlags(
            nil,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            .biometryCurrentSet,
            &error
        ) else {
            throw error!.takeRetainedValue() as Error
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: account,
            kSecValueData as String: secret,
            kSecAttrAccessControl as String: access
        ]

        SecItemDelete(query as CFDictionary)   // no duplicates on re-store
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError.status(status) }
    }

    /// The biometric prompt happens *inside* SecItemCopyMatching. There is no
    /// branch to patch: without a successful evaluation the Secure Enclave
    /// never releases the bytes.
    public static func load(account: String, reason: String) throws -> Data {
        let context = LAContext()
        context.localizedReason = reason

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecUseAuthenticationContext as String: context
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else {
            throw KeychainError.status(status)
        }
        return data
    }
}

public enum KeychainError: LocalizedError {
    case status(OSStatus)

    public var errorDescription: String? {
        switch self {
        case .status(errSecUserCanceled): nil          // a decision, not a failure
        case .status: String(localized: "Couldn't unlock your saved data.")
        }
    }
}
```

`SecItemCopyMatching` with an access control **blocks** — it does not return
until the user has responded to the biometric prompt. Call it from an actor:

```swift
public actor SecureCardStore {
    public init() {}

    public func loadCards(reason: String) throws -> Data {
        try BiometricKeychain.load(account: "cards", reason: reason)
    }
}
```

Never call it inside a `@MainActor` type's body, and never reach for
`Task.detached` to escape — that drops isolation, priority, and task-locals to
solve a problem an actor already solves.

---

## 6. Info.plist

Face ID requires a purpose string. Without it the app **crashes** the first time
it prompts — not at launch, not in review necessarily, but on a user's device
the first time they tap Unlock.

```xml
<key>NSFaceIDUsageDescription</key>
<string>Unlock your saved cards without typing your password.</string>
```

Touch ID and device passcode need no key. Face ID does, and the crash it causes
is easy to miss because the simulator you tested on was set to Touch ID.

---

## Anti-Patterns

```swift
// WRONG — a security theatre boundary.
// The branch is patchable and the data was never encrypted. This protects
// nothing; it only adds a prompt.
if try await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: r) {
    self.decryptedCards = loadCardsFromDisk()
}

// RIGHT — the key never leaves the Secure Enclave without biometry, and the
// blocking Keychain call runs on an actor rather than a detached task (which
// would drop isolation, priority, and task-locals for no benefit).
let secret = try await secureStore.loadCards(reason: r)
```

```swift
// WRONG — one context reused across the app.
// It caches the successful evaluation, so the second screen unlocks with no
// prompt at all. The user believes they re-authenticated. They did not.
final class Auth { static let context = LAContext() }

// RIGHT — a fresh LAContext per authentication.
let context = LAContext()
```

```swift
// WRONG — biometryType read before canEvaluatePolicy.
// It reports .none on a device with working Face ID, so the UI offers a
// password field to someone who has Face ID enrolled.
let type = LAContext().biometryType

// RIGHT — evaluate first; the type is only populated afterwards.
let context = LAContext()
_ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
let type = context.biometryType
```

```swift
// WRONG — a cancel rendered as a failure.
// The user tapped Cancel. Telling them "Authentication failed" implies
// something broke and trains them to distrust the prompt.
catch { errorMessage = "Authentication failed" }

// RIGHT — cancels and passcode fallbacks are outcomes, not errors.
catch let error as LAError where error.code == .userCancel { return }
```

```swift
// WRONG — .deviceOwnerAuthenticationWithBiometrics as the only path.
// A user with no enrolled biometry, or one who is locked out, can never get in.
// There is no passcode fallback in this policy — that is what it means.
try await context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: r)

// RIGHT — allow the passcode unless the requirement is specifically biometry.
try await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: r)
```

```swift
// WRONG — .biometryAny on a secret worth protecting.
// The item survives enrolment changes, so adding a new face to an unlocked
// device grants that face access to the existing secret.
SecAccessControlCreateWithFlags(nil, accessible, .biometryAny, &error)

// RIGHT — invalidate when the enrolled set changes.
SecAccessControlCreateWithFlags(nil, accessible, .biometryCurrentSet, &error)
```

```swift
// WRONG — kSecAttrAccessibleWhenUnlocked on a device-bound secret.
// It migrates to a new device through an encrypted backup, which is exactly
// what a device-bound credential must not do.
kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlocked

// RIGHT
kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
```

```swift
// WRONG — LAContext stored on a @MainActor @Observable model.
// LAContext is not Sendable; this is a data race the moment evaluation moves
// off the main actor, and a Swift 6 error.
@MainActor @Observable final class LockModel { let context = LAContext() }

// RIGHT — the context lives inside the actor that uses it, created per call.
```

```swift
// WRONG — a completion handler updating UI directly.
// evaluatePolicy's completion runs on an arbitrary queue. This is the classic
// "UIView modified from a background thread" crash.
context.evaluatePolicy(policy, localizedReason: r) { success, _ in
    self.isUnlocked = success
}

// RIGHT — the async overload, called from an isolated context.
try await context.evaluatePolicy(policy, localizedReason: r)
```

```swift
// WRONG — a hardcoded, untranslated reason string.
// It is displayed to the user, by the system, in their language everywhere
// except this sentence.
localizedReason: "Authenticate"

// RIGHT — localized, and a complete thought.
localizedReason: String(localized: "Unlock your saved cards")
```

```swift
// WRONG — unlocked state that survives backgrounding.
// The next person to pick up the phone is already past the lock screen.

// RIGHT — relock on scenePhase change.
.onChange(of: scenePhase) { _, phase in if phase != .active { model.lock() } }
```

```swift
// WRONG — biometrics as the only way in.
// Face ID fails with sunglasses, gloves defeat Touch ID, and lockout needs a
// passcode to clear. An app with no alternative path is an app the user is
// locked out of.

// RIGHT — always keep a password or passcode route to the same data.
```

---

## Testing

Biometrics cannot be evaluated headlessly, so the protocol seam is not
optional — it is the only way any of this is testable.

```swift
public struct StubBiometrics: BiometricAuthenticating {
    // Note the name: a stored `availability` property would collide with the
    // protocol's `availability()` method — a redeclaration error, not a
    // shadowing warning.
    public var reportedAvailability: BiometricAvailability
    public var error: BiometricError?

    public init(
        reporting availability: BiometricAvailability = .available(.faceID),
        error: BiometricError? = nil
    ) {
        self.reportedAvailability = availability
        self.error = error
    }

    public func availability() -> BiometricAvailability { reportedAvailability }

    public func authenticate(reason: String) async throws {
        if let error { throw error }
    }
}
```

Cover, at minimum: success; `.cancelledByUser` producing **no** error message;
`.lockedOut` producing one that mentions the passcode; and `.notEnrolled`
rendering a screen that does not offer Face ID.

On the simulator, **Features → Face ID → Enrolled**, then **Matching Face** or
**Non-matching Face**. Simulator biometry is not a substitute for a device
pass — enrolment changes and lockout behave differently on real hardware.

---

## Checklist

- [ ] `NSFaceIDUsageDescription` present — its absence is a crash, not a warning
- [ ] Secrets protected by Keychain access control, not by an `if`
- [ ] `.biometryCurrentSet`, not `.biometryAny`, for anything sensitive
- [ ] `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` for device-bound credentials
- [ ] A fresh `LAContext` per authentication
- [ ] `canEvaluatePolicy` called before reading `biometryType`
- [ ] `.deviceOwnerAuthentication` unless biometry-only is a stated requirement
- [ ] Cancel and passcode-fallback produce no error UI
- [ ] Lockout and not-enrolled produce distinct, actionable messages
- [ ] A non-biometric route to the same data exists
- [ ] State relocks on backgrounding
- [ ] `LAContext` never stored on a `@MainActor @Observable` type
- [ ] `localizedReason` is localized and completes "<App> is trying to …"
- [ ] Behind a protocol, with a stub, so previews and tests never prompt
