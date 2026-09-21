import Foundation
func require(_ condition: Bool, _ message: String) { if !condition { print("CONTRACT: "+message); exit(1) } }
@main struct Check {@MainActor static func main(){for initial in [[],[1,2,3]] {let c=Catalog();var calls=0;func load()->[Int]{calls+=1;return initial};for _ in 0..<10{c.appear(load:load)};require(calls == 1 && c.items == initial,"navigation work budget");c.refresh{calls+=1;return [9]};c.appear(load:load);require(calls == 2 && c.items == [9],"explicit refresh budget")}}}
