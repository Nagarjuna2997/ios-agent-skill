import Foundation
import SwiftData
@Model final class Folder {var name:String;@Relationship(deleteRule:.nullify) var notes:[Note];init(name:String,notes:[Note]=[]){self.name=name;self.notes=notes}}
@Model final class Note {var text:String;init(text:String){self.text=text}}
@MainActor func deleteFolder(_ folder:Folder, in context:ModelContext) throws {context.delete(folder);try context.save()}
