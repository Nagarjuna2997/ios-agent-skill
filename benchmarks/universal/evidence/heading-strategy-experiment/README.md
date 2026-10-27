# Controlled heading strategy experiment — promising, not accepted

Local Xcode 27.0 (27A266a), iOS 27.0 (24A434), iPhone 18 Pro, English US, light, Large Dynamic Type. Each of three native XCTest runs passed one test. Final run captures five variants: ordinary SwiftUI, forwarding Layout proposal observer, trailing-space control, explicit UIKit/TextKit word wrapping, and the same UIKit view with passive layout recording.

SwiftUI receives 354 points and returns 224.6667 points of intrinsic text width; the forwarding observer has zero pixel impact. A trailing space has zero pixel impact and leaves the original line boundary unchanged. These controls do not establish the exact internal SwiftUI wrapping algorithm.

A generic UITextView bridge uses the supplied text, scaled size and source color, zero text-container padding, and a public paragraph lineBreakStrategy of []. At the same 354-point width it produces `A little closer to ` / `nature.` without inserting breaks or changing source words. Actual TextKit line-fragment widths and text are recorded. Measurement-on and measurement-off screenshots are byte-identical. This compares native renderers; it does not prove that one specific strategy flag alone causes the SwiftUI difference.

Against the unchanged HTML reference (Chrome 155.0.8059.82, same local environment): mean pixel error improves from 0.018485192964781638 to 0.015590419613655544; changed fraction improves from 0.07043119165668374 to 0.06523686906797063. Comparison uses the existing explicit safe-area crop (native y=186 pixels; 1206×2334 region); no resizing or new threshold. See comparison.json and reference.png.

The initial UIKit experiment mistakenly accepted its intrinsic 266-point width. The next kept 354 points but used UIColor.label instead of the inherited source color, worsening changed-pixel fraction. Those are confounded experiments, not accepted repairs; their logs and the second comparison are retained. Final code explicitly preserves proposed width and takes source color as a parameter.

NOT ACCEPTED: the production generator is unchanged. The experimental XCTest checks launch, capture and SwiftUI control boundaries; it is not the complete native interaction/accessibility/Dynamic Type suite. The UIKit observation is not integrated into the nine-region fidelity contract. Full fidelity gate, wider-string coverage, dynamic-type behavior and independent reference approval remain required. No baseline promotion, merge or publication.

Reproduce by substituting these exact view/test snapshots into the existing generated FieldNotes project and running unsigned XCTest under the pinned simulator. Export attachments, retrieve Documents/proposal.json and native-greedy.json before simulator deletion, and compare captures with the existing comparePNGs function and crop above. All listed evidence files are SHA-256 hashed.
