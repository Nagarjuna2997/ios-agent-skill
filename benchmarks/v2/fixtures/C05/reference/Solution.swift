import Foundation
actor Worker {
 private(set) var mutations=0; private(set) var cleaned=false
 func run(gate: @Sendable () async -> Void) async {
  defer { cleaned=true }
  await gate()
  guard !Task.isCancelled else { return }
  mutations += 1
 }
}
