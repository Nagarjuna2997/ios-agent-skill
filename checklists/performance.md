# Performance Checklist

A systematic checklist for profiling, measuring, and optimizing iOS app performance. Each section covers what to check, how to measure it, and concrete fixes.

---

## Instruments Profiling

### Time Profiler
- [ ] Profile the app with Time Profiler to find CPU hot spots
- [ ] Look for methods consuming >10% of total CPU time
- [ ] Check for work on the main thread that should be on a background queue
- [ ] Verify no synchronous I/O (file reads, database queries) on the main thread
- [ ] Identify redundant or repeated calculations that can be cached

```
How to run: Xcode > Product > Profile > Time Profiler
Focus: Check "Hide System Libraries" to see only your code
Tip:  Use Call Tree > Invert Call Tree to find leaf functions consuming the most time
```

### Allocations
- [ ] Profile with Allocations to track memory growth over time
- [ ] Check for unbounded memory growth during scrolling or navigation
- [ ] Identify transient allocations that could be reduced (e.g., creating objects in tight loops)
- [ ] Look for large allocations (images, data buffers) that are not released

```
How to run: Xcode > Product > Profile > Allocations
Focus: Mark Generation snapshots before and after user flows to isolate growth
Tip:  Filter by "Persistent" to find objects that never get deallocated
```

### Leaks
- [ ] Run Leaks instrument to detect retain cycles
- [ ] Investigate any leaked objects (especially closures capturing `self`)
- [ ] Verify delegates are declared `weak`
- [ ] Verify closures use `[weak self]` when capturing view models or coordinators
- [ ] Check Combine subscriptions are stored and cancelled properly

### Network (Instruments)
- [ ] Profile network calls with the Network instrument
- [ ] Identify redundant or duplicate API requests
- [ ] Check for requests that could be batched or deduplicated
- [ ] Verify responses are cached appropriately (HTTP cache headers)

### Animation Hitches (Core Animation / RenderServer)
- [ ] Profile with the Animation Hitches instrument
- [ ] Target zero commit hitches (frame drops during layout/render)
- [ ] Target zero render hitches (GPU cannot complete frame in time)
- [ ] Investigate any hitch duration > 8ms on 120Hz devices

---

## App Launch Time

### Pre-main (before main() is called)
- [ ] Measure pre-main time with `DYLD_PRINT_STATISTICS=1` environment variable
- [ ] Reduce dynamic frameworks (merge into fewer frameworks or use static linking)
- [ ] Remove unused frameworks and libraries
- [ ] Minimize `+load` methods and `__attribute__((constructor))` functions
- [ ] Reduce Objective-C class count if possible (affects class registration time)

```
Target: Pre-main < 200ms on oldest supported device
Set environment variable in Xcode scheme > Run > Arguments > Environment Variables
```

### Post-main (after main() until first frame rendered)
- [ ] Defer non-essential initialization (analytics, feature flags, pre-fetching)
- [ ] Lazy-load services that are not needed for the first screen
- [ ] Avoid synchronous network calls during launch
- [ ] Avoid synchronous database migrations blocking the main thread
- [ ] Use `task { }` in the root view to perform async setup after the first frame
- [ ] Measure with `os_signpost` or MetricKit `applicationLaunchTime`

```swift
// Measure post-main to first frame
import os

let signpostLog = OSLog(subsystem: "com.app", category: .pointsOfInterest)
os_signpost(.begin, log: signpostLog, name: "AppLaunch")
// ... in your root view's onAppear or task:
os_signpost(.end, log: signpostLog, name: "AppLaunch")
```

### Targets
- [ ] Cold launch < 400ms on iPhone 12 or newer
- [ ] Warm launch < 200ms
- [ ] Resume (from background) < 100ms

---

## SwiftUI Performance

### List and Scroll Performance
- [ ] Use `LazyVStack` / `LazyHStack` instead of `VStack` / `HStack` for long lists
- [ ] Use `List` with identifiable data for automatic cell reuse
- [ ] Avoid wrapping `List` inside `ScrollView` (breaks cell reuse)
- [ ] Keep row views lightweight (no heavy computation in `body`)
- [ ] Extract complex subviews into separate structs to limit re-evaluation scope

```swift
// Good: LazyVStack with identified content
ScrollView {
    LazyVStack(spacing: 12) {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}

// Bad: VStack evaluates all children immediately
ScrollView {
    VStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

### Reducing View Re-evaluation
- [ ] Use `@Observable` (Observation framework) instead of `@ObservedObject` where possible
- [ ] Ensure views only depend on the properties they read (fine-grained observation)
- [ ] Add `.equatable()` modifier to views with expensive `body` computations
- [ ] Use `let` properties on views to avoid unnecessary identity changes
- [ ] Avoid storing derived state -- compute it in `body` or use computed properties

```swift
// With @Observable, only views reading 'count' re-evaluate when count changes
@Observable class CounterModel {
    var count = 0
    var title = "Counter"  // Changing this won't re-evaluate views that only read count
}
```

### Task and Data Loading
- [ ] Use `.task { }` instead of `.onAppear` for async work (auto-cancels on disappear)
- [ ] Use `.task(id:)` to re-run when a dependency changes
- [ ] Avoid triggering heavy work in `body` or `init`
- [ ] Debounce search inputs before triggering API calls

```swift
.task(id: searchQuery) {
    try? await Task.sleep(for: .milliseconds(300))
    guard !Task.isCancelled else { return }
    await viewModel.search(query: searchQuery)
}
```

### Conditional Views
- [ ] Prefer `if/else` for mutually exclusive views (not overlapping with `.opacity`)
- [ ] Use `AnyView` sparingly -- it defeats SwiftUI's diffing optimizations
- [ ] Keep `body` return types consistent to avoid unnecessary view identity changes

---

## Image Optimization

### Downsample Before Display
- [ ] Never assign a 4000x3000 image directly to an `Image` view
- [ ] Downsample large images to the display size using `CGImageSource`
- [ ] Use `preparingThumbnail(of:)` on `UIImage` for simple downsampling

```swift
extension UIImage {
    /// Downsample to the target point size, respecting screen scale.
    static func downsample(
        at url: URL,
        to pointSize: CGSize,
        scale: CGFloat = UIScreen.main.scale
    ) -> UIImage? {
        let maxDimension = max(pointSize.width, pointSize.height) * scale
        let options: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: maxDimension
        ]
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary)
        else {
            return nil
        }
        return UIImage(cgImage: cgImage)
    }
}
```

### Caching
- [ ] Use `NSCache` for in-memory image caching (auto-evicts under memory pressure)
- [ ] Cache decoded/downsampled images, not raw data
- [ ] Use disk cache (URLCache or custom) for network images
- [ ] Set appropriate HTTP cache headers on image endpoints
- [ ] Use `AsyncImage` for simple cases; custom loader for advanced caching

### Asset Catalog
- [ ] Provide images in asset catalog at 1x, 2x, 3x or as PDF/SVG vectors
- [ ] Use "Preserve Vector Data" for icons that may render at non-standard sizes
- [ ] Enable "Compress" on large image assets in the asset catalog

---

## Network Optimization

- [ ] Enable HTTP caching via `URLCache` with appropriate cache size
- [ ] Use `If-Modified-Since` / `If-None-Match` (ETag) to avoid re-downloading unchanged data
- [ ] Implement pagination for large data sets (do not fetch all records at once)
- [ ] Use `URLSession` background configuration for large downloads/uploads
- [ ] Compress request bodies with `Content-Encoding: gzip` when supported by the server
- [ ] Deduplicate in-flight requests (do not fire the same API call multiple times simultaneously)
- [ ] Use HTTP/2 multiplexing (default with `URLSession` when server supports it)
- [ ] Set reasonable timeouts: 10-15s for API calls, 60s for uploads

```swift
// Deduplicate in-flight requests
actor RequestDeduplicator {
    private var inFlight: [String: Task<Data, Error>] = [:]

    func deduplicated(
        key: String,
        work: @Sendable @escaping () async throws -> Data
    ) async throws -> Data {
        if let existing = inFlight[key] {
            return try await existing.value
        }
        let task = Task { try await work() }
        inFlight[key] = task
        defer { inFlight.removeValue(forKey: key) }
        return try await task.value
    }
}
```

---

## Core Data / SwiftData Performance

- [ ] Use batch inserts (`NSBatchInsertRequest` / SwiftData bulk operations) for large imports
- [ ] Fetch only required properties with `FetchDescriptor.propertiesToFetch`
- [ ] Use `fetchLimit` to avoid loading entire tables
- [ ] Use `fetchOffset` for pagination
- [ ] Avoid fetching inside `body` -- fetch in `.task` and store results in `@State`
- [ ] Use background contexts for heavy write operations
- [ ] Index frequently queried attributes with `@Attribute(.spotlight)` or `#Index`
- [ ] Monitor query times with `com.apple.CoreData.SQLDebug 1` launch argument

```swift
// Efficient fetch with SwiftData
var descriptor = FetchDescriptor<Item>(
    predicate: #Predicate { $0.isActive == true },
    sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
)
descriptor.fetchLimit = 20
descriptor.fetchOffset = page * 20
let items = try modelContext.fetch(descriptor)
```

---

## Memory Management

- [ ] Use `[weak self]` in closures that outlive the current scope
- [ ] Use `[unowned self]` only when you can guarantee `self` outlives the closure
- [ ] Break retain cycles in delegate patterns with `weak var delegate`
- [ ] Profile with Memory Graph Debugger (Debug > Debug Memory Graph) for retain cycles
- [ ] Monitor memory footprint with `os_proc_available_memory()` for adaptive quality
- [ ] Release large resources (image buffers, caches) in `didReceiveMemoryWarning`
- [ ] Use `autoreleasepool` in tight loops creating many temporary Objective-C objects

```swift
// Autorelease pool in a tight loop
func processImages(_ urls: [URL]) {
    for url in urls {
        autoreleasepool {
            guard let image = UIImage(contentsOfFile: url.path) else { return }
            let processed = applyFilter(to: image)
            saveProcessed(processed)
            // image and processed are released at end of each iteration
        }
    }
}
```

---

## Background Task Optimization

- [ ] Use `BGAppRefreshTask` for periodic refresh (minimum 15-minute interval)
- [ ] Use `BGProcessingTask` for long-running work (data sync, ML inference)
- [ ] Set `earliestBeginDate` to give the system scheduling flexibility
- [ ] Complete tasks promptly -- the system kills tasks that run too long
- [ ] Call `setTaskCompleted(success:)` when done
- [ ] Register background tasks in `application(_:didFinishLaunchingWithOptions:)`

```swift
// Register
BGTaskScheduler.shared.register(
    forTaskWithIdentifier: "com.app.refresh",
    using: nil
) { task in
    handleAppRefresh(task as! BGAppRefreshTask)
}

// Schedule
func scheduleRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.app.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}
```

---

## MetricKit and On-Device Diagnostics

- [ ] Adopt `MXMetricManagerSubscriber` to receive daily metric payloads
- [ ] Monitor `MXAppLaunchMetric` for launch time regressions
- [ ] Monitor `MXAppResponsivenessMetric` for hang rate
- [ ] Monitor `MXMemoryMetric` for peak memory usage
- [ ] Monitor `MXDiskIOMetric` for excessive disk I/O
- [ ] Review `MXCrashDiagnostic` and `MXHangDiagnostic` payloads
- [ ] Use Xcode Organizer > Metrics for aggregated data across your user base
- [ ] Set performance budgets and alert on regressions in CI

```swift
import MetricKit

class MetricsSubscriber: NSObject, MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            if let launchMetrics = payload.applicationLaunchMetrics {
                // Log or send to analytics
                let resumeTime = launchMetrics.histogrammedResumeTime
                let optimizedStart = launchMetrics.histogrammedOptimizedTimeToFirstDraw
            }
        }
    }

    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for payload in payloads {
            if let crashDiags = payload.crashDiagnostics {
                // Forward to crash reporting service
            }
            if let hangDiags = payload.hangDiagnostics {
                // Log hang stacks for investigation
            }
        }
    }
}

// In your App or AppDelegate:
let subscriber = MetricsSubscriber()
MXMetricManager.shared.add(subscriber)
```

---

## Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold launch | < 400ms | MetricKit / os_signpost |
| Time to interactive | < 1s | os_signpost |
| Frame rate | 60/120 fps | Core Animation instrument |
| Hitch rate | < 5ms/s | Animation Hitches instrument |
| Memory (peak) | < 150MB | Allocations instrument |
| API response handling | < 100ms | Time Profiler |
| Image decode + display | < 16ms | Time Profiler |
| App size (download) | < 50MB | App Store Connect |

Review these budgets in each release cycle and investigate any regression beyond 10% of the target.
