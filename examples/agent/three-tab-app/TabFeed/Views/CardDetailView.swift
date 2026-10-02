import SwiftUI

struct CardDetailView: View {
    let card: FeedCard
    let feed: FeedViewModel
    @State private var spacing = ScaledSpacing()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing.standard) {
                Image(systemName: card.imageName ?? "square.text.square")
                    .font(.system(size: 56))
                    .foregroundStyle(AppColor.onPrimary)
                    .frame(maxWidth: .infinity, minHeight: 140)
                    .background(AppColor.primary, in: .rect(cornerRadius: 20))
                    .accessibilityHidden(true)
                Text(card.title)
                    .font(.title.bold())
                    .accessibilityAddTraits(.isHeader)
                if let subtitle = card.subtitle {
                    Text(subtitle)
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }
                Text(card.createdAt, format: .dateTime.day().month().year())
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text(card.body)
                    .font(.body)
            }
            .padding(spacing.standard)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .navigationTitle("Card")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                Button {
                    feed.toggleFavorite(card)
                } label: {
                    Image(systemName: card.isFavorite ? "heart.fill" : "heart")
                }
                .accessibilityLabel(card.isFavorite ? "Remove from favorites" : "Add to favorites")
                ShareItemButton(item: SharedItem(title: card.title, text: "\(card.title)\n\n\(card.body)", url: nil))
                    .labelStyle(.iconOnly)
            }
        }
    }
}

#Preview {
    let container = PreviewSupport.container()
    NavigationStack {
        CardDetailView(card: FeedCard.samples()[0], feed: PreviewSupport.feedViewModel(in: container))
    }
    .modelContainer(container)
}
