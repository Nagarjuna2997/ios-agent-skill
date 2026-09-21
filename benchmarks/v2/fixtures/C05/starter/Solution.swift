import Foundation
actor Worker {
 private(set) var mutations=0; private(set) var cleaned=false
 func run(gate: @Sendable () async -> Void) async {
  await gate()
  mutations += 1
 }
}
