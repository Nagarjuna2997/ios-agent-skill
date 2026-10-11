# Local App Store readiness review

Use the existing `audit_app_store_readiness` MCP tool or the terminal command from a built checkout:

```sh
node mcp-server/dist/unified.js readiness --path /path/to/app \
  --project App.xcodeproj --target App --configuration Release \
  --metadata metadata.json
```

The optional metadata file contains `name` and `subtitle`; other fields are ignored by this review. The tool runs offline without a model, Apple account or paid service. It does not edit, sign, submit or upload anything.

## What is checked

| Evidence | Check | Boundary |
| --- | --- | --- |
| Concrete permission operations | Selected Info.plist purpose strings, including empty values and generated keys | Reuses the integration permission catalog; imports alone are not requests. Localized strings and unresolved settings need built-app review. |
| HealthKit, Apple Pay, CloudKit, push operations | Selected entitlement presence and expected value shape | Reuses the integration checker. No provisioning validation; unused entitlements are not deleted or declared incorrect. |
| Required-reason API indicators | Nonempty structurally valid category/reason entries in the app target's resource manifest | Five categories: UserDefaults, SystemBootTime, FileTimestamp, DiskSpace, ActiveKeyboards. This is bounded lexical coverage, not a complete API or binary scan. |
| Export compliance | Missing answer advisory and incorrect Boolean type | Never guesses whether encryption is exempt. A missing key is not proof of rejection: App Store Connect can collect the answer. |
| Name and subtitle | Length over 30 characters; possible pricing wording advisory | “Free” may be contextual. No keyword match proves a violation or predicts a rejection. English pricing patterns only. |
| Launch configuration | Existing target-aware storyboard, asset and launch-setting checks | Same existing engine, applied to each selected project/target/configuration. |

A manifest elsewhere in the repository cannot satisfy the selected target's resource membership. An app with no detected required-reason use is **not automatically required** to add a manifest by this check. Empty or malformed required-reason declarations are reported only when the corresponding use is found. A syntactically valid reason is not verified to be an Apple-approved or legally applicable reason: the developer must check Apple's current list and actual data use.

## Unknown is not ready

Missing/ambiguous settings, xcconfig inheritance, preprocessing, folder/synchronized resources, generated inputs, unresolved variables, non-app targets and unsupported project formats are reported as limitations. Missing-key findings are suppressed when the effective configuration cannot be established. Conditional compilation branches are not guessed. The report includes each target and configuration rather than merging every plist in a repository.

Static source matching can miss wrappers, Objective-C, imported binaries or dynamically generated code, and cannot establish runtime paths or app behavior. Review the final archive, privacy report, localizations, SDK manifests and provisioning before submitting. No output is an Apple approval certificate.

Exit `1` means actionable static findings; `2` means incomplete coverage; `0` means the bounded checks completed without actionable findings or reported coverage gaps. Minor advisories still require reading. None of these codes establishes App Store acceptance.

## Ship integration

`ship prepare` reuses this check for the selected release project/target/configuration and supplied metadata. It writes `readiness.json` before sealing the existing artifact hashes. Review the report alongside `analysis.json` and metadata drafts. An unknown or advisory result does not secretly authorize signing or uploading: those remain separate explicit approvals. This report does not add an automatic legal/compliance gate or alter the existing resumability and integrity mechanism.

## Sources

- [Apple required-reason API documentation](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
- [ITSAppUsesNonExemptEncryption](https://developer.apple.com/documentation/bundleresources/information-property-list/itsappusesnonexemptencryption)
- [App Review guideline 2.3.7](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)

Rules reviewed October 11, 2026. Static checks support developer review; they do not replace Apple's current requirements.
