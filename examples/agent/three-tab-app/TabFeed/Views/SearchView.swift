import SwiftData
import SwiftUI

struct SearchView: View {
    @Bindable var feed: FeedViewModel
    @Query(sort: \FeedCard.createdAt, order: .reverse) private var cards: [FeedCard]
    @State private var query = ""
    @State private var spacing = ScaledSpacing()

    private var results: [FeedCard] {
        CardSearch.filter(cards, query: query)
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Search")
                .background(Color(.systemGroupedBackground))
                .navigationDestination(for: FeedCard.self) { card in
                    CardDetailView(card: card, feed: feed)
                }
        }
        .searchable(text: $query, prompt: "Search titles and text")
    }

    @ViewBuilder
    private var content: some View {
        if feed.isLoading {
            ProgressView("Loading cards…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if let message = feed.errorMessage {
            ContentUnavailableView("Something went wrong", systemImage: "exclamationmark.triangle", description: Text(message))
        } else if query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            ContentUnavailableView("Search Cards", systemImage: "magnifyingglass", description: Text("Type a word to find cards by title or text."))
        } else if results.isEmpty {
            ContentUnavailableView.search(text: query)
        } else {
            ScrollView {
                LazyVStack(spacing: spacing.standard) {
                    ForEach(results) { card in
                        NavigationLink(value: card) {
                            CardView(card: card) { feed.toggleFavorite(card) }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(spacing.standard)
            }
        }
    }
}

#Preview {
    let container = PreviewSupport.container()
    SearchView(feed: PreviewSupport.feedViewModel(in: container))
        .modelContainer(container)
}
