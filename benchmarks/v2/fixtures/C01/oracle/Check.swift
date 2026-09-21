import Foundation
func require(_ condition: Bool, _ message: String) { if !condition { print("CONTRACT: "+message); exit(1) } }
@main struct Check { @MainActor static func main() async { let m=ScreenModel(); for _ in 0..<31 { await increment(m) }; require(m.count == 31,"all main-actor transitions retained") } }
