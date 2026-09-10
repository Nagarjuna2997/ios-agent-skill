// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "AppleRecipes",
    platforms: [.macOS(.v13), .iOS(.v16)],
    products: [.library(name: "AppleRecipes", targets: ["AppleRecipes"])],
    targets: [.target(name: "AppleRecipes"), .testTarget(name: "AppleRecipesTests", dependencies: ["AppleRecipes"])]
)
