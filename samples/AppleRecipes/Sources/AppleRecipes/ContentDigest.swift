import CryptoKit
import Foundation

/// Content identity and corruption checks. This is not password hashing or authentication.
public enum ContentDigest {
    public static func sha256(_ data: Data) -> String {
        SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }
}
