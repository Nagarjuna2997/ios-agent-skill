// swift-tools-version: 6.0
import PackageDescription
let package=Package(name:"Fixture",platforms:[.macOS(.v13)],dependencies:[.package(path:"Vendor/LocalMath")],targets:[.target(name:"Fixture",dependencies:[.product(name:"LocalMath",package:"LocalMath")]),.testTarget(name:"FixtureTests",dependencies:["Fixture"])])
