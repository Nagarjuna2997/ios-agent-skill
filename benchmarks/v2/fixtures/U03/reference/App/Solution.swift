import SwiftUI
@main struct FixtureApp:App {init(){if CommandLine.arguments.contains("--reset"){UserDefaults.standard.removeObject(forKey:"route")}};var body:some Scene {WindowGroup {Root()}}}
struct Root:View {@State var path:[Int]=[];var body:some View {NavigationStack(path:$path){Text("Home").navigationDestination(for:Int.self){id in Text("Item \(id)").accessibilityIdentifier("route")}}.onOpenURL{url in if let id=Int(url.lastPathComponent){path=[id];UserDefaults.standard.set(id,forKey:"route")}}.onAppear{if let id=UserDefaults.standard.object(forKey:"route") as? Int{path=[id]}}}}
