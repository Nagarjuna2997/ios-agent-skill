import Foundation
@MainActor final class Catalog {
 private(set) var items:[Int]=[];private var loaded=false
 func appear(load:()->[Int]) { if !loaded { items=load();loaded=true } }
 func refresh(load:()->[Int]) { items=load();loaded=true }
}
