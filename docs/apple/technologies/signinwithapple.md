# Sign in with Apple

## Context

Load this when a task names **Sign in with Apple** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/signinwithapple) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Provide users the ability to sign in to your apps and websites using their Apple Account.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Sign in with Apple JS | 1.0 | — | No |
| Sign in with Apple REST API | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### On-device support

- [Implementing User Authentication with Sign in with Apple](https://developer.apple.com/documentation/authenticationservices/implementing-user-authentication-with-sign-in-with-apple)
- [Displaying Sign in with Apple buttons in your app](https://developer.apple.com/documentation/signinwithapple/displaying-sign-in-with-apple-buttons-in-your-app)

### Web support

- [Sign in with Apple JS](https://developer.apple.com/documentation/signinwithapplejs)
- [Sign in with Apple REST API](https://developer.apple.com/documentation/signinwithapplerestapi)
- [Displaying Sign in with Apple buttons on the web](https://developer.apple.com/documentation/signinwithapple/displaying-sign-in-with-apple-buttons-on-the-web)
- [Configuring your environment for Sign in with Apple](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple)
- [Processing changes for Sign in with Apple accounts](https://developer.apple.com/documentation/signinwithapple/processing-changes-for-sign-in-with-apple-accounts)

### Transfers across teams

- [Transferring your apps and users to another team](https://developer.apple.com/documentation/signinwithapple/transferring-your-apps-and-users-to-another-team)
- [Bringing new apps and users into your team](https://developer.apple.com/documentation/signinwithapple/bringing-new-apps-and-users-into-your-team)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
