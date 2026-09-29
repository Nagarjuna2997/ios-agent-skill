# SystemIntegrationDemo

Unsigned iOS 17+ sample and ten reusable integration components. Open SystemIntegrationDemo.xcodeproj. The demo offers photo import, explicit Calendar/Reminder creation, Maps, system sharing and local notification scheduling. It uses no third-party dependencies, credentials or maintainer branding.

Run `bash samples/SystemIntegrationDemo/verify.sh` from the repository root. This typechecks all components with Swift 6 and warnings as errors, then builds the unsigned simulator app. It does not grant permissions or exercise device behavior.

Only Calendar and Reminders permissions are in the demo plist because the other direct-access components are not invoked by the demo. If adding Contacts, camera or photo saving, add the corresponding purpose string and present a user-triggered permission flow. Calendar/Reminder actions create real records in the selected device account. Use a test account and remove records afterward. Notification delivery must be checked after backgrounding the app; the sample validates its own URL scheme before handling a notification route.

Never invoke API operations merely to test permission detection. Authorization, limited/denied access, unavailable hardware, account setup, document-provider behavior and Siri discovery require manual tests. The map search/directions helpers need network; the build and static verification do not.
