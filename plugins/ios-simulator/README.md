# iOS Simulator pane

An iOS Simulator panel that stays beside the chat while you work, instead of
living in a separate window you have to go and find.

It opens in two states, and which one you get is decided by the host, not by a
setting:

**Setup not finished** — a three-step checklist mirroring the Simulator's own
setup screen: *Xcode installed*, *Select Xcode*, *Install Simulator*. Each row
reports what was actually found and the exact command that fixes it. The
distinction that matters is the second step: command-line tools selected
instead of Xcode is a different problem from no Xcode, and it has a different
fix (`sudo xcode-select -s /Applications/Xcode.app`). That one needs a password
and a terminal, so the pane shows the command rather than pretending it can run
it for you.

**Ready** — a device picker (booted device first, because that is the one you
mean by "the simulator"), the device's screen, and a row of actions:

| Action | What it runs |
|---|---|
| Boot / Shutdown | `xcrun simctl boot` / `shutdown` |
| Reload | screenshot, downscale, redraw |
| Record / Stop | `xcrun simctl io <udid> recordVideo` |
| Guides | safe-area and centre guides drawn over the screenshot |
| Dark/Light | `xcrun simctl ui <udid> appearance` |
| Commands | prints the simctl commands for the selected device |

## Requirements

macOS with Xcode and at least one iOS runtime. On any other platform the pane
says so in the first checklist row rather than failing silently — which is what
it does in a Linux cloud container, by design.

## Notes on how it behaves

**The screen is on demand, not a video feed.** Reload takes one screenshot.
Polling `simctl` on a timer costs CPU on both sides and makes the simulator
stutter, which is worse than pressing a button.

**The screenshot is downscaled to 320px and encoded as JPEG** before it is
drawn. `Svg.source` is capped at 131072 characters and a full-resolution iPhone
PNG is an order of magnitude past it. The size is checked before drawing,
because an oversized source is refused by the surface and draws *nothing* — a
blank pane with no error is the worst failure available here.

**The terminal surface gets the actions without the picture.** `Svg` exists on
desktop, VS Code and mobile; the terminal has `Image` instead. Rather than
mount a tree that surface refuses, the pane says so and keeps every button
working. A test covers this.

**Guides are drawn, not captured.** The overlay is SVG over the screenshot, so
toggling it costs nothing and never touches the device.

## Install

```
/plugin install ios-simulator --marketplace Nagarjuna2997/ios-agent-skill
```

Then `/ios-simulator` opens the pane; it also opens itself at session start.

## Developing on it

```
claude plugin validate plugins/ios-simulator
claude plugin test     plugins/ios-simulator
```
