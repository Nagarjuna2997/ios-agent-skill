# AuthenticationServices

**Load this when:** adding Sign in with Apple, passkeys, or an OAuth/OIDC web
flow; storing or refreshing auth tokens; or handling an account that the user
can revoke from outside your app.

Covers `AuthenticationServices` — Sign in with Apple, passkeys
(`ASAuthorizationPlatformPublicKeyCredentialProvider`), and
`ASWebAuthenticationSession`.

**Availability:** framework iOS 12+; Sign in with Apple iOS 13+;
`SignInWithAppleButton` (SwiftUI) iOS 14+; **passkeys iOS 16+**.

---

## 1. The three facts that cause most Sign in with Apple bugs

Read these before the code. Each one produces a bug that only appears in
production, days after sign-in.

**1. Name and email are returned exactly once — on the very first
authorization.** Every subsequent sign-in returns `nil` for both, forever, even
after a reinstall. If you do not persist them at first authorization, they are
gone. There is no API to ask again; the user must revoke the app in Settings and
re-authorize.

**2. The user can revoke access outside your app** (Settings → Apple Account →
Sign-In & Security → Sign in with Apple). Your stored credential keeps looking
valid. You must check `getCredentialState` on launch and sign the user out when
it is not `.authorized`.

**3. The identity token is the only thing your server may trust.** The user
identifier alone is not proof of anything — it arrives on-device and can be
forged by a modified client. Send the JWT and verify it server-side against
Apple's public keys.

---

## 2. Sign in with Apple

### The seam

`ASAuthorizationController` is delegate-based, which does not compose with
`async`/`await` or with this skill's testability rules. Wrap it once behind a
protocol.

```swift
import AuthenticationServices

/// What the app actually needs. The view model depends on this, never on
/// ASAuthorizationController — see patterns/clean-architecture.md.
protocol AppleSignInService: Sendable {
    func signIn(nonce: String) async throws -> AppleCredential
    func credentialState(for userID: String) async -> ASAuthorizationAppleIDProvider.CredentialState
}

struct AppleCredential: Sendable {
    let userID: String
    /// JWT for your server. The ONLY value your backend should trust.
    let identityToken: Data
    let authorizationCode: Data
    /// Present on FIRST authorization only. Never returned again.
    let email: String?
    let fullName: PersonNameComponents?
}
```

### Bridging the delegate to async/await

```swift
@MainActor
final class LiveAppleSignInService: NSObject, AppleSignInService {
    // Held for the lifetime of one request. The system does NOT retain the
    // controller — dropping it silently cancels the flow with no callback.
    private var controller: ASAuthorizationController?
    private var continuation: CheckedContinuation<AppleCredential, any Error>?

    func signIn(nonce: String) async throws -> AppleCredential {
        try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation

            let request = ASAuthorizationAppleIDProvider().createRequest()
            request.requestedScopes = [.fullName, .email]
            // Hash of a random nonce. Your server compares this against the
            // claim in the identity token to reject replayed tokens.
            request.nonce = sha256(nonce)

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            self.controller = controller
            controller.performRequests()
        }
    }

    func credentialState(
        for userID: String
    ) async -> ASAuthorizationAppleIDProvider.CredentialState {
        await withCheckedContinuation { continuation in
            ASAuthorizationAppleIDProvider().getCredentialState(forUserID: userID) { state, _ in
                continuation.resume(returning: state)
            }
        }
    }

    /// Resume exactly once, then clear. Resuming a continuation twice is a
    /// runtime crash; never resuming leaks the task forever.
    private func finish(_ result: Result<AppleCredential, any Error>) {
        let pending = continuation
        continuation = nil
        controller = nil
        pending?.resume(with: result)
    }
}

extension LiveAppleSignInService: ASAuthorizationControllerDelegate {
    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard
            let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
            let identityToken = credential.identityToken,
            let authorizationCode = credential.authorizationCode
        else {
            finish(.failure(AuthError.malformedCredential))
            return
        }

        finish(.success(AppleCredential(
            userID: credential.user,
            identityToken: identityToken,
            authorizationCode: authorizationCode,
            email: credential.email,                 // first authorization only
            fullName: credential.fullName            // first authorization only
        )))
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: any Error
    ) {
        // The user tapping Cancel is not a failure to report.
        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            finish(.failure(CancellationError()))
        } else {
            finish(.failure(error))
        }
    }
}

extension LiveAppleSignInService: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Do not use UIApplication.shared.windows.first — it is deprecated and
        // wrong under multiple scenes.
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}
```

### The nonce

```swift
import CryptoKit

func makeNonce(length: Int = 32) -> String {
    var bytes = [UInt8](repeating: 0, count: length)
    let status = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)
    precondition(status == errSecSuccess, "SecRandomCopyBytes failed")
    return Data(bytes).base64EncodedString()
}

func sha256(_ input: String) -> String {
    SHA256.hash(data: Data(input.utf8))
        .map { String(format: "%02x", $0) }
        .joined()
}
```

Send the **raw** nonce to your server and the **hashed** one to Apple. The
server checks that the token's `nonce` claim equals `sha256(rawNonce)`. Skipping
this means a stolen identity token can be replayed.

### View model

```swift
@MainActor
@Observable
final class SignInModel {
    private(set) var isSigningIn = false
    var errorMessage: String?

    private let appleSignIn: any AppleSignInService
    private let session: any SessionStore

    init(appleSignIn: any AppleSignInService, session: any SessionStore) {
        self.appleSignIn = appleSignIn
        self.session = session
    }

    func signInWithApple() async {
        isSigningIn = true
        defer { isSigningIn = false }

        let nonce = makeNonce()
        do {
            let credential = try await appleSignIn.signIn(nonce: nonce)
            // Persist name/email NOW — they will never be returned again.
            try await session.establish(credential: credential, rawNonce: nonce)
            errorMessage = nil
        } catch is CancellationError {
            return                                   // user tapped Cancel
        } catch {
            errorMessage = String(localized: "Couldn't sign in. Please try again.")
        }
    }
}
```

### The button

```swift
import AuthenticationServices
import SwiftUI

SignInWithAppleButton(.signIn) { request in
    request.requestedScopes = [.fullName, .email]
    request.nonce = sha256(model.currentNonce)
} onCompletion: { _ in
    // Handled by the service above; this closure exists only to satisfy the API.
}
.signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
.frame(height: 50)          // Apple's HIG: 44pt minimum
```

Use `SignInWithAppleButton`, not a custom button. App Review rejects
reimplementations that do not match Apple's specified appearance, and the system
button handles localization and Dynamic Type for you.

---

## 3. Revocation — the check people forget

```swift
@MainActor
@Observable
final class SessionModel {
    private(set) var isSignedIn = false
    private let appleSignIn: any AppleSignInService
    private let session: any SessionStore

    /// Call from `.task` on the root view, every launch and every foreground.
    func validateSession() async {
        guard let userID = await session.storedAppleUserID() else {
            isSignedIn = false
            return
        }

        switch await appleSignIn.credentialState(for: userID) {
        case .authorized:
            isSignedIn = true
        case .revoked, .notFound:
            // The user revoked access in Settings, or the account is gone.
            await session.clear()
            isSignedIn = false
        case .transferred:
            // App was transferred between developer teams — migrate server-side.
            await session.beginTeamTransferMigration()
        @unknown default:
            isSignedIn = false
        }
    }
}
```

Also observe the revocation notification while running:

```swift
.task {
    for await _ in NotificationCenter.default.notifications(
        named: ASAuthorizationAppleIDProvider.credentialRevokedNotification
    ) {
        await model.validateSession()
    }
}
```

---

## 4. Passkeys (iOS 16+)

Passkeys replace passwords with a WebAuthn credential bound to your domain.
They require the **Associated Domains** capability with
`webcredentials:example.com`, and a matching `apple-app-site-association` file.

```swift
@available(iOS 16.0, *)
@MainActor
final class PasskeyService: NSObject {
    private let domain = "example.com"
    private var continuation: CheckedContinuation<ASAuthorization, any Error>?
    private var controller: ASAuthorizationController?

    /// Registration: the challenge and userID come from YOUR server.
    func register(userName: String, userID: Data, challenge: Data) async throws -> ASAuthorization {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: domain
        )
        let request = provider.createCredentialRegistrationRequest(
            challenge: challenge,
            name: userName,
            userID: userID
        )
        return try await perform(request)
    }

    /// Assertion: signing in with an existing passkey.
    func signIn(challenge: Data) async throws -> ASAuthorization {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: domain
        )
        return try await perform(provider.createCredentialAssertionRequest(challenge: challenge))
    }

    private func perform(_ request: ASAuthorizationRequest) async throws -> ASAuthorization {
        try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            self.controller = controller
            controller.performRequests()
        }
    }
}
```

**The challenge must come from your server and be single-use.** A
client-generated challenge defeats the entire protocol.

For a sign-in field that offers both passkeys and a saved password, use
`performAutoFillAssistedRequests()` together with
`.textContentType(.username)` on the field.

---

## 5. OAuth via ASWebAuthenticationSession

For a third-party identity provider that has no native SDK.

```swift
@MainActor
final class WebAuthService: NSObject {
    private var session: ASWebAuthenticationSession?

    func authenticate(url: URL, callbackScheme: String) async throws -> URL {
        try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: callbackScheme
            ) { callbackURL, error in
                if let error {
                    let cancelled = (error as? ASWebAuthenticationSessionError)?.code == .canceledLogin
                    continuation.resume(throwing: cancelled ? CancellationError() : error)
                } else if let callbackURL {
                    continuation.resume(returning: callbackURL)
                } else {
                    continuation.resume(throwing: AuthError.malformedCredential)
                }
            }

            session.presentationContextProvider = self
            // true = no shared cookies, so the user must log in each time.
            // false = single sign-on with Safari. Choose deliberately.
            session.prefersEphemeralWebBrowserSession = false
            self.session = session
            session.start()
        }
    }
}
```

Use **PKCE** for any OAuth flow from a mobile client. The implicit flow and
embedded `WKWebView` login are both rejected by most providers and by App Review.

---

## 6. Storing what comes back

Tokens go in the **Keychain**, never `UserDefaults` — see
`checklists/security.md` and `docs/frameworks/cryptokit.md`.

```swift
actor KeychainSessionStore: SessionStore {
    func establish(credential: AppleCredential, rawNonce: String) async throws {
        // Exchange with your server FIRST — it verifies the identity token and
        // the nonce, then returns your own session token.
        let session = try await api.exchange(
            identityToken: credential.identityToken,
            authorizationCode: credential.authorizationCode,
            rawNonce: rawNonce,
            // Send these on first authorization only — they are never resent.
            email: credential.email,
            fullName: credential.fullName.map(PersonNameComponentsFormatter().string(from:))
        )
        try store(session.token, account: "session")
        try store(credential.userID, account: "appleUserID")
    }
}
```

Use `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` for session tokens:
available to background tasks after first unlock, and never restored onto a
different device from a backup.

---

## Anti-Patterns

```swift
// 1. Not persisting name/email at first authorization.
if let email = credential.email { showWelcome(email) }   // and then discarded
// They are returned ONCE, ever. Persist immediately or lose them permanently.

// 2. Trusting the user identifier as authentication.
api.login(userID: credential.user)
// Arrives on-device, forgeable. Send the identity token; verify server-side.

// 3. No nonce.
let request = provider.createRequest()
request.requestedScopes = [.fullName, .email]     // no request.nonce
// A stolen identity token can be replayed indefinitely.

// 4. Never checking credential state.
// The user revokes in Settings; your app stays "signed in" forever.
// Check getCredentialState on launch and on foreground.

// 5. Dropping the controller.
func signIn() {
    let controller = ASAuthorizationController(...)   // local, deallocated
    controller.performRequests()                      // silently never calls back
}

// 6. Resuming a continuation twice — or not at all.
continuation.resume(returning: credential)
continuation.resume(returning: credential)   // CRASH
// Every exit path resumes exactly once. Clear the stored continuation first.

// 7. Treating cancellation as an error.
catch { errorMessage = "Sign in failed" }    // fires when the user taps Cancel
catch is CancellationError { return }        // correct

// 8. Tokens in UserDefaults.
UserDefaults.standard.set(token, forKey: "authToken")   // plaintext, backed up
// Keychain.

// 9. A custom Sign in with Apple button.
Button("Sign in with Apple") { … }
// App Review rejects appearances that do not match the specification.

// 10. Embedded WKWebView for OAuth.
// Rejected by providers and by App Review. Use ASWebAuthenticationSession.

// 11. UIApplication.shared.windows.first as the presentation anchor.
// Deprecated, and wrong with multiple scenes. Use connectedScenes.

// 12. A client-generated passkey challenge.
// Defeats the protocol. The challenge is server-issued and single-use.

// 13. The view model naming ASAuthorizationController directly.
// Untestable and un-previewable. Depend on a protocol.
```

---

## App Store notes

- If your app offers third-party or social login, App Review requires an
  equivalent privacy-preserving option. Sign in with Apple satisfies this —
  check the current text of Guideline 4.8 before submitting, as the wording has
  changed across revisions.
- Offer account **deletion** in-app if you offer account creation (Guideline
  5.1.1(v)), and revoke the Apple token server-side when the user deletes.
- Passkeys need Associated Domains and a served
  `apple-app-site-association`. Verify it responds over HTTPS with no redirect
  before submitting — this is the usual cause of "passkeys work in debug, not in
  TestFlight".

---

## Checklist

- [ ] `email` and `fullName` persisted on first authorization.
- [ ] A random nonce per request; hashed to Apple, raw to your server.
- [ ] Server verifies the identity token against Apple's public keys.
- [ ] `getCredentialState` checked on launch and on foreground.
- [ ] `credentialRevokedNotification` observed while running.
- [ ] `ASAuthorizationController` retained for the request's lifetime.
- [ ] Every continuation resumes exactly once on every path.
- [ ] `CancellationError` handled as a deliberate no-op.
- [ ] Tokens in the Keychain with an appropriate accessibility class.
- [ ] `SignInWithAppleButton`, not a custom control.
- [ ] Passkeys: Associated Domains configured, challenge server-issued.
- [ ] OAuth: `ASWebAuthenticationSession` with PKCE, never a `WKWebView`.
- [ ] The view model depends on a protocol; sign-in previews with a stub.
- [ ] Account deletion offered and the Apple token revoked server-side.
