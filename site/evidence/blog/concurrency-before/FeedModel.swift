import Observation

@Observable
final class FeedModel {
    var title = ""
    func refresh() {
        Task.detached { self.title = "Updated" }
    }
}
