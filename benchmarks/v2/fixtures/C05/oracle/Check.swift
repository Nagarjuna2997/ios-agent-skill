import Foundation
func require(_ condition: Bool, _ message: String) { if !condition { print("CONTRACT: "+message); exit(1) } }
actor Gate { var entered=false; var c:CheckedContinuation<Void,Never>?; func wait() async { entered=true; await withCheckedContinuation { c=$0 } }; func release() { c?.resume(); c=nil } }
@main struct Check { static func main() async { let w=Worker(),g=Gate(); let t=Task { await w.run { await g.wait() } }; while !(await g.entered) { await Task.yield() }; t.cancel(); await g.release(); await t.value; let count=await w.mutations,clean=await w.cleaned; require(count == 0 && clean,"cancel must cleanup without mutation"); let normal=Worker(); await normal.run {}; let n=await normal.mutations,c=await normal.cleaned; require(n == 1 && c,"normal path") } }
