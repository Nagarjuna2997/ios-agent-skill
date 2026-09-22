# Supabase for Swift apps

Supabase fits relational apps needing Postgres, flexible authentication, storage and realtime. It is a poor shortcut if the team cannot maintain schemas, grants and Row Level Security. The Swift client is not an offline database or a trusted server.

## Install and configure

Add `https://github.com/supabase/supabase-swift` through SPM, choose the Supabase product and pin the resolved version. Inject a SupabaseClient at the composition root using a validated project URL and publishable key from client configuration. Never use a secret or service-role key. Separate local, staging and production projects and redirect allowlists. These snippets use the documented Swift API surface; external SDK compilation and live provider sign-in are not claimed here.

```swift
import Foundation
import Supabase

// URL and client-safe key are supplied by validated environment configuration.
func makeClient(url: URL, publishableKey: String) -> SupabaseClient {
    SupabaseClient(supabaseURL: url, supabaseKey: publishableKey)
}

func signIn(client: SupabaseClient, email: String, password: String) async throws {
    _ = try await client.auth.signIn(email: email, password: password)
}

func requestLink(client: SupabaseClient, email: String, redirect: URL) async throws {
    try await client.auth.signInWithOTP(email: email, redirectTo: redirect)
}

func requestPhoneOTP(client: SupabaseClient, phone: String) async throws {
    try await client.auth.signInWithOTP(phone: phone)
}

func verifyEmailOTP(client: SupabaseClient, email: String, token: String) async throws {
    _ = try await client.auth.verifyOTP(email: email, token: token, type: .email)
}

func startGuest(client: SupabaseClient) async throws {
    _ = try await client.auth.signInAnonymously()
}
```

Configure email templates to distinguish a clickable magic link from a user-entered OTP. SMS requires an enabled provider, limits and abuse controls; phone OTP is not free proof of identity. Keep passwords and OTPs out of logs and analytics. Anonymous users still have identities and policies; plan upgrade/linking and cleanup instead of treating guest data as globally public.

## Native Apple and Google examples

Obtain the ID token through the native provider SDK, not by decoding an arbitrary callback. For Apple generate a fresh cryptographic nonce, supply its SHA-256 digest to the Apple request, then pass the original nonce to Supabase. For Google obtain a current ID token with the configured iOS/server client IDs; do not substitute an access token for it.

```swift
func exchangeApple(client: SupabaseClient, idToken: String, rawNonce: String) async throws {
    _ = try await client.auth.signInWithIdToken(
        credentials: .init(provider: .apple, idToken: idToken, nonce: rawNonce)
    )
}

func exchangeGoogle(client: SupabaseClient, idToken: String) async throws {
    _ = try await client.auth.signInWithIdToken(
        credentials: .init(provider: .google, idToken: idToken)
    )
}

func browserGitHub(client: SupabaseClient, redirect: URL) async throws {
    _ = try await client.auth.signInWithOAuth(provider: .github, redirectTo: redirect)
}

func receiveAuthCallback(client: SupabaseClient, url: URL) async throws {
    // Caller has matched the exact registered route; SDK validates the auth exchange.
    _ = try await client.auth.session(from: url)
}

func observeSession(client: SupabaseClient) async {
    for await (_, session) in client.auth.authStateChanges {
        if Task.isCancelled { break }
        // Send a domain signed-in/signed-out state to the UI owner; never print session.
        _ = session?.user.id
    }
}
```

The coordinator owns and cancels the observer task on teardown. A production implementation updates state and clears identity-scoped caches; the snippet only illustrates safe API wiring. See [callback validation](authentication.md) before calling `session(from:)` from `onOpenURL`.

## Social provider verification

Official Supabase social-login documentation lists the following providers as of the source snapshot. Server support is not a claim that every provider supports native Swift ID-token exchange.

| Provider | iOS approach | Configuration check |
|---|---|---|
| Apple | Native ID token + nonce, or documented browser flow | Sign in with Apple identifiers, nonce, redirect and provider secret lifecycle |
| Google | Native Google ID token or browser OAuth | iOS/server client IDs and callback setup |
| GitHub | Browser OAuth | Provider app callback and granted scopes |
| Facebook | Browser OAuth unless using a separately verified native integration | App review, scopes and redirect |
| Microsoft / Azure | Browser OAuth | Tenant policy and identity scopes |
| LinkedIn | Supported OIDC provider path | Use the current OIDC configuration, not an obsolete provider slug |
| Discord | Browser OAuth | Redirect and least scopes |
| Slack | Supported OIDC provider path | Workspace/org restrictions and current OIDC configuration |
| Spotify | Browser OAuth | Scope and provider access restrictions |
| Twitch | Browser OAuth | Registered callback and scopes |
| X / Twitter | Browser OAuth | Provider app access and enabled OAuth flow |

Only use enum cases that exist in the pinned Swift SDK. Do not translate this table into guessed case names. Supabase session refresh does not automatically refresh an external provider's access token; if the app calls that provider's APIs, implement the documented separate token lifecycle server-side where necessary.

## MFA and passkeys

MFA is an enrollment → challenge → verify flow, with assurance level checked before sensitive server operations. Test recovery, unenrollment and expired challenges; do not invent recovery codes or accept a client-only MFA flag.

The official passkeys guide currently labels passkeys **experimental**, requires opt-in, and lists **supabase-swift 2.48.0 or later**. Registration requires an existing confirmed, non-anonymous user. RP identity and associated platform configuration are security-critical. The documented high-level operations include sign-in and registration, but no live Swift passkey ceremony was verified in this change. Pin a supported SDK and follow its current platform recipe before enabling production passkeys. Do not describe WebAuthn support as generally stable or interchangeable with password authentication.

## Sessions, metadata and deletion

Let the SDK coordinate access/refresh tokens and inspect the pinned version's persistence policy. Use an appropriate Keychain-backed storage adapter when supplying sensitive persistence. Handle initial restoration, refresh, revoked sessions and signed-out events. `try await client.auth.signOut()` ends the selected session scope; clear local identity data and listeners as well. Choose global/local scope deliberately according to the SDK contract.

User-editable metadata is not an authorization claim. Derive tenant and role access from trusted server policy. Account deletion must invoke an authenticated server function that verifies the caller and performs privileged deletion plus related row/file cleanup. Never embed the admin API key to call deletion from the app. Reauthenticate where warranted, cancel pending uploads and explain retention exceptions.

## Postgres, RPC and RLS

Use typed Codable DTOs and explicit selections. Filter and paginate on the server with stable ordering; do not load a whole table to filter in Swift. Keep domain models independent from database column naming. Test nullable columns, timestamps and incompatible migrations.

Enable and test RLS for exposed tables and review grants. Policies need ownership constraints on insert and update as well as select. Test two users and unauthenticated clients with client-safe keys; service-role tests can accidentally bypass the boundary you intended to measure. RPC functions need reviewed execution grants and security-definer/search-path behavior. SQL constraints protect invariants even when clients are stale.

## Storage, realtime and functions

Scope Storage bucket/object policies by identity and path; enforce file size/type and clean orphaned objects. Treat signed URLs as temporary bearer access and omit them from logs. Upload progress/cancellation belongs to a repository, not a SwiftUI body.

Realtime channels need cancellation, reconnect/catch-up and duplicate handling. Event delivery does not replace initial queries or durable local state. Auth changes require channel reauthorization or recreation. Edge Functions verify identity and authorize operations independently; a client publishable key alone is not user authentication. Keep outbound provider secrets and privileged database operations on the function/server.

## Offline and production checklist

Use a local store and explicit outbox if offline edits are required. Define conflict resolution and idempotency keys; retry only safe operations with bounded backoff. Foreground listeners cannot run continuously while iOS is suspended. Deep links can arrive before restoration: route once, then reconcile session state.

Use the Supabase CLI/local stack for synthetic policy and migration tests, and an injected repository for offline Swift tests. Apply reviewed migrations to staging before production. Verify auth redirects on a device, RLS denials, session revocation, paging termination, upload cleanup, deletion and schema rollback strategy. Record [App Privacy and telemetry choices](privacy.md); third-party social login needs an App Review 4.8 assessment.

## Primary references

[Swift auth](https://supabase.com/docs/reference/swift/auth-api), [OAuth](https://supabase.com/docs/reference/swift/auth-signinwithoauth), [ID token exchange](https://supabase.com/docs/reference/swift/auth-signinwithidtoken), [OTP](https://supabase.com/docs/reference/swift/auth-signinwithotp), [auth events](https://supabase.com/docs/reference/swift/auth-onauthstatechange), [social providers](https://supabase.com/docs/guides/auth/social-login), [passkeys](https://supabase.com/docs/guides/auth/passkeys), [MFA](https://supabase.com/docs/guides/auth/auth-mfa), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage policies](https://supabase.com/docs/guides/storage/security/access-control), [function auth](https://supabase.com/docs/guides/functions/auth), [client keys](https://supabase.com/docs/guides/getting-started/api-keys).
