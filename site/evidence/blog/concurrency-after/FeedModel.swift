import Observation

@MainActor
@Observable
final class FeedModel {
    var title = ""
    func refresh() {
        title = "Updated"
    }
}
