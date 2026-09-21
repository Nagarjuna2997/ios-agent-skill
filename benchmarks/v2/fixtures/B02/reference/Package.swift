// swift-tools-version: 6.0
import PackageDescription
let package=Package(name:"Fixture",platforms:[.macOS(.v13)],products:[.library(name:"Fixture",targets:["Fixture"])],targets:[.target(name:"Fixture",resources:[.process("Resources")]),.testTarget(name:"FixtureTests",dependencies:["Fixture"])])
