import Foundation
func require(_ condition: Bool, _ message: String) { if !condition { print("CONTRACT: "+message); exit(1) } }
@main struct Check { @MainActor static func main() { let m=SearchModel(); let a=m.begin("old"),b=m.begin("new"); m.complete(b,values:["new result"]); m.complete(a,values:["stale"]); require(m.results == ["new result"],"stale completion overwrote newer result"); let c=m.begin("empty"); m.complete(c,values:[]); require(m.results.isEmpty,"empty result must clear state") } }
