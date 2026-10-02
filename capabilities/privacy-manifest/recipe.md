# Privacy manifest

Adds `Resources/PrivacyInfo.xcprivacy`. The starting declaration is: no tracking, no collected data types, and `UserDefaults` accessed for the app's own data (reason `CA92.1`), which covers `@AppStorage`.

## Use

Review the file before submission. It must describe what the finished app does; the template only knows the defaults.

## Rules

From [privacy](../../docs/backend/privacy.md) and [interaction standards](../../docs/design/interaction-standards.md):

- Every required-reason API the app calls needs a declared reason.
- Collected data types must match the App Store privacy answers.
