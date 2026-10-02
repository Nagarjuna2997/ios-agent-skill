# Local notifications and reminders

Schedules notifications on the device, with no server. `LocalNotificationScheduler` wraps `UNUserNotificationCenter`; `ReminderSettingsView` gives users a toggle and time for a daily reminder.

## Use

```swift
@State private var reminders = ReminderModel(scheduler: LocalNotificationScheduler())

Form {
    ReminderSettingsView(model: reminders)
}
.task { await reminders.refresh() }
```

## Rules

From [User Notifications](../../docs/frameworks/usernotifications.md):

- Request authorization in context (when the user enables a reminder) and handle denial with a path to Settings.
- Use stable identifiers so rescheduling replaces rather than duplicates.
- Without a delegate, notifications are not shown while the app is in the foreground; `NotificationPresenter` handles that.
- Remote push needs a server and APNs credentials (`push-notifications`).
