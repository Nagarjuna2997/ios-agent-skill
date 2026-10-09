import SwiftUI

/// One feed card: illustration, label chip, title, excerpt, date and a favorite toggle.
struct CardView: View {
    let card: FeedCard
    let onToggleFavorite: () -> Void
    private let spacing = ScaledSpacing()

    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: spacing.compact) {
                ThumbnailPlaceholder(symbol: card.imageName ?? "text.alignleft", title: "Illustration for \(card.title)")
                    .frame(height: 132)
                if let subtitle = card.subtitle {
                    AppChip(title: subtitle)
                        .padding(.top, AppTheme.Space.xSmall)
                }
                Text(card.title)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
                Text(card.body)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
                HStack(alignment: .center) {
                    Label {
                        Text(card.createdAt, format: .dateTime.day().month())
                    } icon: {
                        Image(systemName: "calendar")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    Spacer(minLength: AppTheme.Space.small)
                    Button(action: onToggleFavorite) {
                        Image(systemName: card.isFavorite ? "heart.fill" : "heart")
                            .font(.title3)
                            .foregroundStyle(card.isFavorite ? Color.red : Color.secondary)
                    }
                    .buttonStyle(.plain)
                    .minimumTapTarget()
                    .accessibilityLabel(card.isFavorite ? "Remove from favorites" : "Add to favorites")
                    .motionAwareAnimation(.snappy(duration: AppTheme.motionDuration), value: card.isFavorite)
                }
            }
        }
    }
}

#Preview {
    ScrollView {
        VStack(spacing: AppTheme.Space.large) {
            CardView(card: SampleData.feedCards[0], onToggleFavorite: {})
            CardView(card: SampleData.feedCards[1], onToggleFavorite: {})
        }
        .padding(AppTheme.screenInset)
    }
    .background(Color(.systemGroupedBackground))
}
