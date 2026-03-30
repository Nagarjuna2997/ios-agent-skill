# tvOS Platform Guide

## Focus Engine and Focusable Views

### Understanding the Focus System

tvOS uses a focus-based navigation model. The Siri Remote trackpad moves focus between views; pressing the trackpad selects the focused item.

```swift
struct ContentGridView: View {
    @FocusState private var focusedItem: String?

    let items = ["Movies", "Shows", "Music", "Podcasts"]

    var body: some View {
        HStack(spacing: 40) {
            ForEach(items, id: \.self) { item in
                CardView(title: item)
                    .focusable()
                    .focused($focusedItem, equals: item)
                    .scaleEffect(focusedItem == item ? 1.1 : 1.0)
                    .shadow(radius: focusedItem == item ? 20 : 5)
                    .animation(.spring(duration: 0.3), value: focusedItem)
            }
        }
        .padding(60)
        .defaultFocus($focusedItem, "Movies")
    }
}
```

### Focus Sections and Custom Navigation

```swift
struct CustomFocusView: View {
    @FocusState private var section: Section?

    enum Section: Hashable {
        case sidebar, content, detail
    }

    var body: some View {
        HStack {
            // Sidebar
            VStack {
                ForEach(menuItems) { item in
                    MenuButton(item: item)
                }
            }
            .focusSection()
            .focused($section, equals: .sidebar)

            // Content area
            LazyVGrid(columns: columns) {
                ForEach(contentItems) { item in
                    ContentCard(item: item)
                }
            }
            .focusSection()
            .focused($section, equals: .content)
        }
        .focusScope(namespace)
        .onMoveCommand { direction in
            handleDirectionalInput(direction)
        }
    }

    func handleDirectionalInput(_ direction: MoveCommandDirection) {
        switch direction {
        case .left:  section = .sidebar
        case .right: section = .content
        default: break
        }
    }
}
```

### Focus-Aware Styling

```swift
struct FocusableCard: View {
    let title: String
    let imageURL: URL
    @Environment(\.isFocused) var isFocused

    var body: some View {
        VStack {
            AsyncImage(url: imageURL) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray
            }
            .frame(width: 300, height: 170)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(isFocused ? 0.4 : 0.1),
                    radius: isFocused ? 20 : 5,
                    y: isFocused ? 10 : 2)

            Text(title)
                .font(isFocused ? .headline : .subheadline)
                .foregroundStyle(isFocused ? .primary : .secondary)
        }
        .scaleEffect(isFocused ? 1.05 : 1.0)
        .animation(.easeInOut(duration: 0.2), value: isFocused)
    }
}
```

---

## TVUIKit Components

### Lockup Views (UIKit)

```swift
import TVUIKit

class PosterViewController: UIViewController {
    func createLockupView() -> TVLockupView {
        let lockup = TVLockupView()

        // Content image
        let imageView = UIImageView(image: UIImage(named: "poster"))
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        imageView.frame = CGRect(x: 0, y: 0, width: 240, height: 360)
        lockup.contentView.addSubview(imageView)

        // Header
        let headerLabel = UILabel()
        headerLabel.text = "NEW"
        headerLabel.font = .systemFont(ofSize: 16, weight: .bold)
        lockup.headerView = headerLabel

        // Footer
        let footerLabel = UILabel()
        footerLabel.text = "Movie Title"
        footerLabel.font = .systemFont(ofSize: 20)
        lockup.footerView = footerLabel

        lockup.contentSize = CGSize(width: 240, height: 360)
        return lockup
    }
}
```

### Monogram and Caption Button

```swift
// Monogram view for user profiles
let monogram = TVMonogramView()
monogram.title = "John Doe"
monogram.subtitle = "Family Member"
monogram.image = UIImage(named: "profile")

// Caption button
let captionButton = TVCaptionButtonView()
captionButton.contentImage = UIImage(systemName: "play.fill")
captionButton.title = "Play"
captionButton.subtitle = "From Beginning"
```

---

## Top Shelf Extensions

### Static Top Shelf

```swift
import TVServices

class ContentProvider: TVTopShelfContentProvider {
    override func loadTopShelfContent() async -> TVTopShelfContent? {
        // Sectioned content
        var sections: [TVTopShelfItemCollection<TVTopShelfSectionedItem>] = []

        let continueWatching = TVTopShelfItemCollection<TVTopShelfSectionedItem>(items: await fetchContinueWatching())
        continueWatching.title = "Continue Watching"

        let recommended = TVTopShelfItemCollection<TVTopShelfSectionedItem>(items: await fetchRecommended())
        recommended.title = "Recommended for You"

        sections = [continueWatching, recommended]
        return TVTopShelfSectionedContent(sections: sections)
    }

    private func fetchContinueWatching() async -> [TVTopShelfSectionedItem] {
        // Fetch from your data source
        return movies.map { movie in
            let item = TVTopShelfSectionedItem(identifier: movie.id)
            item.title = movie.title
            item.setImageURL(movie.posterURL, for: .screenScale1x)
            item.setImageURL(movie.posterURL2x, for: .screenScale2x)
            item.playAction = TVTopShelfAction(url: URL(string: "myapp://play/\(movie.id)")!)
            item.displayAction = TVTopShelfAction(url: URL(string: "myapp://detail/\(movie.id)")!)
            return item
        }
    }
}
```

### Inset Top Shelf

```swift
func loadTopShelfContent() async -> TVTopShelfContent? {
    let items: [TVTopShelfInsetItem] = await fetchFeatured().map { featured in
        let item = TVTopShelfInsetItem(identifier: featured.id)
        item.title = featured.title
        item.setImageURL(featured.wideImageURL, for: .screenScale1x)
        item.setImageURL(featured.wideImageURL2x, for: .screenScale2x)
        item.imageShape = .extraWide  // 16:9 aspect ratio
        item.playAction = TVTopShelfAction(url: URL(string: "myapp://play/\(featured.id)")!)
        return item
    }
    return TVTopShelfInsetContent(items: items)
}
```

---

## Siri Remote Handling

### Gesture Recognition

```swift
struct RemoteAwareView: View {
    @State private var position = CGPoint(x: 400, y: 300)

    var body: some View {
        Canvas { context, size in
            let rect = CGRect(x: position.x - 25, y: position.y - 25, width: 50, height: 50)
            context.fill(Circle().path(in: rect), with: .color(.blue))
        }
        .onPlayPauseCommand { togglePlayback() }
        .onExitCommand { handleBack() }
        .onMoveCommand { direction in
            withAnimation(.spring) {
                switch direction {
                case .up:    position.y -= 50
                case .down:  position.y += 50
                case .left:  position.x -= 50
                case .right: position.x += 50
                @unknown default: break
                }
            }
        }
    }
}
```

### Game Controller Support

```swift
import GameController

class RemoteInputManager: ObservableObject {
    @Published var isConnected = false

    func setupGameController() {
        NotificationCenter.default.addObserver(
            self, selector: #selector(controllerConnected),
            name: .GCControllerDidConnect, object: nil
        )

        // Siri Remote as game controller
        GCController.startWirelessControllerDiscovery()
    }

    @objc func controllerConnected(_ notification: Notification) {
        guard let controller = notification.object as? GCController else { return }
        isConnected = true

        if let micro = controller.microGamepad {
            micro.dpad.valueChangedHandler = { pad, x, y in
                // Trackpad touch position (-1...1)
                print("Touch: \(x), \(y)")
            }
            micro.buttonA.pressedChangedHandler = { _, _, pressed in
                if pressed { self.handleSelect() }
            }
            micro.buttonMenu.pressedChangedHandler = { _, _, pressed in
                if pressed { self.handleMenu() }
            }
        }
    }
}
```

---

## Media Playback on TV

```swift
import AVKit

struct PlayerView: UIViewControllerRepresentable {
    let mediaURL: URL

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()
        let player = AVPlayer(url: mediaURL)
        controller.player = player

        // Configure for TV experience
        controller.showsPlaybackControls = true
        controller.allowsPictureInPicturePlayback = false
        controller.updatesNowPlayingInfoCenter = true
        controller.skippingBehavior = .skipItem
        controller.requiresLinearPlayback = false

        // Metadata
        let metadata = AVMutableMetadataItem()
        metadata.identifier = .commonIdentifierTitle
        metadata.value = "Movie Title" as NSString
        player.currentItem?.externalMetadata = [metadata]

        // Info panel customization
        controller.transportBarCustomMenuItems = [
            UIAction(title: "Audio", image: UIImage(systemName: "speaker.wave.3")) { _ in },
            UIAction(title: "Subtitles", image: UIImage(systemName: "captions.bubble")) { _ in }
        ]

        player.play()
        return controller
    }

    func updateUIViewController(_ controller: AVPlayerViewController, context: Context) {}
}

// Interstitial content (ads, recaps)
struct ContentWithInterstitials {
    func configureInterstitials(for player: AVPlayer) {
        let interstitialEvent = AVPlayerInterstitialEvent(
            primaryItem: player.currentItem!,
            time: CMTime(seconds: 300, preferredTimescale: 1)  // At 5 minutes
        )
        interstitialEvent.templateItems = [
            AVPlayerItem(url: URL(string: "https://example.com/ad.mp4")!)
        ]

        let controller = AVPlayerInterstitialEventController(primaryPlayer: player)
        controller.events = [interstitialEvent]
    }
}
```

---

## Multi-User Support

```swift
import TVUIKit

class UserManager {
    func getCurrentUser() async -> TVUserManager.User? {
        // tvOS supports multiple user profiles
        let userManager = TVUserManager()

        return await withCheckedContinuation { continuation in
            userManager.presentProfilePreferencesPanel { result in
                switch result {
                case .success(let user):
                    continuation.resume(returning: user)
                case .failure:
                    continuation.resume(returning: nil)
                @unknown default:
                    continuation.resume(returning: nil)
                }
            }
        }
    }
}

// User-specific data isolation
struct UserProfileView: View {
    let userIdentifier: String

    var body: some View {
        // Load user-specific preferences and watch history
        VStack {
            Text("Welcome back")
                .font(.title)
            ContinueWatchingRow(userId: userIdentifier)
            RecommendationsRow(userId: userIdentifier)
        }
    }
}
```

---

## tvOS Design Guidelines

| Aspect | Recommendation |
|--------|---------------|
| Viewing distance | Design for 10-foot experience (large text, images) |
| Safe area | Respect 60pt insets on all sides |
| Focus feedback | Always provide visual feedback for focus changes |
| Text size | Minimum 31pt for body text |
| Animations | Use spring animations for focus transitions |
| Navigation depth | Keep to 3-4 levels maximum |
| Loading states | Show placeholder content immediately |
| Background | Use layered images for parallax depth effect |
| Audio | Always provide descriptive audio option |
| Top Shelf | Update content regularly for discovery |
