# Backend authorization and client secrets

An iOS binary is a public client. Bundle files, strings, configuration and network traffic on a developer-controlled device can be inspected. Obfuscating a server key does not create a trusted boundary.

## Keys are not all equivalent

Supabase `sb_publishable_` keys and legacy anon-role keys identify a public client. They depend on correctly configured grants and RLS. `sb_secret_` and legacy service-role keys are privileged server credentials and must never ship. A decoded JWT role is only classification evidence, not signature verification. Firebase's GoogleService-Info.plist contains client identifiers; it is not a service-account private key. Appwrite server API keys, AWS secret access keys and OAuth client secrets belong on trusted infrastructure.

Keep environments separate. Commit reviewed client configuration only when intended; use private secret management for server values. A gitignored file can still enter an app bundle. If a real key leaked, revoke/rotate it and audit access; deleting a line does not erase history or already published binaries.

## Server responsibilities

Authorize each operation against the authenticated identity, tenant and object. Enforce ownership during insert and update, not only reads. Restrict storage paths, signed URL lifetime, functions and database RPC privileges. Validate payload limits and rate limits server-side. Client checks improve UX but cannot enforce access control.

For Supabase test RLS with an unauthenticated client and two different users using client-safe keys. For Firebase test Rules with the emulator and verify production deployment; Admin SDK operations bypass the client's rules boundary. For Amplify review AppSync auth modes and IAM/Cognito claims. For CloudKit review database scope, record type permissions and sharing. For Appwrite inspect resource permissions and server functions. Auth success alone establishes none of these policies.

## Tool evidence

`review_backend_integration` flags explicit privileged literals and returns only a rule, relative file, line, risk and repair advice. It also checks sensitive UserDefaults writes, direct credential logging, raw URLSession response discards, tight reconnect loops, explicit SQL RLS disabling and unconditional Firebase allows. It reads bounded source/config text, skips dependency/build/test folders and symlinks, and does not validate deployed policy state. Quoted SQL identifiers and dollar-quoted procedure bodies are deliberately outside its top-level policy checks.

An allow-true rule may intentionally expose public content. A migration can temporarily disable RLS. Review target scope and deployment order; do not automatically rewrite either. No local policy file is not evidence that remote RLS is absent. No `@MainActor` keyword is not proof of unsafe concurrency. Use compiler and existing reviewers for their respective contracts.

## Safe observability

Record event type, duration, status class, retry count and a non-sensitive correlation identifier. Never record passwords, OTPs, tokens, raw callback URLs, authorization headers or entire request/response objects. Crash reporters can capture breadcrumbs and custom keys; redact there too. Reports contain local filenames, so review them before sharing.

Test redaction with sentinel secrets and verify cross-user denial, upload type/size limits, revoked identities, replayed callbacks and rate limiting. See [privacy](privacy.md), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Firebase Rules](https://firebase.google.com/docs/rules), and [Apple Keychain](https://developer.apple.com/documentation/security/keychain-services).
