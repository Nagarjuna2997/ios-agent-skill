import Foundation
enum Outcome: Sendable { case success, failure, cancelled }
enum RequestError: Error { case failed }
func request(_ outcome: Outcome) async throws -> Int {
 try Task.checkCancellation()
 return try await withCheckedThrowingContinuation { c in
  switch outcome { case .success: c.resume(returning: 7)
  case .failure: c.resume(throwing: RequestError.failed)
  case .cancelled: c.resume(throwing: CancellationError()) }
 }
}
