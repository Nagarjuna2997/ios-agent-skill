# Firebase for iOS

Firebase suits apps needing mobile authentication, document or realtime data, push and operational tooling. Avoid adopting every product by default: analytics, crash reporting and messaging add configuration and disclosure responsibilities independently of database access.

## Installation and authentication

Add `https://github.com/firebase/firebase-ios-sdk` with SPM and only the needed products. Register the exact bundle ID, include the intended GoogleService-Info.plist in the target, and configure Firebase once at the app composition root. This plist contains client identifiers, not an admin service-account credential. Pin the SDK and check its minimum iOS/Xcode versions.

```swift
import FirebaseAuth

func passwordSignIn(email: String, password: String) async throws {
    _ = try await Auth.auth().signIn(withEmail: email, password: password)
}
func guestSignIn() async throws {
    _ = try await Auth.auth().signInAnonymously()
}
func appleSignIn(idToken: String, rawNonce: String) async throws {
    let credential = OAuthProvider.appleCredential(
        withIDToken: idToken, rawNonce: rawNonce, fullName: nil
    )
    _ = try await Auth.auth().signIn(with: credential)
}
func googleSignIn(idToken: String, accessToken: String) async throws {
    let credential = GoogleAuthProvider.credential(
        withIDToken: idToken, accessToken: accessToken
    )
    _ = try await Auth.auth().signIn(with: credential)
}
```

These SDK snippets require configured native Apple/Google flows and an installed Firebase release; they were not compiled against Firebase in the offline sample. Apple needs a fresh nonce/digest pairing; Google needs its own SDK and client ID configuration. Do not log either credential. Phone auth requires its platform verification setup, APNs/reCAPTCHA path as applicable, quotas and abuse controls. Test on a device, including denial and timeout.

Own the auth-state listener and remove it at teardown. Wait for restoration before selecting an account cache. Inspect SDK token persistence instead of copying tokens into UserDefaults. Linking anonymous accounts needs conflict handling; deleting an auth user does not automatically remove Firestore documents or Storage objects.

## Data, files and authorization

Firestore document queries need indexes, limits and cursor pagination. Apple-platform offline persistence can serve cached results; distinguish pending writes and server acknowledgement. Realtime Database uses a different tree model, rules language and persistence behavior; do not assume Firestore rules or query semantics apply.

Cloud Storage requires object rules, upload cancellation/progress and orphan cleanup. Cloud Functions perform privileged operations with server validation; callable transport alone does not establish authorization. Test unauthenticated and cross-user denial in Security Rules. Admin SDK operations are a separate trusted boundary. App Check helps reject untrusted clients but does not replace user authorization or Rules.

## Optional products

| Product | Integration decision and verification |
|---|---|
| FCM | Configure APNs, authorization UX and token rotation; notification delivery is not guaranteed sync |
| Crashlytics | Review crash collection, breadcrumbs and custom keys; never attach sessions or payloads |
| Analytics | Enable only with a documented data/consent policy and accurate disclosures |
| Remote Config | Use safe defaults and bounded fetch; never store secrets or treat a flag as authorization |
| App Check | Configure a supported Apple attestation provider and debug tokens only in development |

## Concurrency, lifecycle and migration

Repository adapters own listeners and cancellation; marshal UI updates to the UI model's isolation. Bound queries and uploads. Distinguish SDK retry behavior from your own retries to avoid duplicate writes. Stable document IDs or transactions can support idempotent workflows; assess the actual mutation semantics. Pause listeners when no longer needed and reconcile on foreground—no continuous-background promise.

Use exact callback routing for native providers. Follow the current email-link documentation rather than resurrecting legacy Dynamic Links recipes. Plan schema evolution for old clients, security-rule deployment order, index creation and local-cache/account transitions. Read [authentication](authentication.md) and [privacy](privacy.md) for deletion and App Review considerations.

## Testing and production gate

Inject repositories for offline Swift tests. Separately run Auth/Firestore/Database/Storage emulators where supported, with explicit emulator endpoints and synthetic users. Ensure emulator/debug App Check configuration cannot leak into production. Test rule denial, session revocation, offline writes, conflict recovery, upload cancellation, account deletion and real APNs behavior. No Firebase SDK or emulator/live-service execution is claimed by this documentation.

Primary sources: [Apple setup](https://firebase.google.com/docs/ios/setup), [Apple auth](https://firebase.google.com/docs/auth/ios/apple), [Google auth](https://firebase.google.com/docs/auth/ios/google-signin), [password](https://firebase.google.com/docs/auth/ios/password-auth), [anonymous](https://firebase.google.com/docs/auth/ios/anonymous-auth), [offline Firestore](https://firebase.google.com/docs/firestore/manage-data/enable-offline), [Rules](https://firebase.google.com/docs/rules), [App Check](https://firebase.google.com/docs/app-check).
