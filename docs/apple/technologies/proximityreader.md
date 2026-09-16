# ProximityReader

## Context

Load this when a task names **ProximityReader** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/proximityreader) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Read contactless physical and digital wallet cards using your iPhone.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ProximityReader`.

Documentation language identifiers: occ, swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Payment card reader

- [Setting up Tap to Pay on iPhone](https://developer.apple.com/documentation/proximityreader/setting-up-the-entitlement-for-tap-to-pay-on-iphone)
- [Adding support for Tap to Pay on iPhone to your app](https://developer.apple.com/documentation/proximityreader/adding-support-for-tap-to-pay-on-iphone-to-your-app)
- [PaymentCardReader](https://developer.apple.com/documentation/proximityreader/paymentcardreader)
- [PaymentCardReaderSession](https://developer.apple.com/documentation/proximityreader/paymentcardreadersession)

### Payment requests

- [PaymentCardTransactionRequest](https://developer.apple.com/documentation/proximityreader/paymentcardtransactionrequest)
- [PaymentCardVerificationRequest](https://developer.apple.com/documentation/proximityreader/paymentcardverificationrequest)
- [PaymentCardReadResult](https://developer.apple.com/documentation/proximityreader/paymentcardreadresult)

### Store and Forward mode

- [StoreAndForwardBatch](https://developer.apple.com/documentation/proximityreader/storeandforwardbatch)
- [StoreAndForwardBatchDeletionToken](https://developer.apple.com/documentation/proximityreader/storeandforwardbatchdeletiontoken)
- [StoreAndForwardPaymentCardReaderSession](https://developer.apple.com/documentation/proximityreader/storeandforwardpaymentcardreadersession)
- [StoreAndForwardStatus](https://developer.apple.com/documentation/proximityreader/storeandforwardstatus)
- [PaymentCardReaderStore](https://developer.apple.com/documentation/proximityreader/paymentcardreaderstore)

### Loyalty card requests

- [Accepting loyalty passes from Wallet](https://developer.apple.com/documentation/proximityreader/accepting-loyalty-passes-from-wallet)
- [VASRequest](https://developer.apple.com/documentation/proximityreader/vasrequest)
- [VASReadResult](https://developer.apple.com/documentation/proximityreader/vasreadresult)

### Merchant discovery

- [ProximityReaderDiscovery](https://developer.apple.com/documentation/proximityreader/proximityreaderdiscovery)

### Mobile document reader

- [Adopting the Verifier API in your iPhone app](https://developer.apple.com/documentation/proximityreader/adopting-the-verifier-api-in-your-iphone-app)
- [Generating reader tokens for the Verifier API](https://developer.apple.com/documentation/proximityreader/generating-reader-tokens-for-the-verifier-api)
- [Checking IDs with the Verifier API](https://developer.apple.com/documentation/proximityreader/checking-ids-with-the-verifier-api)
- [MobileDocumentReader](https://developer.apple.com/documentation/proximityreader/mobiledocumentreader)
- [MobileDocumentReaderSession](https://developer.apple.com/documentation/proximityreader/mobiledocumentreadersession)

### Mobile document requests

- [MobileDriversLicenseDisplayRequest](https://developer.apple.com/documentation/proximityreader/mobiledriverslicensedisplayrequest)
- [MobileDriversLicenseDataRequest](https://developer.apple.com/documentation/proximityreader/mobiledriverslicensedatarequest)
- [MobileDriversLicenseRawDataRequest](https://developer.apple.com/documentation/proximityreader/mobiledriverslicenserawdatarequest)
- [MobileNationalIDCardDisplayRequest](https://developer.apple.com/documentation/proximityreader/mobilenationalidcarddisplayrequest)
- [MobileNationalIDCardDataRequest](https://developer.apple.com/documentation/proximityreader/mobilenationalidcarddatarequest)
- [MobileNationalIDCardRawDataRequest](https://developer.apple.com/documentation/proximityreader/mobilenationalidcardrawdatarequest)
- [MobileDocumentDisplayRequest](https://developer.apple.com/documentation/proximityreader/mobiledocumentdisplayrequest)
- [MobileDocumentRequest](https://developer.apple.com/documentation/proximityreader/mobiledocumentrequest)
- [MobileDocumentDataRequest](https://developer.apple.com/documentation/proximityreader/mobiledocumentdatarequest)
- [MobileDocumentRawDataRequest](https://developer.apple.com/documentation/proximityreader/mobiledocumentrawdatarequest)
- [MobilePhotoIDDataRequest](https://developer.apple.com/documentation/proximityreader/mobilephotoiddatarequest)
- [MobilePhotoIDRawDataRequest](https://developer.apple.com/documentation/proximityreader/mobilephotoidrawdatarequest)
- [MobileDocumentAnyOfDataRequest](https://developer.apple.com/documentation/proximityreader/mobiledocumentanyofdatarequest)
- [MobileDocumentAnyOfRawDataRequest](https://developer.apple.com/documentation/proximityreader/mobiledocumentanyofrawdatarequest)

### Tap to Share

- [Adding support for Tap to Share to your app](https://developer.apple.com/documentation/proximityreader/adding-support-for-tap-to-share-to-your-app)
- [CustomerEngagement](https://developer.apple.com/documentation/proximityreader/customerengagement)
- [CustomerEngagementSession](https://developer.apple.com/documentation/proximityreader/customerengagementsession)

### Errors

- [PaymentCardReaderError](https://developer.apple.com/documentation/proximityreader/paymentcardreadererror)
- [MobileDocumentReaderError](https://developer.apple.com/documentation/proximityreader/mobiledocumentreadererror)

### Structures

- [MobileDocumentHolderName](https://developer.apple.com/documentation/proximityreader/mobiledocumentholdername)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
