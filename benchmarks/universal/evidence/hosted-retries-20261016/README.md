# Hosted retries — attempt 2, 2026-10-16

Original reports, measurements, screenshots and compressed logs are retained per adapter. hashes.json hashes raw retained artifacts. These unchanged retries do not replace the prior failed-attempt evidence.

## HTML / UIKit

Run https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38871194564/attempts/2 at 6850d9baee0906c9063f093ecd4ec41c7ac83ee2; artifact 12035448250.

Two builds and 14 native tests passed: baseline three and candidate four at each of Large/XXXL. All four probe comparisons have zero mean pixel error. Nine text regions: baseline two line mismatches, candidate zero. Functionality, accessibility and clipping passed. Mean error 0.0184944511 → 0.0155992347; changed fraction 0.0704759550 → 0.0652812771.

Gate: requires-review. The hosted reference lacks matching independent approval. Local approval does not cover these iPhone 17 Pro / iOS 26.5 / Xcode 26.5 pins. Approval would still leave the original baseline failing known-good typography requirements. No baseline promotion or production integration occurred.

## React literal props

Run https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38871223367/attempts/2 at 4d64171856af038aa28607e4a9db5ecd88609ad7; artifact 12035467014.

Two builds and 12 native tests passed. All four probe comparisons have zero mean pixel error. Disclosure repair rejected: typography failed and visual metrics regressed. This establishes hosted native execution for literal props, not fidelity or expression/children/state/navigation verification. HTML/UIKit evidence is not attributed to React.

Both Actions runs correctly remain failed at their acceptance gates. Earlier audit timeout and system-overlay failures remain documented separately; no claim that they cannot recur.
