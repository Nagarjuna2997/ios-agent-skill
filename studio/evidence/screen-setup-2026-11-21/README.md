# Cedar Loop screen setup

Studio built the [TrailRoutes React fixture](../../../benchmarks/universal/react-navigation/App.tsx) on an iPhone 17 simulator with iOS 27.2 and Xcode 27.2 (27B52). The revision changed “quiet woodland” to “shaded woodland”. Both builds replayed the same saved setup. XCTest tapped `screen-1-node-6`, verified that `screen-2-node-3` was hittable on the Cedar Loop screen, and attached the running app’s screenshot.

| Capture | Appearance | Dynamic Type | Orientation | App locale argument | PNG size |
| --- | --- | --- | --- | --- | --- |
| [Original](original.png) | Dark | Large | Portrait | fr-CA | 1206 × 2622 |
| [Revision](revision.png) | Dark | Large | Portrait | fr-CA | 1206 × 2622 |

Both runs restored the simulator’s original appearance and text size. The fixture contains English copy. The locale argument exercises replay of a setting without establishing a French translation.

At the comparator’s channel threshold of 8, **0.364%** of pixels changed. Mean absolute channel error was **0.001670**. Studio reported `requires-review`. This comparison includes the intentional copy edit and any system rendering differences between the captures.

| PNG | SHA-256 |
| --- | --- |
| Original | `488f9d4984413cfee815cef38c1cbd353ea43f0d03aa595919ae0d09a1c9df5b` |
| Revision | `6c7e8f95fac05d8398c5f525edabecf5b25b6a0af6cee7f52306cfdc24c628fc` |

To reproduce from the repository root with the MCP server built, run `node studio/check-screen-setup.mjs <simulator-udid> <new-evidence-directory>` on a Mac with Xcode and XcodeGen.
