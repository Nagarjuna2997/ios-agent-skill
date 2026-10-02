import SwiftData
import SwiftUI

struct HomeView: View {
    @Bindable var feed: FeedViewModel
    @Query(sort: \FeedCard.createdAt, order: .reverse) private var cards: [FeedCard]
    @State private var spacing = ScaledSpacing()

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Home")
                .background(Color(.systemGroupedBackground))
        }
        .task { feed.start() }
    }

    @ViewBuilder
    private var content: some View {
        if feed.isLoading {
            ProgressView("Loading cards…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if let message = feed.errorMessage {
            ContentUnavailableView {
                Label("Something went wrong", systemImage: "exclamationmark.triangle")
            } description: {
                Text(message)
            } actions: {
                Button("Try Again") { feed.start() }
                    .buttonStyle(.borderedProminent)
            }
        } else if cards.isEmpty {
            ContentUnavailableView("No Cards Yet", systemImage: "rectangle.stack", description: Text("Cards you add will appear here."))
        } else {
            ScrollView {
                LazyVStack(spacing: spacing.standard) {
                    ForEach(cards) { card in
                        NavigationLink(value: card) {
                            CardView(card: card) { feed.toggleFavorite(card) }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(spacing.standard)
            }
            .navigationDestination(for: FeedCard.self) { card in
                CardDetailView(card: card, feed: feed)
            }
        }
    }
}

#Preview {
    let container = PreviewSupport.container()
    HomeView(feed: PreviewSupport.feedViewModel(in: container))
        .modelContainer(container)
}
