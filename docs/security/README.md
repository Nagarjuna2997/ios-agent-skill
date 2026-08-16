# Security, Authentication, and Privacy

## Context

Use this hub for AuthenticationServices, passkeys, Sign in with Apple, LocalAuthentication, Keychain, Secure Enclave, CryptoKit, DeviceCheck, App Attest, privacy manifests, required-reason APIs, ATS, permissions, entitlements, data protection, secrets management, and threat modeling.

## Decision Matrix

| Need | Prefer |
|---|---|
| User login with Apple ID | AuthenticationServices / Sign in with Apple |
| Passwordless credentials | Passkeys |
| Local unlock prompt | LocalAuthentication as UI gate |
| Protect secret bytes | Keychain + access control |
| Cryptographic operations | CryptoKit |
| Device integrity signal | DeviceCheck / App Attest |
| API transport security | ATS, TLS, certificate trust policy |

## Core Rules

- `evaluatePolicy` is not a security boundary; Keychain access control is.
- Do not store tokens, passwords, API keys, or private prompts in UserDefaults.
- Never hardcode production secrets in the app bundle.
- Privacy manifests and purpose strings must match real API usage.
- Entitlements are part of the security review, not build plumbing.
- AI features need prompt, transcript, retrieval, and tool-call threat modeling.

## Threat Model Prompt

```text
Asset:
Entry points:
Trust boundaries:
Attacker capabilities:
Worst credible outcome:
Mitigations:
Residual risk:
```

## Common Mistakes

- Reusing one `LAContext` across screens.
- Using `.biometryAny` for secrets that should invalidate after biometric changes.
- Logging authorization headers, prompts, extracted text, or model transcripts.
- Disabling ATS broadly for one development endpoint.
- Adding entitlements without explaining the user-visible feature.

## Related Guides

- `../frameworks/authentication-services.md`
- `../frameworks/local-authentication.md`
- `../frameworks/cryptokit.md`
- `../frameworks/device-integrity.md`
- `../../checklists/app-store-submission.md`
