# Actual SwiftUI heading fragments — diagnostic only

Local Xcode 27.0 (27A266a), iOS 27.0, iPhone 18 Pro; English US, light appearance, Large Dynamic Type. One XCTest passed and all nine text regions reported word boundaries. This is not a complete fidelity run or an accessibility audit.

`Text.LayoutKey` supplies actual line/run typographic bounds. Word attributes map runs to identical source words; index -1 marks spaces. No custom drawing is installed. Normal and diagnostic screenshots are byte-identical, with zero decoded channel error. Source, native logs, browser DOM ranges, captures and hashes are preserved.

Native line 1 is 224.384765625 points including a trailing space of 7.48828125. Its meaningful words occupy 216.896484375. The actual second-line `to` run is 33.8818359375 points. Summing actual fragments for `A little closer to` gives 258.2666015625 points, versus browser canvas advance 258.328125. The preceding parent diagnostic measured 354 available points. The text is not truncated.

Thus the observed word widths do not explain the early break. A different wrapping policy is strongly indicated; its exact rule and any public SwiftUI correction remain unproven. Summing fragments from separate lines is not an independent single-line shaping test, and font identity is not exposed by this observation. No private APIs, inserted breaks, font changes, or threshold changes were used.

Reproduce with the same generated FieldNotes project and simulator configuration as the adjacent heading-parent-diagnostic: substitute these view/test snapshots, run unsigned XCTest, export xcresult attachments, and retrieve Documents/heading-fragments.json before deleting the test simulator. Browser ranges use the unchanged html-disclosure fixture at 402 × 874, scale 3, Chrome 155.0.8059.82. Coordinates are renderer-local; compare widths and line grouping, not unnormalized origins.

No generator modification, repair candidate, known-good approval, or fidelity improvement is claimed. A full repair gate was not rerun because this change measures existing rendering only.
