# Local primitive constants: Weekend Walks

This fixture combines reusable props/defaults, local primitive constants, template
strings, arithmetic, inline style tokens and a native disclosure. It does not
execute or bundle the React input.

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/react-constants/App.tsx WeekendWalks > /tmp/weekend.json
node mcp-server/dist/unified.js app-ir generate /tmp/weekend.json /tmp/weekend-project
xcodebuild -project /tmp/weekend-project/WeekendWalks.xcodeproj -scheme WeekendWalks -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Local verification, 2026-10-28: Xcode 27.0 (27A266a), iOS 27 SDK,
iOS 17 deployment target, unsigned generic Simulator build **succeeded**.
The archived gzip log, generated RootView and IR are hashed alongside the input.
No simulator interaction, accessibility or visual fidelity result is claimed for
this fixture. Portable tests compare constant expressions to explicit equivalent
Swift output and reject unsupported executable or reactive expressions.
