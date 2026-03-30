# App Store Submission Checklist

A comprehensive checklist for submitting an iOS app. Work through each section before uploading your archive to App Store Connect.

---

## App Metadata

- [ ] App name finalized (30 character limit, no keyword stuffing)
- [ ] Subtitle written (30 character limit, descriptive and compelling)
- [ ] App description written (up to 4000 characters, most important info first)
- [ ] Promotional text set (170 characters, can be updated without a new build)
- [ ] Keywords optimized (100 character budget, comma-separated, no spaces after commas)
- [ ] Primary and secondary categories selected
- [ ] Support URL provided (must be a working webpage)
- [ ] Marketing URL provided (optional but recommended)
- [ ] Copyright field filled (e.g., "2026 Your Company Name")
- [ ] Version number follows semantic versioning (e.g., 1.0.0)

## Screenshots and Previews

- [ ] Screenshots provided for 6.7" display (iPhone 15 Pro Max / 16 Pro Max -- 1290 x 2796)
- [ ] Screenshots provided for 6.5" display (iPhone 11 Pro Max -- 1242 x 2688) if targeting older devices
- [ ] Screenshots provided for 5.5" display (iPhone 8 Plus -- 1242 x 2208) if supporting iPhone SE
- [ ] iPad Pro 12.9" screenshots (2048 x 2732) if universal app
- [ ] iPad Pro 13" (M4) screenshots (2064 x 2752) if targeting latest iPads
- [ ] Minimum 3 screenshots per device size (maximum 10)
- [ ] Screenshots show actual app UI (not misleading)
- [ ] App preview videos uploaded (optional, 15-30 seconds, no watermarks)
- [ ] All screenshots and previews localized for each supported language

## App Review Guidelines Compliance

### 1.0 Safety
- [ ] No objectionable content without proper age gating
- [ ] User-generated content has reporting and blocking mechanisms
- [ ] No realistic violence in icons or screenshots for apps aimed at children

### 2.0 Performance
- [ ] App is complete and functional (no beta, demo, or trial labels)
- [ ] No hidden or undocumented features
- [ ] App does not download additional executable code after install
- [ ] App works without requiring additional hardware to review

### 3.0 Business
- [ ] In-app purchases use StoreKit (not third-party payment for digital goods)
- [ ] Subscriptions include clear pricing and terms
- [ ] Subscription offers restore previous purchases
- [ ] Free trials clearly state what happens when trial ends
- [ ] No bait-and-switch pricing

### 4.0 Design
- [ ] App uses standard system UI or well-designed custom UI
- [ ] App functions on all supported device sizes (no black bars)
- [ ] No use of private APIs
- [ ] App does not mimic native iOS system UI in misleading ways
- [ ] Extensions (widgets, keyboards, etc.) include sufficient standalone functionality

### 5.0 Legal
- [ ] App complies with all local laws in each territory
- [ ] Developer Program License Agreement followed
- [ ] No use of copyrighted material without permission
- [ ] GDPR and CCPA compliance if targeting EU/California users

## Privacy

- [ ] Privacy policy URL provided (required for all apps)
- [ ] Privacy policy is accessible and clearly written
- [ ] App Privacy labels configured in App Store Connect (Data Types questionnaire)
- [ ] Each data type categorized correctly (collected vs. tracked vs. linked)
- [ ] App Tracking Transparency (ATT) prompt implemented if tracking users across apps
- [ ] ATT prompt shown before any tracking begins
- [ ] `NSUserTrackingUsageDescription` added to Info.plist if using ATT
- [ ] Purpose strings (usage descriptions) provided for all permission requests:
  - [ ] `NSCameraUsageDescription`
  - [ ] `NSPhotoLibraryUsageDescription`
  - [ ] `NSLocationWhenInUseUsageDescription`
  - [ ] `NSLocationAlwaysAndWhenInUseUsageDescription` (if applicable)
  - [ ] `NSMicrophoneUsageDescription`
  - [ ] `NSContactsUsageDescription`
  - [ ] `NSCalendarsUsageDescription`
  - [ ] `NSBluetoothAlwaysUsageDescription`
  - [ ] `NSFaceIDUsageDescription`
  - [ ] `NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription`
- [ ] Each purpose string clearly explains why the permission is needed (in user-friendly language)

## App Transport Security

- [ ] ATS enabled (default in modern Xcode projects)
- [ ] No blanket `NSAllowsArbitraryLoads = YES` in production
- [ ] Any ATS exceptions are justified and documented
- [ ] All API endpoints use HTTPS with TLS 1.2+
- [ ] Third-party SDKs do not require ATS exceptions (or exceptions are scoped narrowly)

## Required Device Capabilities

- [ ] `UIRequiredDeviceCapabilities` in Info.plist lists only truly required capabilities
- [ ] Do not require capabilities unnecessarily (this restricts compatible devices)
- [ ] Common capabilities reviewed:
  - [ ] `armv7` / `arm64` -- processor architecture
  - [ ] `camera-flash` -- only if core feature needs it
  - [ ] `gps` -- only if precise location is essential
  - [ ] `nfc` -- only if NFC is core to the app
  - [ ] `arkit` -- only if AR is mandatory

## Launch Screen and App Icons

- [ ] Launch screen configured (storyboard or Info.plist configuration)
- [ ] Launch screen matches initial app state (no logos per HIG unless branding)
- [ ] App icon provided as a single 1024x1024 asset in the asset catalog
- [ ] App icon does not contain alpha channel / transparency
- [ ] App icon is not a photograph of an iPhone or iPad
- [ ] App icon renders well at small sizes (no fine details lost)
- [ ] Alternate app icons configured if supported (optional)

## Entitlements and Capabilities

- [ ] Only required entitlements are enabled in Signing & Capabilities
- [ ] Push Notifications: APNs certificate or key configured, entitlement enabled
- [ ] Sign In with Apple: entitlement enabled if using Apple ID sign-in
- [ ] Associated Domains: configured for universal links / web credentials
- [ ] App Groups: configured if sharing data between app and extensions
- [ ] Background Modes: only required modes selected
- [ ] HealthKit: entitlement and usage descriptions set
- [ ] iCloud / CloudKit: container configured if using cloud sync
- [ ] In-App Purchase: capability enabled, products configured in App Store Connect
- [ ] Provisioning profile matches entitlements (no mismatch errors)

## Build Configuration

- [ ] Deployment target set appropriately (check analytics for user base)
- [ ] Build number incremented from last upload
- [ ] Release build configuration used (not Debug)
- [ ] Bitcode setting matches project requirements (deprecated in Xcode 16+)
- [ ] All architectures included (arm64 required)
- [ ] dSYM files generated for crash reporting
- [ ] No compiler warnings in Release build
- [ ] No `#if DEBUG` code leaking into release paths
- [ ] All test/staging API URLs replaced with production URLs
- [ ] Logging level reduced for production (no verbose console output)

## TestFlight Beta Testing

- [ ] Internal testing group created (up to 100 testers)
- [ ] External testing group created if needed (up to 10,000 testers)
- [ ] Beta App Description written
- [ ] Beta build uploaded and processed successfully
- [ ] Compliance information answered (encryption export regulations)
- [ ] If using non-exempt encryption, proper export compliance documentation filed
- [ ] Test notes written for each build describing what to test
- [ ] At least one full round of beta testing completed
- [ ] Critical crash reports from TestFlight addressed
- [ ] Beta feedback reviewed and acted upon

## Common Rejection Reasons and Fixes

- [ ] **Crashes/bugs**: Test every user flow, including edge cases and poor network
- [ ] **Broken links**: Verify every URL in the app (support, privacy policy, terms)
- [ ] **Placeholder content**: Remove all lorem ipsum, test data, TODO comments visible to users
- [ ] **Incomplete information**: App description, screenshots, and metadata must be final
- [ ] **Login required but no demo account**: Provide demo credentials in review notes
- [ ] **Permissions without features**: Do not request permissions until the feature needs them
- [ ] **Third-party sign-in without Sign In with Apple**: If you offer Google/Facebook sign-in, you must also offer Sign In with Apple
- [ ] **Subscription issues**: Clearly disclose pricing before paywall; include restore purchases button
- [ ] **Minimum functionality**: App must provide lasting value beyond a simple website wrapper
- [ ] **Misleading metadata**: Keywords, description, and screenshots must accurately represent the app

## Xcode Archive and Upload

- [ ] Select "Any iOS Device (arm64)" as build destination
- [ ] Product > Archive (builds the release archive)
- [ ] Archive appears in Organizer window without errors
- [ ] Validate the archive (Organizer > Validate App)
- [ ] Resolve any validation warnings or errors
- [ ] Distribute App > App Store Connect > Upload
- [ ] Upload succeeds without errors
- [ ] Build appears in App Store Connect under TestFlight within 15-30 minutes
- [ ] Build processing completes (check for processing errors via email)
- [ ] Select build in App Store Connect release
- [ ] Submit for Review

## Post-Submission

- [ ] Monitor App Store Connect for review status changes
- [ ] Respond to any App Review questions promptly (via Resolution Center)
- [ ] Prepare release notes for the version
- [ ] Decide release method: manual release, automatic after approval, or phased rollout
- [ ] Phased release recommended for major updates (1% > 2% > 5% > 10% > 20% > 50% > 100% over 7 days)
- [ ] Monitor crash reports after release via Xcode Organizer or third-party tool
- [ ] Monitor App Store reviews and respond to user feedback
