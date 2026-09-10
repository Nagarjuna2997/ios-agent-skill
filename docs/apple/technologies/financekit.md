# FinanceKit

## Context

Load this when a task names **FinanceKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/financekit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access financial data and interact with Apple Card, Apple Cash, and orders in Wallet.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `FinanceKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 17.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Implementing a background delivery extension](https://developer.apple.com/documentation/financekit/implementing-a-background-delivery-extension)
- [FinanceKit updates](https://developer.apple.com/documentation/updates/financekit)

### Data storage

- [FinanceStore](https://developer.apple.com/documentation/financekit/financestore)

### Authorization

- [authorizationStatus()](https://developer.apple.com/documentation/financekit/financestore/authorizationstatus())
- [requestAuthorization()](https://developer.apple.com/documentation/financekit/financestore/requestauthorization())
- [AuthorizationStatus](https://developer.apple.com/documentation/financekit/authorizationstatus)

### Accounts

- [accounts(query:)](https://developer.apple.com/documentation/financekit/financestore/accounts(query:))
- [accountHistory(since:isMonitoring:)](https://developer.apple.com/documentation/financekit/financestore/accounthistory(since:ismonitoring:))
- [AssetAccount](https://developer.apple.com/documentation/financekit/assetaccount)
- [LiabilityAccount](https://developer.apple.com/documentation/financekit/liabilityaccount)
- [Account](https://developer.apple.com/documentation/financekit/account)

### Balances

- [accountBalances(query:)](https://developer.apple.com/documentation/financekit/financestore/accountbalances(query:))
- [accountBalanceHistory(forAccountID:since:isMonitoring:)](https://developer.apple.com/documentation/financekit/financestore/accountbalancehistory(foraccountid:since:ismonitoring:))
- [AccountBalance](https://developer.apple.com/documentation/financekit/accountbalance)
- [AccountBalanceQuery](https://developer.apple.com/documentation/financekit/accountbalancequery)
- [Balance](https://developer.apple.com/documentation/financekit/balance)
- [CreditDebitIndicator](https://developer.apple.com/documentation/financekit/creditdebitindicator)
- [CurrentBalance](https://developer.apple.com/documentation/financekit/currentbalance)

### Orders

- [FullyQualifiedOrderIdentifier](https://developer.apple.com/documentation/financekit/fullyqualifiedorderidentifier)
- [saveOrder(signedArchive:)](https://developer.apple.com/documentation/financekit/financestore/saveorder(signedarchive:))

### Transactions

- [transactionHistory(forAccountID:since:isMonitoring:)](https://developer.apple.com/documentation/financekit/financestore/transactionhistory(foraccountid:since:ismonitoring:))
- [transactions(query:)](https://developer.apple.com/documentation/financekit/financestore/transactions(query:))
- [AccountQuery](https://developer.apple.com/documentation/financekit/accountquery)
- [AccountCreditInformation](https://developer.apple.com/documentation/financekit/accountcreditinformation)
- [CurrencyAmount](https://developer.apple.com/documentation/financekit/currencyamount)
- [Transaction](https://developer.apple.com/documentation/financekit/transaction)
- [TransactionQuery](https://developer.apple.com/documentation/financekit/transactionquery)
- [TransactionType](https://developer.apple.com/documentation/financekit/transactiontype)
- [TransactionStatus](https://developer.apple.com/documentation/financekit/transactionstatus)

### Queries

- [FinanceStore.HistoryToken](https://developer.apple.com/documentation/financekit/financestore/historytoken)

### Merchant categories

- [MerchantCategoryCode](https://developer.apple.com/documentation/financekit/merchantcategorycode)

### Errors

- [FinanceError](https://developer.apple.com/documentation/financekit/financeerror)

### Protocols

- [BackgroundDeliveryExtension](https://developer.apple.com/documentation/financekit/backgrounddeliveryextension)
- [BackgroundDeliveryExtensionProviding](https://developer.apple.com/documentation/financekit/backgrounddeliveryextensionproviding)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
