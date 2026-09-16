# Accessory Notifications

## Context

Load this when a task names **Accessory Notifications** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/accessorynotifications) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Receive forwarded iOS system notifications on an accessory that you develop.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Accessory Notifications`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.5 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Authorization

- [AccessoryNotificationCenter](https://developer.apple.com/documentation/accessorynotifications/accessorynotificationcenter)
- [ForwardingDecision](https://developer.apple.com/documentation/accessorynotifications/forwardingdecision)

### Notification receipt

- [Receiving iOS notifications on an accessory](https://developer.apple.com/documentation/accessorytransportextension/receiving-ios-notifications-on-an-accessory)
- [NotificationsForwarding](https://developer.apple.com/documentation/accessorynotifications/notificationsforwarding)
- [NotificationsForwarding.AccessoryNotificationsHandler](https://developer.apple.com/documentation/accessorynotifications/notificationsforwarding/accessorynotificationshandler)
- [NotificationsForwarding.Session](https://developer.apple.com/documentation/accessorynotifications/notificationsforwarding/session)

### Data curation and alerting

- [AccessoryNotification](https://developer.apple.com/documentation/accessorynotifications/accessorynotification)
- [AlertingContext](https://developer.apple.com/documentation/accessorynotifications/alertingcontext)

### Interactive support

- [Responding to forwarded notifications](https://developer.apple.com/documentation/accessorynotifications/responding-to-forwarded-notifications)
- [NotificationResponse](https://developer.apple.com/documentation/accessorynotifications/notificationresponse)

### Errors

- [AccessoryError](https://developer.apple.com/documentation/accessorynotifications/accessoryerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
