// swift-tools-version: 6.0
import PackageDescription
let package = Package(
    name: "BackendPatterns",
    platforms: [.macOS(.v13), .iOS(.v16)],
    products: [.library(name: "BackendPatterns", targets: ["BackendPatterns"])],
    targets: [.target(name: "BackendPatterns"), .testTarget(name: "BackendPatternsTests", dependencies: ["BackendPatterns"])]
)
