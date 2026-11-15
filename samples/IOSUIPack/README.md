# iOS UI pack: native component gallery

This is a small, repository-authored iPhone/iPad app demonstrating selected Apple SwiftUI controls. It is separate from Apple's official Figma and Sketch files. See the [UI pack](../../docs/design/ios-ui-pack/README.md) for official design resources, documentation and licensing. The sample uses system APIs; it does not contain Apple's design assets or implement the whole Apple UI kit.

## Open and run

On a Mac with Xcode 15 or newer and an iOS 17+ simulator:

1. Open `IOSUIPack.xcodeproj` in Xcode.
2. Select the `IOSUIPack` scheme and an iPhone or iPad simulator.
3. Run the app and explore its five tabs. The sample stores its values only in view state; it has no server, account, payment integration or persistence.

To build without signing from this directory:

```bash
xcodebuild -project IOSUIPack.xcodeproj -scheme IOSUIPack \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

The project targets iOS 17, a sample floor rather than a claim about the introduction version of every control. A physical device may require your own signing configuration. No developer-account login is needed for an unsigned simulator build.

## Gallery coverage

| Tab | Examples |
|---|---|
| Controls | Text styles, symbols, buttons, menu and share sheet, stepper, slider, progress, gauge, disclosure and alert |
| Forms | Text fields, toggle, picker, date, color, disabled action and local confirmation |
| Lists | Search, list deletion, detail navigation, add sheet, confirmation dialog and empty results |
| States | Loading, empty, simulated error with retry, and content |
| Adaptive | Sidebar and detail using `NavigationSplitView` |

These examples use native controls, but do not claim pixel parity with the official kit. The inputs, sample data and simulated errors are for demonstration. They are not production data models. The gallery does not implement widgets, payments, authentication, notifications, external services, or every system component; follow the official templates and docs for those.

## Verification

The project and Swift source were authored in a Linux environment without Xcode or the iOS SDK. They have **not been locally compiled or run**. The pull request's iOS UI pack build job, if present, will provide separate Xcode build evidence; a successful build still does not verify simulator interactions, VoiceOver, visual fidelity, or device behavior. Before relying on a sample, run it and review both iPhone and iPad layouts, light/dark appearances, large Dynamic Type, VoiceOver and Reduce Motion.
