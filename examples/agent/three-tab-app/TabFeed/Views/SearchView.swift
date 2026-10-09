import SwiftData
import SwiftUI

/// Search layout: search field, suggestion chips, a browse list, and compact result rows.
struct SearchView: View {
    @Bindable var feed: FeedViewModel
    @Query(sort: \FeedCard.createdAt, order: .reverse) private var cards: [FeedCard]
    @State private var query = ""
    private let spacing = ScaledSpacing()

    private var trimmedQuery: String {
        query.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var results: [FeedCard] {
        CardSearch.filter(cards, query: query)
    }

    private var resultsTitle: String {
        results.count == 1 ? "1 result" : "\(results.count) results"
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Search")
                .background(Color(.systemGroupedBackground))
                .searchable(text: $query, prompt: "Search titles and text")
                .navigationDestination(for: FeedCard.self) { card in
                    CardDetailView(card: card, feed: feed)
                }
        }
        .fontDesign(AppTheme.fontDesign)
    }

    @ViewBuilder
    private var content: some View {
        if feed.isLoading {
            FeedLoadingView()
        } else if let message = feed.errorMessage {
            AppErrorStateView(title: "Something went wrong", message: message) {
                feed.start()
            }
        } else if trimmedQuery.isEmpty {
            browse
        } else if results.isEmpty {
            AppEmptyStateView(
                title: "No matches",
                message: "Nothing matches “\(trimmedQuery)”. Try another word from a title or body.",
                symbol: "magnifyingglass",
                actionTitle: "Clear Search"
            ) {
                query = ""
            }
        } else {
            resultsList
        }
    }

    private var browse: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: spacing.roomy) {
                HeroHeader(
                    title: "Find a card",
                    subtitle: "Search titles and text, or start from a suggestion.",
                    symbol: "magnifyingglass"
                )
                VStack(alignment: .leading, spacing: spacing.compact) {
                    AppSectionHeader(title: "Try searching for")
                        .accessibilityAddTraits(.isHeader)
                    suggestionChips
                }
                if cards.isEmpty {
                    AppEmptyStateView(
                        title: "Nothing to search yet",
                        message: "Cards you add will show up here.",
                        symbol: "rectangle.stack"
                    )
                } else {
                    AppSectionHeader(title: "Browse all \(cards.count) cards")
                        .accessibilityAddTraits(.isHeader)
                    ForEach(cards) { card in
                        NavigationLink(value: card) {
                            SearchResultRow(card: card)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(AppTheme.screenInset)
        }
    }

    private var suggestionChips: some View {
        ScrollView(.horizontal) {
            HStack(spacing: spacing.compact) {
                ForEach(CardSearch.suggestions, id: \.self) { suggestion in
                    Button {
                        query = suggestion
                    } label: {
                        AppChip(title: suggestion)
                    }
                    .buttonStyle(.plain)
                    .minimumTapTarget()
                    .accessibilityLabel("Search for \(suggestion)")
                }
            }
        }
        .scrollIndicators(.hidden)
    }

    private var resultsList: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: spacing.standard) {
                AppSectionHeader(title: resultsTitle)
                    .accessibilityAddTraits(.isHeader)
                ForEach(results) { card in
                    NavigationLink(value: card) {
                        SearchResultRow(card: card)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(AppTheme.screenInset)
        }
    }
}

/// A compact row used for browse and result lists.
struct SearchResultRow: View {
    let card: FeedCard
    private let spacing = ScaledSpacing()

    var body: some View {
        AppCard {
            HStack(alignment: .top, spacing: spacing.standard) {
                AppIconTile(symbol: card.imageName ?? "text.alignleft")
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                    Text(card.title)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    if let subtitle = card.subtitle {
                        Text(subtitle)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(AppColor.primary)
                    }
                    Text(card.body)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                Spacer(minLength: AppTheme.Space.small)
                if card.isFavorite {
                    Image(systemName: "heart.fill")
                        .font(.subheadline)
                        .foregroundStyle(.red)
                        .accessibilityLabel("Favorite")
                }
                Image(systemName: "chevron.right")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.tertiary)
                    .accessibilityHidden(true)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    let container = PreviewSupport.seededContainer()
    SearchView(feed: PreviewSupport.feedViewModel(in: container))
        .modelContainer(container)
}
