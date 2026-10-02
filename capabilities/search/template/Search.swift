import SwiftUI

extension String {
    /// True when every word of `query` appears in the string, ignoring case and diacritics.
    /// An empty query matches everything.
    func matchesSearch(_ query: String) -> Bool {
        let words = query.split(whereSeparator: \.isWhitespace)
        return words.allSatisfy { localizedStandardContains($0) }
    }
}

/// The system empty state for a search with no results.
struct SearchNoResultsView: View {
    let query: String

    var body: some View {
        ContentUnavailableView.search(text: query)
    }
}

#Preview {
    SearchNoResultsView(query: "pasta")
}
