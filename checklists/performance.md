# Performance Checklist

## Instruments Profiling

### Time Profiler
- [ ] No methods taking > 16ms on main thread (60fps budget)
- [ ] Heavy computation moved to background threads
- [ ] No synchronous network calls on main thread

```swift
// Move work off the main thread
func processData(_ data: [RawItem]) async -> [ProcessedItem] {
    await withCheckedContinuation { continuation in
        DispatchQueue.global(qos: .userInitiated).async {
            let result = data.map { ProcessedItem(from: $0) }
            continuation.resume(returning: result)
        }
    }
}

// Or use Swift concurrency (preferred)
func processData(_ data: [RawItem]) async -> [ProcessedItem] {
    await Task.detached(priority: .userInitiated) {
        data.map { ProcessedItem(from: $0) }
    }.value
}
```

### Allocations
- [ ] No unbounded memory growth during navigation
- [ ] Large temporary allocations released promptly
- [ ] Autorelease pools used for batch processing

```swift
// Batch processing with memory management
func importRecords(_ records: [Record]) async throws {
    let batchSize = 100
    for batch in records.chunked(into: batchSize) {
        try autoreleasepool {
            for record in batch {
                try processAndSave(record)
            }
        }
    }
}
```

### Leaks
- [ ] No retain cycles in closures (use `[weak self]`)
- [ ] Delegates are `weak` references
- [ ] Timers invalidated when views disappear
- [ ] Observers removed on deallocation

```swift
// Common leak: closure retaining self
class ViewModel {
    var cancellable: AnyCancellable?

    func observe() {
        // BAD: strong self capture
        // cancellable = publisher.sink { self.handleUpdate($0) }

        // GOOD: weak self capture
        cancellable = publisher.sink { [weak self] value in
            self?.handleUpdate(value)
        }
    }
}

// SwiftUI: .task automatically cancels — no leak risk
struct MyView: View {
    var body: some View {
        Text("Hello")
            .task { await loadData() } // Cancels when view disappears
    }
}
```

---

## SwiftUI Performance

### Lazy Loading

```swift
// BAD: loads all 10,000 rows immediately
ScrollView {
    VStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}

// GOOD: only creates visible rows
List(items) { item in
    ItemRow(item: item)
}

// GOOD: lazy grid
ScrollView {
    LazyVGrid(columns: columns) {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
}
```

### Minimizing View Updates

```swift
// Use Equatable to prevent unnecessary redraws
struct ItemRow: View, Equatable {
    let item: Item

    static func == (lhs: ItemRow, rhs: ItemRow) -> Bool {
        lhs.item.id == rhs.item.id && lhs.item.title == rhs.item.title
    }

    var body: some View {
        HStack {
            Text(item.title)
            Spacer()
            Text(item.date, style: .date)
        }
    }
}

// Extract subviews to isolate state changes
struct ParentView: View {
    @State private var counter = 0
    let items: [Item]

    var body: some View {
        VStack {
            CounterView(count: $counter) // Only this redraws on tap
            ItemListView(items: items)   // This does NOT redraw
        }
    }
}

// Use @Observable (not @Published) to get fine-grained updates
@Observable
class ViewModel {
    var title = ""      // Only views reading `title` update
    var items: [Item] = [] // Only views reading `items` update
}
```

### Task and Async Best Practices

```swift
struct SearchView: View {
    @State private var query = ""
    @State private var results: [Item] = []

    var body: some View {
        List(results) { item in
            Text(item.title)
        }
        .searchable(text: $query)
        .task(id: query) {
            // Automatically cancels previous task when query changes
            try? await Task.sleep(for: .milliseconds(300)) // Debounce
            guard !Task.isCancelled else { return }
            results = await search(query)
        }
    }
}
```

---

## Image Optimization

### Downsampling

```swift
// Never load full-resolution images into thumbnails
func downsample(url: URL, to pointSize: CGSize, scale: CGFloat = UIScreen.main.scale) -> UIImage? {
    let maxDimension = max(pointSize.width, pointSize.height) * scale
    let options: [CFString: Any] = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: maxDimension
    ]

    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary)
    else { return nil }

    return UIImage(cgImage: cgImage)
}
```

### AsyncImage with Caching

```swift
// SwiftUI built-in (no caching)
AsyncImage(url: imageURL) { phase in
    switch phase {
    case .success(let image):
        image.resizable().aspectRatio(contentMode: .fill)
    case .failure:
        Image(systemName: "photo").foregroundStyle(.secondary)
    case .empty:
        ProgressView()
    @unknown default:
        EmptyView()
    }
}
.frame(width: 100, height: 100)
.clipShape(RoundedRectangle(cornerRadius: 8))

// Custom caching image loader
actor ImageCache {
    static let shared = ImageCache()
    private let cache = NSCache<NSString, UIImage>()

    func image(for url: URL) async throws -> UIImage {
        let key = url.absoluteString as NSString
        if let cached = cache.object(forKey: key) {
            return cached
        }

        let (data, _) = try await URLSession.shared.data(from: url)
        guard let image = UIImage(data: data) else {
            throw URLError(.cannotDecodeContentData)
        }

        cache.setObject(image, forKey: key)
        return image
    }
}
```

---

## Network Optimization

### Request Deduplication

```swift
actor RequestDeduplicator {
    private var inFlightRequests: [String: Task<Data, Error>] = [:]

    func deduplicate(url: URL) async throws -> Data {
        let key = url.absoluteString

        if let existing = inFlightRequests[key] {
            return try await existing.value
        }

        let task = Task<Data, Error> {
            let (data, _) = try await URLSession.shared.data(from: url)
            return data
        }

        inFlightRequests[key] = task
        defer { inFlightRequests.removeValue(forKey: key) }
        return try await task.value
    }
}
```

### Pagination

```swift
@Observable
class PaginatedListViewModel {
    var items: [Item] = []
    var isLoadingMore = false
    private var currentPage = 0
    private var hasMorePages = true

    func loadNextPageIfNeeded(currentItem: Item) async {
        guard let index = items.firstIndex(where: { $0.id == currentItem.id }),
              index >= items.count - 5,    // Prefetch threshold
              hasMorePages,
              !isLoadingMore else { return }

        isLoadingMore = true
        defer { isLoadingMore = false }

        currentPage += 1
        let newItems = try? await api.fetch(page: currentPage, perPage: 20)
        if let newItems, !newItems.isEmpty {
            items.append(contentsOf: newItems)
        } else {
            hasMorePages = false
        }
    }
}

// Usage in View
List(viewModel.items) { item in
    ItemRow(item: item)
        .task { await viewModel.loadNextPageIfNeeded(currentItem: item) }
}
```

---

## Core Data / SwiftData Performance

```swift
// Batch fetching
let descriptor = FetchDescriptor<Item>(
    predicate: #Predicate { $0.isActive },
    sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
)
descriptor.fetchLimit = 50
descriptor.fetchOffset = page * 50
descriptor.propertiesToFetch = [\.title, \.thumbnail] // Partial fetch

// Background context for writes
let backgroundContext = ModelContext(modelContainer)
try backgroundContext.transaction {
    for record in records {
        backgroundContext.insert(ItemEntity(from: record))
    }
}
```

---

## App Launch Time Optimization

### Measure Launch Time
```bash
# Add to Xcode scheme environment variables:
DYLD_PRINT_STATISTICS = 1
# Shows pre-main time breakdown
```

### Optimization Strategies
- [ ] Defer non-critical initialization (analytics, crash reporting) to after first frame
- [ ] Use `@MainActor` to avoid thread-switching overhead at launch
- [ ] Reduce dynamic frameworks (prefer static linking)
- [ ] Remove unused frameworks and code
- [ ] Use lazy properties for heavy objects

```swift
@main
struct MyApp: App {
    init() {
        // Only critical setup here
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .task {
                    // Defer non-critical setup
                    await initializeAnalytics()
                    await registerForNotifications()
                    await prefetchData()
                }
        }
    }
}
```

---

## Memory Management

### Key Rules
- [ ] Monitor memory with Xcode memory gauge during testing
- [ ] App stays under 200MB in typical usage
- [ ] Handle `didReceiveMemoryWarning` by clearing caches
- [ ] Large assets (images, videos) use disk cache, not in-memory
- [ ] Avoid storing large collections in @State or @Observable properties

```swift
// Respond to memory pressure
NotificationCenter.default.addObserver(
    forName: UIApplication.didReceiveMemoryWarningNotification,
    object: nil, queue: .main
) { _ in
    ImageCache.shared.clearAll()
    URLCache.shared.removeAllCachedResponses()
}
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold launch | < 400ms to first frame | Instruments > App Launch |
| Warm launch | < 200ms | Instruments > App Launch |
| Frame rate | 60fps (120fps on ProMotion) | Instruments > Core Animation |
| Memory (typical) | < 150MB | Xcode memory gauge |
| Memory (peak) | < 500MB | Instruments > Allocations |
| Network payload | < 200KB per request | Charles Proxy / Instruments |
| Image decode | < 10ms per thumbnail | Time Profiler |
| List scroll | 0 dropped frames | Core Animation instrument |
