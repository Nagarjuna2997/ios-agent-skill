# App Store Submission Checklist

## App Review Guidelines Compliance

### Content and Functionality
- [ ] App provides real value beyond a simple website wrapper
- [ ] No placeholder content, "lorem ipsum", or incomplete features
- [ ] All URLs and links are functional
- [ ] Privacy policy URL is accessible and accurate
- [ ] App does not duplicate Apple built-in apps without significant differentiation
- [ ] No hidden or undocumented features

### In-App Purchases
- [ ] All digital content/subscriptions use StoreKit (not third-party payment)
- [ ] Subscription terms clearly displayed before purchase
- [ ] Free trial terms visible; cancel mechanism documented
- [ ] Restore Purchases button available for non-consumables and subscriptions
- [ ] No references to external payment methods for digital goods

### User-Generated Content
- [ ] Content filtering/moderation in place
- [ ] Mechanism to report offensive content
- [ ] Ability to block abusive users
- [ ] Content meets minimum age rating requirements

---

## Required Metadata

### App Store Connect

```
App Name:           Max 30 characters
Subtitle:           Max 30 characters
Description:        Up to 4000 characters (first 3 lines most visible)
Keywords:           100 characters total, comma-separated
Support URL:        Required (must be accessible)
Marketing URL:      Optional but recommended
Privacy Policy URL: Required for all apps
```

### Screenshots
- [ ] iPhone 6.7" (1290 x 2796) — required
- [ ] iPhone 6.5" (1284 x 2778) — required if supporting older devices
- [ ] iPad Pro 12.9" 6th gen (2048 x 2732) — required for iPad apps
- [ ] Apple Watch Series (if applicable)
- [ ] Apple TV (if applicable)
- [ ] Mac (if applicable)
- [ ] Up to 10 screenshots per device size
- [ ] Screenshots show actual app functionality (no misleading images)
- [ ] Text overlays readable, not too small

### App Icon
- [ ] 1024 x 1024 PNG, no alpha channel
- [ ] No rounded corners (system applies them)
- [ ] Distinct and recognizable at small sizes
- [ ] Does not use Apple product images or UI elements

### App Preview Videos (Optional)
- [ ] 15-30 seconds long
- [ ] Captured from the app itself (no external footage)
- [ ] Shows core functionality within first 5 seconds
- [ ] Appropriate for all audiences

---

## Privacy and Data Collection

### App Privacy Labels (Required)

```
For each data type your app collects, declare:
1. Data type (name, email, location, etc.)
2. Usage purpose (analytics, app functionality, third-party advertising)
3. Whether data is linked to user identity
4. Whether data is used for tracking across apps/websites
```

### Common Data Types to Declare
- [ ] Contact info (name, email, phone)
- [ ] Health & fitness (if using HealthKit)
- [ ] Financial info (payment data)
- [ ] Location (precise or coarse)
- [ ] Identifiers (user ID, device ID)
- [ ] Usage data (product interaction, analytics)
- [ ] Diagnostics (crash data, performance data)
- [ ] Browsing history
- [ ] Search history

### Privacy Requirements
- [ ] App Tracking Transparency prompt if tracking users (ATTrackingManager)
- [ ] Purpose strings for all permissions in Info.plist
- [ ] Data collection matches privacy label declarations
- [ ] Privacy policy covers all data practices

```swift
// Required Info.plist permission descriptions
NSCameraUsageDescription         = "Take photos for your profile"
NSPhotoLibraryUsageDescription   = "Select photos from your library"
NSLocationWhenInUseUsageDescription = "Show nearby locations"
NSMicrophoneUsageDescription     = "Record voice messages"
NSHealthShareUsageDescription    = "Read your step count"
NSHealthUpdateUsageDescription   = "Save workout data"
NSFaceIDUsageDescription         = "Unlock the app with Face ID"
```

---

## App Transport Security (ATS)

```xml
<!-- Info.plist — Best practice: no exceptions needed if using HTTPS -->
<key>NSAppTransportSecurity</key>
<dict>
    <!-- Only add exceptions if absolutely necessary -->
    <!-- Apple will ask for justification during review -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>legacy-api.example.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

- [ ] All network requests use HTTPS (TLS 1.2+)
- [ ] No blanket `NSAllowsArbitraryLoads = YES` (will likely be rejected)
- [ ] Any ATS exceptions have valid justification prepared

---

## Entitlements and Capabilities

### Verify Provisioning
- [ ] Bundle identifier matches across Xcode, App Store Connect, and certificates
- [ ] Development and distribution provisioning profiles are current
- [ ] All required entitlements are enabled in both portal and Xcode
- [ ] Push notification certificates configured (if applicable)

### Common Capabilities
```
Push Notifications      — APNs certificate or key configured
Sign in with Apple      — Required if offering third-party sign-in
Associated Domains      — For universal links and web credentials
App Groups              — For extensions sharing data with main app
HealthKit               — HealthKit entitlement and privacy descriptions
In-App Purchase         — StoreKit configured in App Store Connect
Background Modes        — Only enable modes you actually use
```

---

## TestFlight Beta Testing

### Internal Testing (up to 100 testers)
- [ ] Upload build via Xcode or `xcodebuild | xcrun altool`
- [ ] Build appears in App Store Connect within minutes
- [ ] Add internal testers (Apple Developer account holders)
- [ ] No review required for internal builds

### External Testing (up to 10,000 testers)
- [ ] Requires Beta App Review (usually faster than full review)
- [ ] Provide test notes and contact info
- [ ] Share public link or invite testers by email
- [ ] Collect feedback via TestFlight's built-in screenshot tool

### Build Management
```bash
# Archive and upload
xcodebuild archive -scheme MyApp -archivePath build/MyApp.xcarchive
xcodebuild -exportArchive -archivePath build/MyApp.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/

# Or use Xcode: Product > Archive > Distribute App
```

---

## Common Rejection Reasons and Fixes

### 1. Crashes and Bugs
**Problem**: App crashes during review.
**Fix**: Test on physical devices matching reviewer's config. Test with no network, low storage, interrupted flows.

### 2. Incomplete Information
**Problem**: Reviewer cannot access features (login required, missing test account).
**Fix**: Provide demo credentials in App Review Information. Include clear setup instructions.

### 3. Misleading App Description
**Problem**: Screenshots or description don't match actual functionality.
**Fix**: Keep screenshots current. Don't overstate features.

### 4. Insufficient Content
**Problem**: App feels like a basic web wrapper or has minimal functionality.
**Fix**: Add native features (widgets, notifications, offline support) that justify a native app.

### 5. Privacy Violations
**Problem**: Collecting data without consent, or missing privacy labels.
**Fix**: Audit all SDKs for data collection. Update privacy labels to match reality.

### 6. Payments Outside StoreKit
**Problem**: Links to external purchase pages for digital content.
**Fix**: Use StoreKit for all digital goods. Physical goods and services can use external payment.

### 7. Missing Restore Purchases
**Problem**: No way to restore previously purchased content.
**Fix**: Add a "Restore Purchases" button that calls `AppStore.sync()` or `SKPaymentQueue.restoreCompletedTransactions()`.

### 8. Guideline 4.3 — Spam
**Problem**: App is too similar to existing apps (including your own).
**Fix**: Ensure unique functionality. Combine similar apps into one with configuration options.

### Pre-Submission Final Check
- [ ] Test on oldest supported iOS version
- [ ] Test on smallest supported screen size
- [ ] Test with VoiceOver enabled
- [ ] Test with Dynamic Type at largest setting
- [ ] Test in airplane mode
- [ ] Remove all debug logs, test flags, and internal URLs
- [ ] Verify version number and build number are incremented
- [ ] Archive uses Release configuration (not Debug)
