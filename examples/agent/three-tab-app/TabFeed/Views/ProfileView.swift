import SwiftData
import SwiftUI

/// Profile layout: avatar header, activity stats, appearance preference and a privacy note.
/// Editing happens in `EditProfileSheet`, a data-entry form.
struct ProfileView: View {
    @Bindable var model: ProfileViewModel
    @Query private var cards: [FeedCard]
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    private let spacing = ScaledSpacing()

    private var favoriteCount: Int { cards.filter(\.isFavorite).count }

    private var favoriteRatio: Double {
        cards.isEmpty ? 0 : Double(favoriteCount) / Double(cards.count)
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Profile")
                .navigationBarTitleDisplayMode(.inline)
                .background(Color(.systemGroupedBackground))
                .toolbar {
                    ToolbarItem(placement: .primaryAction) {
                        Button("Edit") { model.beginEditing() }
                            .disabled(model.isLoading || model.errorMessage != nil)
                    }
                }
                .sheet(isPresented: $model.isEditing) {
                    EditProfileSheet(model: model)
                }
        }
        .fontDesign(AppTheme.fontDesign)
        .task { model.load() }
    }

    @ViewBuilder
    private var content: some View {
        if model.isLoading {
            ProfileLoadingView()
        } else if let message = model.errorMessage {
            AppErrorStateView(title: "Profile unavailable", message: message) {
                model.load()
            }
        } else {
            profile
        }
    }

    private var profile: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing.roomy) {
                headerCard
                if model.didSave {
                    Label("Profile saved", systemImage: "checkmark.circle.fill")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.green)
                        .transition(.opacity)
                }
                AppSectionHeader(title: "Activity")
                    .accessibilityAddTraits(.isHeader)
                statsRow
                AppCard {
                    HStack(spacing: spacing.standard) {
                        AppProgressRing(title: "Favorited", value: favoriteRatio)
                        VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                            Text("Curation")
                                .font(.headline)
                            Text("\(favoriteCount) of \(cards.count) cards marked as favorites.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                AppSectionHeader(title: "Appearance")
                    .accessibilityAddTraits(.isHeader)
                AppCard {
                    VStack(alignment: .leading, spacing: spacing.compact) {
                        Text("Choose how Tab Feed looks.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        AppearancePicker()
                            .pickerStyle(.segmented)
                    }
                }
                AppSectionHeader(title: "Privacy")
                    .accessibilityAddTraits(.isHeader)
                AppCard {
                    HStack(alignment: .top, spacing: spacing.standard) {
                        AppIconTile(symbol: "iphone", tint: AppColor.secondary, accessibilityLabel: "Device")
                        VStack(alignment: .leading, spacing: AppTheme.Space.xSmall) {
                            Text("Stored on this device")
                                .font(.headline)
                            Text("Your cards, name and photo never leave this device.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .accessibilityElement(children: .combine)
                }
            }
            .padding(AppTheme.screenInset)
            .motionAwareAnimation(.easeOut(duration: AppTheme.motionDuration), value: model.didSave)
        }
    }

    private var headerCard: some View {
        AppCard {
            VStack(spacing: spacing.standard) {
                ProfileAvatarView(image: model.image, initials: model.initials, size: 104)
                VStack(spacing: AppTheme.Space.xSmall) {
                    Text(model.displayName)
                        .font(.title.weight(.bold))
                        .multilineTextAlignment(.center)
                        .accessibilityAddTraits(.isHeader)
                    Text(model.hasBio ? model.bio : "Add a short bio to introduce yourself.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Button {
                    model.beginEditing()
                } label: {
                    Label("Edit Profile", systemImage: "pencil")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(AppPrimaryButtonStyle())
            }
            .frame(maxWidth: .infinity)
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
        }
    }
}

/// A round avatar showing the chosen photo, or initials on a brand gradient.
struct ProfileAvatarView: View {
    let image: UIImage?
    let initials: String
    var size: CGFloat = 96

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                ZStack {
                    LinearGradient(
                        colors: [AppColor.primary, AppColor.secondary],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    Text(initials)
                        .font(.title.weight(.semibold))
                        .minimumScaleFactor(0.5)
                        .foregroundStyle(AppColor.onPrimary)
                        .padding(AppTheme.Space.small)
                }
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay {
            Circle().strokeBorder(AppColor.surface, lineWidth: 3)
        }
        .accessibilityLabel(image == nil ? "Avatar with initials \(initials)" : "Profile photo")
    }
}

private struct ProfileLoadingView: View {
    private let spacing = ScaledSpacing()

    var body: some View {
        VStack(spacing: spacing.standard) {
            SkeletonBlock(height: 104)
                .frame(width: 104)
            SkeletonBlock(height: 28)
            SkeletonBlock(height: 20)
            SkeletonBlock(height: 120)
            Spacer(minLength: 0)
        }
        .padding(AppTheme.screenInset)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Loading profile")
    }
}

#Preview("Populated") {
    let container = PreviewSupport.seededContainer()
    ProfileView(model: PreviewSupport.profileViewModel(in: container))
        .modelContainer(container)
}

#Preview("Fresh install") {
    let container = PreviewSupport.container()
    ProfileView(model: PreviewSupport.profileViewModel(in: container))
        .modelContainer(container)
}
