# Responsive chip row

Five text chips share a row with an 8-point gap. Each wraps to the next line
when its intrinsic width exceeds the remaining space. The fixture uses React,
and the portable tests compare generated Swift for HTML, React, Vue and Svelte.

From the repository root, build the MCP server and run the native fixture on
a Mac with the profile's Xcode, runtime and device type installed.

```sh
npm run build --prefix mcp-server
node benchmarks/universal/wrapping-row/run.mjs benchmarks/universal/native-behavior/ios-27.2.json /tmp/new-row-evidence
```

At Large and XXXL the native test checks screen bounds, spacing, accessibility
tree order, portrait text clipping and fewer lines after rotation. It saves
portrait and landscape screenshots in the result attachments. The test measures
native behavior and does not assign an HTML-to-SwiftUI similarity score.

## Recorded native result

On November 21, 2026, Xcode 27.2 (27B52) built the generated project for an
iPhone 18 Pro running iOS 27.2 (24B8117). The final serial run passed 1/1
XCTest at Large and 1/1 at XXXL with zero failures or skips. Both size cells
exported and verified two PNGs with the expected orientation and test identity.
A previous concurrent run passed at Large but encountered a launch timeout at
XXXL and was interrupted before verifying layout there.

| Dynamic Type | Portrait | Landscape | XCTest |
| --- | --- | --- | --- |
| Large | [Screenshot](../evidence/wrapping-row-20261121/large-portrait-tags.png) | [Screenshot](../evidence/wrapping-row-20261121/large-landscape-tags.png) | [Summary](../evidence/wrapping-row-20261121/large-summary.json) |
| XXXL | [Screenshot](../evidence/wrapping-row-20261121/xxxl-portrait-tags.png) | [Screenshot](../evidence/wrapping-row-20261121/xxxl-landscape-tags.png) | [Summary](../evidence/wrapping-row-20261121/xxxl-summary.json) |

[Source and capture hashes](../evidence/wrapping-row-20261121/result.json)
