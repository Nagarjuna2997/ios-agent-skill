import Foundation
func require(_ condition: Bool, _ message: String) { if !condition { print("CONTRACT: "+message); exit(1) } }
@main struct Check { static func main() async { let a=Accumulator(); await withTaskGroup(of: Void.self) { g in for n in 1...100 { g.addTask { await transfer(a,n) } } }; let n=await a.result(); require(n == 5050,"concurrent payload ownership") } }
