import SwiftData
import SwiftUI

/// Detail layout: full-width illustration, title block, body card, details card and actions.
struct CardDetailView: View {
    let card: FeedCard
    let feed: FeedViewModel
    private let spacing = ScaledSpacing()

    private var sharedItem: SharedItem {
        SharedItem(title: card.title, text: "\(card.title)\n\n\(card.body)", url: nil)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing.roomy) {
                ThumbnailPlaceholder(symbol: card.imageName ?? "text.alignleft", title: "Illustration for \(card.title)")
                    .frame(height: 220)
                VStack(alignment: .leading, spacing: spacing.compact) {
                    if let subtitle = card.subtitle {
                        AppChip(title: subtitle)
                    }
                    Text(card.title)
                        .font(.largeTitle.weight(.bold))
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityAddTraits(.isHeader)
                    Label {
                        Text(card.createdAt, format: .dateTime.weekday(.wide).day().month().year())
                    } icon: {
                        Image(systemName: "calendar")
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
                AppCard {
                    Text(card.body)
                        .font(.body)
                        .fixedSize(horizontal: false, vertical: true)
                }
                AppSectionHeader(title: "Details")
                    .accessibilityAddTraits(.isHeader)
                AppCard {
                    VStack(alignment: .leading, spacing: spacing.compact) {
                        detailRow("Created", card.createdAt.formatted(date: .long, time: .shortened))
                        Divider()
                        detailRow("Favorite", card.isFavorite ? "Yes" : "No")
                        Divider()
                        detailRow("Stored", "On this device")
                    }
                }
                Button {
                    feed.toggleFavorite(card)
                } label: {
                    Label(
                        card.isFavorite ? "Remove from Favorites" : "Add to Favorites",
                        systemImage: card.isFavorite ? "heart.fill" : "heart"
                    )
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(AppPrimaryButtonStyle())
                .motionAwareAnimation(.snappy(duration: AppTheme.motionDuration), value: card.isFavorite)
            }
            .padding(AppTheme.screenInset)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Card")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                ShareItemButton(item: sharedItem)
                    .labelStyle(.iconOnly)
                    .accessibilityLabel("Share card")
            }
        }
        .fontDesign(AppTheme.fontDesign)
    }

    private func detailRow(_ title: String, _ value: String) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .foregroundStyle(.secondary)
            Spacer(minLength: AppTheme.Space.small)
            Text(value)
                .fontWeight(.medium)
                .multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    let container = PreviewSupport.seededContainer()
    NavigationStack {
        CardDetailView(card: PreviewSupport.firstCard(in: container), feed: PreviewSupport.feedViewModel(in: container))
    }
    .modelContainer(container)
    .fontDesign(AppTheme.fontDesign)
}
