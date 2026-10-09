import SwiftData
import SwiftUI

/// Feed layout: hero, quick stats, filter chips and a scrolling column of cards.
struct HomeView: View {
    @Bindable var feed: FeedViewModel
    @Query(sort: \FeedCard.createdAt, order: .reverse) private var cards: [FeedCard]
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    private let spacing = ScaledSpacing()

    private var visibleCards: [FeedCard] { feed.visibleCards(cards) }

    private var favoriteCount: Int { cards.filter(\.isFavorite).count }

    private var thisWeekCount: Int {
        let cutoff = Calendar.current.date(byAdding: .day, value: -7, to: .now) ?? .now
        return cards.filter { $0.createdAt >= cutoff }.count
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Home")
                .navigationBarTitleDisplayMode(.inline)
                .background(Color(.systemGroupedBackground))
                .navigationDestination(for: FeedCard.self) { card in
                    CardDetailView(card: card, feed: feed)
                }
        }
        .fontDesign(AppTheme.fontDesign)
        .task { feed.start() }
    }

    @ViewBuilder
    private var content: some View {
        if feed.isLoading {
            FeedLoadingView()
        } else if let message = feed.errorMessage {
            AppErrorStateView(title: "Something went wrong", message: message) {
                feed.start()
            }
        } else if cards.isEmpty {
            AppEmptyStateView(
                title: "No cards yet",
                message: "Cards you add will appear here, ready to read and favorite.",
                symbol: "rectangle.stack"
            )
        } else {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: spacing.roomy) {
                    HeroHeader(
                        title: "Your feed",
                        subtitle: "\(cards.count) cards saved on this device. Tap one to read it in full.",
                        symbol: "sparkles"
                    )
                    statsRow
                    filterChips
                    AppSectionHeader(title: feed.filter == .favorites ? "Favorites" : "Latest")
                        .accessibilityAddTraits(.isHeader)
                    if visibleCards.isEmpty {
                        AppEmptyStateView(
                            title: "No favorites yet",
                            message: "Tap the heart on a card to keep it here.",
                            symbol: "heart"
                        )
                    } else {
                        ForEach(visibleCards) { card in
                            NavigationLink(value: card) {
                                CardView(card: card) { feed.toggleFavorite(card) }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(AppTheme.screenInset)
            }
        }
    }

    private var statsLayout: AnyLayout {
        dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(spacing: spacing.compact))
            : AnyLayout(HStackLayout(spacing: spacing.compact))
    }

    private var statsRow: some View {
        statsLayout {
            AppStatTile(title: "Cards", value: cards.count.formatted(), symbol: "rectangle.stack.fill")
            AppStatTile(title: "Favorites", value: favoriteCount.formatted(), symbol: "heart.fill")
            AppStatTile(title: "This week", value: thisWeekCount.formatted(), symbol: "calendar")
        }
    }

    private var filterChips: some View {
        HStack(spacing: spacing.compact) {
            ForEach(FeedFilter.allCases) { filter in
                Button {
                    feed.filter = filter
                } label: {
                    AppChip(title: filter.title, selected: feed.filter == filter)
                }
                .buttonStyle(.plain)
                .minimumTapTarget()
            }
            Spacer(minLength: 0)
        }
        .motionAwareAnimation(.snappy(duration: AppTheme.motionDuration), value: feed.filter)
    }
}

/// Placeholder blocks shown while the store is being prepared.
struct FeedLoadingView: View {
    private let spacing = ScaledSpacing()

    var body: some View {
        VStack(alignment: .leading, spacing: spacing.standard) {
            SkeletonBlock(height: 36)
            SkeletonBlock(height: 20)
            SkeletonBlock(height: 96)
            SkeletonBlock(height: 200)
            SkeletonBlock(height: 200)
            Spacer(minLength: 0)
        }
        .padding(AppTheme.screenInset)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Loading cards")
    }
}

#Preview("Populated") {
    let container = PreviewSupport.seededContainer()
    HomeView(feed: PreviewSupport.feedViewModel(in: container))
        .modelContainer(container)
}

#Preview("Loading") {
    FeedLoadingView()
        .background(Color(.systemGroupedBackground))
}
