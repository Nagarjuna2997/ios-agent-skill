import Foundation
import SwiftData
@main struct Check {
 @MainActor static func main() throws {
 let url=URL(fileURLWithPath:CommandLine.arguments[1])

 let store=try openUpgradedStore(url);let c=ModelContext(store);let books=try c.fetch(FetchDescriptor<V2.Notebook>());let notes=try c.fetch(FetchDescriptor<V2.Note>());guard books.count==1,books[0].title=="Offline",books[0].notes.count==2,notes.map({$0.name}).sorted()==["First","Second"] else {print("CONTRACT: migration lost values or relationships");exit(1)}
 }
}
