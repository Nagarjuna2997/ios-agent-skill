import Foundation

/// Destinations pushed on the single navigation stack.
enum Route: Hashable {
    case detail(UUID)
    case compose(UUID?)
}
