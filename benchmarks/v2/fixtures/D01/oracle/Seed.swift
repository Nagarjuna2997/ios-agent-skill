import Foundation
import SwiftData
enum V1:VersionedSchema {
 static let versionIdentifier=Schema.Version(1,0,0)
 static var models:[any PersistentModel.Type] {[Notebook.self,Note.self]}
 @Model final class Notebook {var title:String;@Relationship(deleteRule:.cascade) var notes:[Note];init(title:String,notes:[Note]=[]){self.title=title;self.notes=notes}}
 @Model final class Note {var title:String;init(title:String){self.title=title}}
}

@main struct Seed {@MainActor static func main() throws {let url=URL(fileURLWithPath:CommandLine.arguments[1]);let store=try ModelContainer(for:Schema(versionedSchema:V1.self),configurations:[ModelConfiguration(url:url)]);let c=ModelContext(store);c.insert(V1.Notebook(title:"Offline",notes:[V1.Note(title:"First"),V1.Note(title:"Second")]));try c.save()}}
