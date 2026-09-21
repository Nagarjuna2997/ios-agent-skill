import SwiftUI
@main struct FixtureApp:App {var body:some Scene {WindowGroup {Root()}}}
struct Root:View {var body:some View {VStack {Image(systemName:"star").symbolEffect(.pulse);Text("Animated").accessibilityIdentifier("mode")}}}
