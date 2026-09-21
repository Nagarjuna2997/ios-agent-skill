import SwiftUI
@main struct FixtureApp:App {var body:some Scene {WindowGroup {Root()}}}
struct Root:View {@State var saved=false;var body:some View {VStack {Button{saved=true}label:{Image(systemName:"square.and.arrow.down")}.accessibilityIdentifier("save").accessibilityLabel("");Text(saved ? "Saved" : "Empty").accessibilityIdentifier("status")}}}
