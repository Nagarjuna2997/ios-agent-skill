import Foundation
enum Outcome: Sendable { case success, failure, cancelled }
enum RequestError: Error { case failed }
func request(_ outcome: Outcome) async throws -> Int {
 try await withCheckedThrowingContinuation { c in
  switch outcome { case .success: c.resume(returning: 7); c.resume(returning: 9)
  case .failure: c.resume(throwing: RequestError.failed)
  case .cancelled: break }
 }
}
