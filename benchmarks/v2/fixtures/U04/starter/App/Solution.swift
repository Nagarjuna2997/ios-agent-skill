import SwiftUI
struct Row:Identifiable {let key:Int;let title:String;var id:Int {0}}
@main struct FixtureApp:App {var body:some Scene {WindowGroup {Root()}}}
struct Root:View {@State var rows=[Row(key:1,title:"Alpha"),Row(key:2,title:"Beta")];@State var selected="None";var body:some View {VStack{Text(selected).accessibilityIdentifier("selection");ForEach(rows){row in Button(row.title){selected=rows.first(where:{$0.id==row.id})?.title ?? "None"}};Button("Reverse"){rows.reverse()}}}}
