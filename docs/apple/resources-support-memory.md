# Apple Developer Resources And Support Memory

## Context

Load this when the Apple Developer site footer, resources area, account area, programs, events, downloads, forums, tutorials, technotes, videos, support articles, contact support, bug reporting, system status, certificates, App Store Connect, or developer program membership appears in the task.

This file completes the non-framework Apple Developer memory. It tells the agent how to use Apple resources operationally without turning them into a link list.

## Resource hierarchy memory

Apple Developer resources have different authority levels:

| Resource | Agent default |
|---|---|
| Documentation | Canonical API behavior, framework concepts, availability, required keys, entitlement notes. |
| Human Interface Guidelines | Canonical UX, platform feel, wording, layout, interaction, AI trust, accessibility expectations. |
| Sample Code | Integration/lifecycle evidence; useful for setup and architecture shape, not mandatory app architecture. |
| Tutorials | Learning path; good for onboarding or explaining concepts from scratch. |
| Downloads | SDKs, Xcode, beta OS images, tools, profiles; needed for build/runtime verification. |
| Technotes | Deep engineering guidance for common hard problems and platform edge cases. |
| Videos | WWDC intent, migration, design reasoning, and newly introduced workflows. |
| Forums | Useful for edge cases and Apple engineer clarifications; weaker than docs unless confirmed. |
| Feedback Assistant | Bug reports, enhancement requests, documentation feedback. |
| System Status | Apple service outage checks before debugging your own backend. |
| Support Articles | Account, membership, certificates, App Store Connect, and operational help. |

Memory rule: choose the resource by problem type. Do not use sample code to override API docs, and do not use forums as canonical unless official documentation or Apple staff confirms the behavior.

## Downloads memory

Use Downloads when work depends on local Apple tooling:

- Xcode version.
- SDK version.
- Beta OS image.
- Simulator runtime.
- Command line tools.
- Additional toolchains.
- Device support packages.
- Profiles or resources.

Rules:

- Verify tool version before blaming code.
- Do not claim beta-only APIs are stable.
- Record Xcode, SDK, OS, simulator/device, and Swift version in reports.
- Avoid upgrading a user's toolchain without explicit consent.
- If build behavior changes after an Xcode update, load `docs/migration/xcode-migration.md`.

## Technotes memory

Technotes are for "this keeps happening in real apps" problems.

Use them for:

- Signing and provisioning failures.
- Networking/TLS edge cases.
- App lifecycle problems.
- App Store review or distribution surprises.
- Framework-specific platform caveats.
- Debugging and diagnostic workflows.

Rules:

- Treat technotes as high-signal engineering guidance.
- Apply the exact environment assumptions.
- Do not generalize a technote beyond its stated problem.
- Keep a local report of which technote rule changed the implementation.

## Videos memory

WWDC/developer videos explain intent, architecture, migration, and best practices.

Use them for:

- New framework introductions.
- Design reasoning.
- Migration strategy.
- Performance/debugging workflow.
- Feature demos that combine several APIs.

Rules:

- Do not quote videos as API signatures.
- Convert video guidance into implementation rules and tests.
- Pair videos with documentation before shipping.

## Forums memory

Forums are useful but lower authority.

Use forums when:

- Documentation is ambiguous.
- A framework behavior looks like a bug.
- Entitlement, review, or tool behavior is unclear.
- You need to see if others hit the same edge case.

Rules:

- Prefer Apple staff answers.
- Capture uncertainty.
- Do not build security, privacy, or commerce decisions only from forum posts.
- If the behavior is a bug, prepare Feedback Assistant evidence.

## Feedback Assistant memory

Use Feedback Assistant when the issue is probably Apple-side:

- Xcode crash or compiler bug.
- Simulator/device tool failure.
- Documentation error.
- Framework behavior contradicts docs.
- Regression across SDK or OS versions.
- Missing API capability or enhancement request.

Good feedback includes:

- Minimal reproducible project.
- Exact Xcode/SDK/OS/device versions.
- Expected behavior.
- Actual behavior.
- Logs, crash reports, sysdiagnose, screen recording, or sample output.
- Steps to reproduce.

Memory rule: Feedback Assistant is not a workaround. Keep a local mitigation plan while waiting.

## System Status memory

Check System Status before debugging Apple service integrations.

Use it for:

- App Store Connect outage.
- TestFlight delays.
- CloudKit failures.
- Push notification issues.
- Developer account/cert/profile problems.
- In-app purchase sandbox weirdness.
- WeatherKit or other Apple service availability.

Rules:

- If Apple service is degraded, report UNVERIFIED for app-side diagnosis.
- Retry after service recovery before changing code.

## Account memory

Apple Developer account areas include:

- Apple Developer account.
- App Store Connect.
- Certificates, Identifiers, and Profiles.
- Feedback Assistant.

Rules:

- Never ask the user to paste private keys, passwords, session cookies, or recovery codes into docs.
- Keep API keys and signing credentials out of git.
- Use least-privilege roles in App Store Connect.
- Separate local developer credentials from CI credentials.
- Document which account/team owns bundle IDs, services, keys, merchant IDs, and App Groups.

## Certificates, IDs, and profiles memory

Signing problems are usually identity, entitlement, profile, device, or team mismatches.

Checklist:

- Correct Apple team.
- Correct bundle identifier.
- Correct capability enabled on App ID.
- Correct provisioning profile type.
- Correct device registered for development/ad hoc.
- Correct certificate valid and trusted.
- Xcode selected the intended signing mode.
- Entitlements in built app match expected capabilities.

Do not fix signing by deleting random certificates unless the user explicitly asks and you know the blast radius.

## App Store Connect memory

App Store Connect is product operations, not just upload.

Use it for:

- Apps, versions, metadata.
- TestFlight.
- Users and access.
- In-app purchases/subscriptions.
- App privacy.
- Analytics and sales reports.
- App Review submission.
- Certificates/agreements dependencies.

Rules:

- Keep metadata and binary state separate.
- TestFlight build processing can lag.
- App privacy answers must match real data use.
- Subscription/product IDs should be stable.
- Screenshots, age rating, encryption, privacy, and entitlements are release blockers.

## Programs memory

Apple programs define eligibility, capabilities, and policy:

- Apple Developer Program.
- Apple Developer Enterprise Program.
- App Store Small Business Program.
- MFi Program.
- News Partner Program.
- Video Partner Program.
- Security Bounty Program.
- Security Research Device Program.

Rules:

- Do not assume a framework is usable without program/entitlement eligibility.
- Enterprise distribution is not App Store distribution.
- MFi/accessory work may require program membership and hardware processes.
- Security research and bounty work has program boundaries.
- Small Business Program affects proceeds, not code implementation.

## Events memory

Events include:

- Meet with Apple.
- Apple Developer Centers.
- App Store Awards.
- Apple Design Awards.
- Apple Developer Academies.
- WWDC.

Use events for:

- Learning new APIs.
- Design/technical labs.
- Review preparation.
- Platform migration planning.
- Apple engineer feedback.

Rules:

- Events teach direction and best practice.
- Shipping still requires docs, SDKs, tests, and device verification.

## Footer category memory

The footer categories are a second navigation map. Route them like this:

| Footer area | Memory |
|---|---|
| Platforms | Load platform docs and compatibility matrix. |
| Tools | Load Swift, SwiftUI, Xcode, Xcode Cloud, TestFlight, SF Symbols memory. |
| Topics & Technologies | Load navigator brain plus alphabet/domain memory. |
| Resources | Load this file. |
| Support | Use support/system/account/debugging workflow. |
| Account | Credentials, roles, signing, App Store Connect, Feedback Assistant. |
| Programs | Eligibility, capabilities, distribution model, policy. |
| Events | Learning/labs/WWDC/design awards; not API authority. |

## Operational anti-patterns

- Treating Downloads as optional when a build depends on a specific SDK.
- Debugging CloudKit/TestFlight/App Store Connect without checking System Status.
- Putting signing keys, private keys, or App Store Connect API keys in git.
- Treating forum posts as stronger than docs.
- Treating WWDC demos as production-ready code without adaptation.
- Changing account/team/certificate state without understanding who else depends on it.
- Assuming program membership, entitlements, or region availability.
