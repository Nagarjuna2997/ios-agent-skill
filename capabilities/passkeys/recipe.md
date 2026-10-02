# Passkeys

`PasskeyService` wraps `ASAuthorizationPlatformPublicKeyCredentialProvider` and SwiftUI's `AuthorizationController`. It returns the raw credential fields for your server's WebAuthn verification.

## Use

```swift
@Environment(\.authorizationController) private var authorizationController

let challenge = try await api.passkeyChallenge()
let credential = try await PasskeyService.fromBundle()?.signIn(challenge: challenge, using: authorizationController)
```

## Rules

From [AuthenticationServices](../../docs/frameworks/authentication-services.md):

- The relying party identifier is your domain, and the app must be listed in that domain's `apple-app-site-association` under `webcredentials`.
- Challenges come from the server and are used once.
- The server verifies attestation and assertions; the app only relays them.
