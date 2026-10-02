import SwiftUI

struct CardView: View {
    let card: FeedCard
    let onToggleFavorite: () -> Void
    @State private var spacing = ScaledSpacing()

    var body: some View {
        VStack(alignment: .leading, spacing: spacing.compact) {
            HStack(alignment: .top, spacing: spacing.standard) {
                Image(systemName: card.imageName ?? "square.text.square")
                    .font(.title)
                    .foregroundStyle(AppColor.primary)
                    .frame(width: 44, height: 44)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 4) {
                    Text(card.title)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    if let subtitle = card.subtitle {
                        Text(subtitle)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer(minLength: 44)
            }
            Text(card.body)
                .font(.body)
                .foregroundStyle(.primary)
                .lineLimit(3)
                .multilineTextAlignment(.leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(spacing.standard)
        .background(AppColor.surface, in: .rect(cornerRadius: 16))
        .overlay(alignment: .topTrailing) {
            Button(action: onToggleFavorite) {
                Image(systemName: card.isFavorite ? "heart.fill" : "heart")
                    .foregroundStyle(card.isFavorite ? Color.red : Color.secondary)
            }
            .buttonStyle(.plain)
            .minimumTapTarget()
            .accessibilityLabel(card.isFavorite ? "Remove from favorites" : "Add to favorites")
        }
    }
}

#Preview {
    CardView(card: FeedCard.samples()[0], onToggleFavorite: {})
        .padding()
}
