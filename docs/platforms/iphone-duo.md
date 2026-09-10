# iPhone Duo: adaptive apps and simulator readiness

## Context

Checked September 10, 2026. Apple announced iPhone Duo on September 9: a foldable iPhone running iOS 27 with inner and outer displays and Split View multitasking. Apple's announcement describes Device Hub support for Duo as **upcoming**. That announcement is not evidence that a Duo simulator profile is already installed or downloadable for a particular Xcode build.

Source: [Apple introduces iPhone Duo](https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/). For toolchain changes use [Apple Xcode updates](https://developer.apple.com/documentation/updates/xcode) and `docs/tooling/device-hub.md`.

## Pattern

### Discover support rather than inventing it

Call the runtime MCP's `simulator_environment`. It reports the actual selected Xcode, installed runtimes and device types, plus matching Duo profiles. `simulator_list` reports instantiated, available devices. A device type and a device instance are different: a installed type may still need an instance created in Xcode.

On the development Mac checked for this release, Xcode 26.6 had iOS 26.1, 26.2, 26.4 and 26.5 runtimes and **no Duo device type**. This is a dated observation, not a global assertion about Apple's downloads. Check again after updating Xcode and its Components. Do not automatically download multi-gigabyte runtimes or change the selected Xcode as a side effect of listing devices.

The viewer uses real Simulator screenshots. Renaming an ordinary simulator to “Duo”, drawing a foldable device frame, or testing an iPad does not emulate Duo hardware or prove fold transitions work.

### Engineering guidance until and after device support arrives

The following is our implementation guidance inferred from adaptive app requirements, not a claim about undocumented Duo APIs:

- Make layout respond to available container size and system size classes. Avoid device-name checks, hardcoded screen dimensions, or guessed hinge geometry.
- Keep navigation selection, drafts, playback and in-flight work in stable model ownership so layout changes do not recreate user state.
- Use system navigation, safe areas and keyboard avoidance. Test compact and expanded layouts, landscape, Dynamic Type, and side-by-side windows.
- Reflow lists and detail content rather than scaling a fixed canvas. Keep reading width reasonable as a window expands.
- Test scene lifecycle, multiple windows and persistence independently of display geometry. Avoid global singleton UI selection shared unintentionally across windows.
- Once an actual Duo profile or device is available, repeat the flows through supported display/fold transitions and record device/runtime evidence. Only use transition APIs documented in that SDK.

For complete reusable source, search the local library for `NavigationSplitView`, `ViewThatFits`, or `Router`. Use `samples/SkillPatterns/` for tested state and routing foundations. Build against the actual SDK; availability guards cannot make an unknown symbol compile.

### Verification matrix

| Available now | What it verifies |
|---|---|
| Existing phone simulator | Baseline layouts, launch, navigation and screenshots |
| Expanded/resized window or iPad | Adaptive layout and state preservation; not Duo emulation |
| Actual Duo profile when installed | Supported simulator behaviors for that runtime |
| Physical Duo hardware | Real display transitions and hardware-dependent behavior |

## Anti-Patterns

- WRONG: claim full Duo support because the app compiled for iOS. RIGHT: report the tested device/runtime and outstanding Duo checks.
- WRONG: use a guessed fold-state API or private Simulator control. RIGHT: use documented SDK capabilities and installed tooling.
- WRONG: treat a browser screenshot viewer as touch automation. RIGHT: interact in the native Simulator and inspect the refreshed result, or run app-owned XCUITests.
