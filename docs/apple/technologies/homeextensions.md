# HomeExtensions

## Context

Load this when a task names **HomeExtensions** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/homeextensions) · Source checked: 2026-11-13.

Apple’s short description (excerpt):

> Add custom UI to the Home app, to configure and control accessories.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `HomeExtensions`.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [HomeExtension](https://developer.apple.com/documentation/homeextensions/homeextension)
- [HomeContext](https://developer.apple.com/documentation/homeextensions/homecontext)
- [HomeNavigator](https://developer.apple.com/documentation/homeextensions/homenavigator)

### Displaying accessory configuration

- [HomeAccessorySettingsProvider](https://developer.apple.com/documentation/homeextensions/homeaccessorysettingsprovider)
- [HomeAccessorySettingsContainer](https://developer.apple.com/documentation/homeextensions/homeaccessorysettingscontainer)
- [HomeAccessorySettingsContext](https://developer.apple.com/documentation/homeextensions/homeaccessorysettingscontext)
- [HomeAccessorySettings](https://developer.apple.com/documentation/homeextensions/homeaccessorysettings)
- [HomeAccessoryConfiguration](https://developer.apple.com/documentation/homeextensions/homeaccessoryconfiguration)

### Defining accessory settings

- [HomeAccessorySetting](https://developer.apple.com/documentation/homeextensions/homeaccessorysetting)
- [HomeAccessorySettingLabel](https://developer.apple.com/documentation/homeextensions/homeaccessorysettinglabel)
- [HomeAccessoryEnumSetting](https://developer.apple.com/documentation/homeextensions/homeaccessoryenumsetting)
- [HomeAccessoryEnumSettingConstant](https://developer.apple.com/documentation/homeextensions/homeaccessoryenumsettingconstant)
- [HomeAccessoryInformationSetting](https://developer.apple.com/documentation/homeextensions/homeaccessoryinformationsetting)
- [HomeAccessoryRangeSetting](https://developer.apple.com/documentation/homeextensions/homeaccessoryrangesetting)
- [HomeAccessoryRangeSettingDescriptor](https://developer.apple.com/documentation/homeextensions/homeaccessoryrangesettingdescriptor)
- [HomeAccessoryTextFieldSetting](https://developer.apple.com/documentation/homeextensions/homeaccessorytextfieldsetting)
- [HomeAccessoryToggleSetting](https://developer.apple.com/documentation/homeextensions/homeaccessorytogglesetting)

### Guides and troubleshooting content

- [HomeContent](https://developer.apple.com/documentation/homeextensions/homecontent)
- [HomeContentID](https://developer.apple.com/documentation/homeextensions/homecontentid)
- [HomeAccessoryHelpGuide](https://developer.apple.com/documentation/homeextensions/homeaccessoryhelpguide)
- [HomeAccessoryTroubleshooting](https://developer.apple.com/documentation/homeextensions/homeaccessorytroubleshooting)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
