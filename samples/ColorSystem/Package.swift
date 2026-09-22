// swift-tools-version: 6.0
import PackageDescription
let package = Package(name: "ColorSystem", platforms: [.macOS(.v13), .iOS(.v17)], products: [.library(name: "ColorSystem", targets: ["ColorSystem"])], targets: [.target(name: "ColorSystem", resources: [.copy("palette.json")]), .testTarget(name: "ColorSystemTests", dependencies: ["ColorSystem"])])
