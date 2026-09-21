import Foundation
actor Repository {
 private var values:[String]=[]
 func insert(_ id:String, checkpoint:@Sendable () async -> Void) async { if !values.contains(id) { await checkpoint(); if !values.contains(id) { values.append(id) } } }
 func all() -> [String] { values }
}
