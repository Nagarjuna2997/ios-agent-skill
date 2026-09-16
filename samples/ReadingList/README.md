# Reading List acceptance demo

A complete SwiftUI iOS 17+ app with local JSON persistence, title/author search, reading progress, deletion, empty/search-empty/loading/error states, labelled controls and semantic Dynamic Type text. Previews use an in-memory store; failed disk writes preserve the visible library, and corrupt storage is not overwritten.

Open `ReadingList.xcodeproj` in Xcode and run the ReadingList scheme. The checked-in project needs no XcodeGen installation. To regenerate after editing `project.yml`, run `xcodegen generate`.

## Verify

```bash
python3 verify.py
```

Requires Xcode, Python 3 and an available iPhone simulator runtime. Set `IOS_AGENT_SIMULATOR_UDID` to select a specific iOS simulator. Otherwise verification chooses a booted iPhone or an available iPhone. Tests use a separate storage filename and cannot clear the normal app's reading list.

The three unit tests cover disk persistence, search, reading progress, deletion, corrupt storage and failed writes. Two UI tests cover add/save/relaunch/search and the error state. Six screenshots are exported from XCTest attachments into `.ios-agent/evidence/`. Results are stored in `.ios-agent/acceptance.xcresult`. These generated files are ignored by Git.

For the saved, resumable acceptance workflow, follow [App-building loop](../../docs/tooling/app-building-loop.md). `BRIEF.md`, `plan.json` and `checks.json` are the reproducible demo contract. The supplied plan is human-authored; AI planning and repairs require a working local Claude CLI session.

Labels and semantic text are exercised in the UI tests. Full VoiceOver navigation, all Dynamic Type sizes, iPad layouts and physical devices have not been audited. The demo is a working reference, not a released App Store product.
