import SwiftUI
@MainActor final class CounterModel:ObservableObject {@Published var count=0}
struct CounterScreen:View {
 @ObservedObject var model=CounterModel();let generation:Int
 var body:some View {VStack {Text("Count \(model.count)").accessibilityIdentifier("count");Button("Increment"){model.count+=1};NavigationLink("Detail"){Text("Details")}}}
}
@main struct FixtureApp:App {var body:some Scene {WindowGroup {Root()}}}
struct Root:View {@State var generation=0;var body:some View {NavigationStack {VStack{Button("Refresh parent"){generation+=1};CounterScreen(generation:generation)}}}}
