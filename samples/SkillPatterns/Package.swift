// swift-tools-version: 5.9
import PackageDescription

// SkillPatterns — a compile-checked reference implementation of this skill's
// core patterns.
//
// Purpose: every Swift snippet in docs/ is prose. This package is the subset
// that actually builds, so CI can prove the patterns compile rather than
// asserting they do. See docs/orchestration/verification.md.
//
// Deliberately scoped to STABLE APIs (iOS 17 / macOS 14) so it builds on
// standard CI runners. Beta-SDK features — Liquid Glass, Foundation Models —
// are documented but not compile-checked here, which is why those doc sections
// carry a verification note.
let package = Package(
    name: "SkillPatterns",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .watchOS(.v10),
        .tvOS(.v17),
        .visionOS(.v1)
    ],
    products: [
        .library(name: "SkillPatterns", targets: ["SkillPatterns"])
    ],
    targets: [
        .target(
            name: "SkillPatterns",
            swiftSettings: [
                // The patterns must hold under strict concurrency — that is
                // most of what this package exists to prove.
                .enableUpcomingFeature("StrictConcurrency")
            ]
        ),
        .testTarget(
            name: "SkillPatternsTests",
            dependencies: ["SkillPatterns"]
        )
    ]
)
