# watchOS apps

## Context

Load this when a task names **watchOS apps** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/watchos-apps) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Build watchOS apps that combine complications, notifications, and Siri to create a personal experience on Apple Watch.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Creating an intuitive and effective UI in watchOS 10](https://developer.apple.com/documentation/watchos-apps/creating-an-intuitive-and-effective-ui-in-watchos-10)
- [Updating your app and widgets for watchOS 10](https://developer.apple.com/documentation/watchos-apps/updating-your-app-and-widgets-for-watchos-10)
- [Building a watchOS app](https://developer.apple.com/documentation/watchos-apps/building_a_watchos_app)
- [watchOS updates](https://developer.apple.com/documentation/updates/watchos)
- [Migrating to a single-target watchOS app](https://developer.apple.com/documentation/watchos-apps/migrating-to-a-single-target-watchos-app)

### App experience

- [Setting up a watchOS project](https://developer.apple.com/documentation/watchos-apps/setting-up-a-watchos-project)
- [Creating independent watchOS apps](https://developer.apple.com/documentation/watchos-apps/creating-independent-watchos-apps)
- [Keeping your watchOS content up to date](https://developer.apple.com/documentation/watchos-apps/keeping-your-watchos-app-s-content-up-to-date)
- [Updating watchOS apps with timelines](https://developer.apple.com/documentation/watchos-apps/updating-watchos-apps-with-timelines)
- [Authenticating users on Apple Watch](https://developer.apple.com/documentation/watchos-apps/authenticating-users-on-apple-watch)
- [Responding to the Action button on Apple Watch Ultra](https://developer.apple.com/documentation/appintents/actionbuttonarticle)
- [Enabling the double-tap gesture on Apple Watch](https://developer.apple.com/documentation/watchos-apps/enabling-double-tap)

### Accessibility

- [Create accessible experiences for watchOS](https://developer.apple.com/documentation/watchos-apps/create-accessible-experiences-for-watchos)

### User interface

- [Building a productivity app for Apple Watch](https://developer.apple.com/documentation/watchos-apps/building-a-productivity-app-for-apple-watch)
- [Supporting multiple watch sizes](https://developer.apple.com/documentation/watchos-apps/supporting-multiple-watch-sizes)
- [Designing your app for the Always On state](https://developer.apple.com/documentation/watchos-apps/designing-your-app-for-the-always-on-state)
- [Setting the app’s accent color](https://developer.apple.com/documentation/watchos-apps/setting-the-app-s-accent-color)

### Complications

- [Creating accessory widgets and watch complications](https://developer.apple.com/documentation/widgetkit/creating-accessory-widgets-and-watch-complications)
- [Migrating ClockKit complications to WidgetKit](https://developer.apple.com/documentation/widgetkit/converting-a-clockkit-app)
- [Creating a widget extension](https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension)
- [Keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)
- [Increasing the visibility of widgets in Smart Stacks](https://developer.apple.com/documentation/widgetkit/widget-suggestions-in-smart-stacks)

### Notifications

- [Notifications](https://developer.apple.com/documentation/watchos-apps/notifications)

### Siri

- [Making actions and content discoverable by Apple Intelligence](https://developer.apple.com/documentation/appintents/making-actions-and-content-discoverable-by-apple-intelligence)
- [Creating an Intents App Extension](https://developer.apple.com/documentation/sirikit/creating-an-intents-app-extension)

### Health and fitness

- [Setting up HealthKit](https://developer.apple.com/documentation/healthkit/setting-up-healthkit)
- [Authorizing access to health data](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)
- [Saving data to HealthKit](https://developer.apple.com/documentation/healthkit/saving-data-to-healthkit)
- [Reading data from HealthKit](https://developer.apple.com/documentation/healthkit/reading-data-from-healthkit)
- [Build a workout app for Apple Watch](https://developer.apple.com/documentation/healthkit/build-a-workout-app-for-apple-watch)

### Runtime management

- [Background execution](https://developer.apple.com/documentation/watchkit/background-execution)
- [Life cycles](https://developer.apple.com/documentation/watchkit/life-cycles)
- [Using extended runtime sessions](https://developer.apple.com/documentation/watchkit/using-extended-runtime-sessions)
- [Interacting with Bluetooth peripherals during background app refresh](https://developer.apple.com/documentation/watchkit/interacting-with-bluetooth-peripherals-during-background-app-refresh)

### Network requests

- [Making default and ephemeral requests](https://developer.apple.com/documentation/watchos-apps/making-default-and-ephemeral-requests)
- [Making background requests](https://developer.apple.com/documentation/watchos-apps/making-background-requests)

### Unit tests

- [Setting up tests for your watchOS app](https://developer.apple.com/documentation/watchos-apps/setting-up-tests-for-your-watchos-app)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
