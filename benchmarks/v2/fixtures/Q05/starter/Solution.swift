import Foundation
@MainActor final class Catalog {
 private(set) var items:[Int]=[]
 func appear(load:()->[Int]) { items=load() }
 func refresh(load:()->[Int]) { items=load() }
}
