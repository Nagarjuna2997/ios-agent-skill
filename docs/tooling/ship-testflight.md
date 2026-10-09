# Ship an app to TestFlight

`ios-agent-mcp ship` prepares a reviewable release package, archives with Xcode
signing, and uploads an approved archive to App Store Connect. This is an
unreleased GitHub implementation, not yet available in the published npm package.

The command reuses local release analysis and the screenshot studio. It does not
create an Apple account or App Store Connect app record. You need your own Apple
Developer membership, app record, signing access and a supported macOS/Xcode
installation for archive/upload. Preparation is portable and does not call Apple.

## Prepare and review

Save `ship.json` with your actual app identity and factual copy. Use real simulator
or device captures, never generated pictures presented as app screenshots:

```json
{
  "schemaVersion": 1,
  "project": "MyApp.xcodeproj",
  "scheme": "MyApp",
  "target": "MyApp",
  "configuration": "Release",
  "bundleId": "com.example.myapp",
  "teamId": "ABCDE12345",
  "version": "1.0",
  "build": "1",
  "signing": "automatic",
  "allowProvisioningUpdates": false,
  "metadata": {
    "name": "My App",
    "description": "Describe the app's implemented behavior here.",
    "supportURL": "https://example.com/support",
    "privacyURL": "https://example.com/privacy",
    "locale": "en-US"
  },
  "screenshots": [{
    "profile": "iphone-portrait",
    "templates": ["minimal"],
    "screens": [{
      "image": ".ios-agent/screenshots/home-light.png",
      "headline": "Your daily overview"
    }]
  }]
}
```

Use `workspace` instead of `project` for a workspace, never both. All projects and
screenshot/font/icon inputs must be inside the supplied project root. Add separate
screenshot recipes for each locale/device profile needed by your app; the tool
validates rendering and dimensions but cannot decide your App Store device coverage.

```sh
ios-agent-mcp ship --project /path/MyApp --config /path/MyApp/ship.json
```

Open the returned `SHIP_PLAN.md`, `metadata.json`, `analysis.json` and screenshot
preview galleries under `.ios-agent/ship/<approval-id>/`. Review the analysis
questions; preparation is not a readiness certificate. Metadata is supplied by the
developer and packaged as a draft, not invented from code. Privacy answers, age
rating, export compliance, login/review access and truthful claims remain your
responsibility. Screenshot sets and store metadata stay local in this version;
use App Store Connect to enter/upload the reviewed materials.

Identical inputs reuse the existing approval ID. Changes to source/configuration
or reviewed output invalidate approval. Source hashing covers the self-contained
project root, excluding `.git`, `.ios-agent`, `node_modules`, `DerivedData`, `build`,
`.build`, `.env` files and credential files. External source/dependencies are not
covered; use a self-contained checkout with pinned dependencies. Symlinks are
refused. The 20,000-file limit fails explicitly.

## Archive with signing

```sh
ios-agent-mcp ship --project /path/MyApp --archive --approve FULL_APPROVAL_ID
```

This explicit step executes project build scripts and signs the archive. The
resolved bundle ID, version and build must match the plan. The archive identity,
team and code signature are checked before its hash is saved. Distribution
provisioning is finally validated by Xcode during export/upload.

Automatic signing uses the chosen team. With `allowProvisioningUpdates: true`,
Xcode may create/update certificates, app IDs and profiles on Apple's service.
Leave it false to use existing provisioned signing. No keychain is created or
certificates imported by this command.

For manual signing, configure each app/extension target's Release settings with
`CODE_SIGN_STYLE=Manual`, `DEVELOPMENT_TEAM` and `PROVISIONING_PROFILE_SPECIFIER`.
Supply matching `provisioningProfiles` mappings from bundle IDs to profile names
in the JSON. The command validates those target settings before archive and uses
the mappings during export; it does not rewrite per-target signing settings.

Use an account already configured in Xcode, or set all three environment variables:
`ASC_KEY_PATH` (local `.p8` file), `ASC_KEY_ID`, and `ASC_ISSUER_ID`. Never add the
key to source or to the JSON config. The key contents are not copied into the
release package. Diagnostics are private local files with mode 0600; they can
contain account/build details and must not be published.

## Upload separately

```sh
ios-agent-mcp ship --project /path/MyApp --upload --approve FULL_APPROVAL_ID
```

This sends the signed archive through `xcodebuild -exportArchive` with
`method=app-store-connect` and `destination=upload`. It preserves the approved
build number (`manageAppVersionAndBuildNumber=false`). The source, reviewed files
and archive hash are checked again. Successful command completion is reported as
`UPLOAD_ACCEPTED_PROCESSING_UNKNOWN`, not “available to testers.” Check Apple for
processing errors, compliance questions and TestFlight availability. This command
does not create tester groups, invite testers, submit App Review or release publicly.

An accepted upload is not repeated. Interrupted/failed uploads remain uncertain:
check App Store Connect before recovery. A release-identity ledger blocks another
plan from automatically uploading the same team/bundle/version/build. No automatic
retry flag is provided. Inspect the private receipt and lock after a crash; do not
delete receipts or locks while an operation may still be running.

## Verification status

The Xcode command options were checked against the installed `xcodebuild -help`.
Automated fixtures exercise preparation, screenshot output, approval integrity,
identity mismatch, signing argument construction, archive resumption, uncertain
uploads and duplicate prevention. A real signed archive and live Apple upload have
not been executed for this feature: no release app/account was selected. The remote
macOS build lane remains unsigned; `ship` currently runs on a local Mac.

Sources: [Apple upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds),
[Apple distribution workflow](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases),
and [cloud signing](https://developer.apple.com/videos/play/wwdc2021/10204/).
