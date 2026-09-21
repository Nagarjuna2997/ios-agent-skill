import SwiftUI
@main struct FixtureApp:App {var body:some Scene {WindowGroup {Root()}}}
struct Root:View {var body:some View {VStack {if #available(iOS 17.0, *),ProcessInfo.processInfo.environment["FORCE_LEGACY"] != "1" {Image(systemName:"star").symbolEffect(.pulse);Text("Animated").accessibilityIdentifier("mode")}else {Image(systemName:"star");Text("Static").accessibilityIdentifier("mode")}}}}
