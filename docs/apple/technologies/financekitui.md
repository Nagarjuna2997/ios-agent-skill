# FinanceKitUI

## Context

Load this when a task names **FinanceKitUI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/financekitui) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Add orders to Apple Wallet.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `FinanceKitUI`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 17.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Adding an order to Apple Wallet

- [AddOrderToWalletButton](https://developer.apple.com/documentation/financekitui/addordertowalletbutton)
- [AddOrderToWalletButtonStyle](https://developer.apple.com/documentation/financekitui/addordertowalletbuttonstyle)

### Protocols

- [FinancialConnectionUIExtension](https://developer.apple.com/documentation/financekitui/financialconnectionuiextension)
- [FinancialConnectionUIExtensionProviding](https://developer.apple.com/documentation/financekitui/financialconnectionuiextensionproviding)
- [FinancialConnectionUIExtensionScene](https://developer.apple.com/documentation/financekitui/financialconnectionuiextensionscene)

### Structures

- [FinancialConnectionExtensionAuthorizationRequest](https://developer.apple.com/documentation/financekitui/financialconnectionextensionauthorizationrequest)
- [FinancialConnectionExtensionAuthorizationResult](https://developer.apple.com/documentation/financekitui/financialconnectionextensionauthorizationresult)
- [FinancialConnectionUIExtensionAuthorizationScene](https://developer.apple.com/documentation/financekitui/financialconnectionuiextensionauthorizationscene)
- [TransactionPicker](https://developer.apple.com/documentation/financekitui/transactionpicker)

### Type Aliases

- [FinancialConnectionExtensionAuthorizationParams](https://developer.apple.com/documentation/financekitui/financialconnectionextensionauthorizationparams)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
