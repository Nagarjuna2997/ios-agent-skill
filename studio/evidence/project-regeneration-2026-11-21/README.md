# ReadingShelf project regeneration

Studio regenerated the [ReadingShelf React fixture](../../../benchmarks/universal/reading-list/App.tsx) after its second book’s author changed from “Jon Lake” to “Jon Lake, revised”. The developer’s project had a Notes toolbar and sheet, a `ReaderInk` named color and a new Swift file added to the Xcode target. The review merged disjoint edits to `RootView.swift`, retained the local resource and Xcode membership, and discarded stale mappings for the edited Swift file. The approved result was written into a third Studio project. The original developer copy retained its previous contents.

The merged project built and launched on an iPhone 17 simulator with iOS 27.2 and Xcode 27.2 (27B52). Both captures are 1206 × 2622. Studio replayed the saved portrait, en-US, light appearance and Large text setup and restored the simulator settings. Both books are titled “Cedar”. The tests selected the second record using its stable key.

| Native capture | What the passing XCTest exercised |
| --- | --- |
| [Second book](second-book.png) | Tapped `screen-1-node-4-cedar-b` and required the unique, hittable detail field `screen-2-node-5`. The capture shows “Jon Lake, revised” and the developer’s Notes button. |
| [Notes sheet](user-toolbar.png) | Relaunched the merged app, opened the same book, tapped the developer’s `reader-notes` toolbar button and located the unique, hittable `reader-notes-title`. The capture shows “My reading notes”. |

The [receipt](result.json) records the per-file review decisions and capture hashes. Studio bound the first capture to the merged project tree SHA-256 `1547abc45b0e992939569ed9b52a967308782dd86fb30a096b9658545610e395`. Each capture required one passing XCTest with zero skipped or failed tests. These results cover this simulator and this fixture.

To repeat on a Mac with Xcode, XcodeGen and the MCP server built, run the following command from the repository root. Supply an available simulator and a new evidence directory.

```sh
node studio/check-project-regeneration.mjs SIMULATOR_UDID NEW_EVIDENCE_DIRECTORY
```
