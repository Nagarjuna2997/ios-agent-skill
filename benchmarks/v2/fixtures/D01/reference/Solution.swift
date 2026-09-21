import Foundation
import SwiftData
enum V1:VersionedSchema {
 static let versionIdentifier=Schema.Version(1,0,0)
 static var models:[any PersistentModel.Type] {[Notebook.self,Note.self]}
 @Model final class Notebook {var title:String;@Relationship(deleteRule:.cascade) var notes:[Note];init(title:String,notes:[Note]=[]){self.title=title;self.notes=notes}}
 @Model final class Note {var title:String;init(title:String){self.title=title}}
}
enum V2:VersionedSchema {
 static let versionIdentifier=Schema.Version(2,0,0)
 static var models:[any PersistentModel.Type] {[Notebook.self,Note.self]}
 @Model final class Notebook {var title:String;@Relationship(deleteRule:.cascade) var notes:[Note];init(title:String,notes:[Note]=[]){self.title=title;self.notes=notes}}
 @Model final class Note {@Attribute(originalName:"title") var name:String;init(name:String){self.name=name}}
}
enum Migration:SchemaMigrationPlan {
 static var schemas:[any VersionedSchema.Type] {[V1.self,V2.self]}
 static var stages:[MigrationStage] {[.lightweight(fromVersion:V1.self,toVersion:V2.self)]}
}
@MainActor func openUpgradedStore(_ url:URL) throws -> ModelContainer {try ModelContainer(for:Schema(versionedSchema:V2.self),migrationPlan:Migration.self,configurations:[ModelConfiguration(url:url)])}
