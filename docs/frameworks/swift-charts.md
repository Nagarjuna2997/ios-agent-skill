# Swift Charts

**Load this when:** rendering any chart — line, bar, area, scatter, sector — or
when a chart scrolls badly, is unreadable to VoiceOver, or looks wrong in dark
mode.

Covers `Chart`, the mark types, scales and axes, selection, accessibility via
`AXChartDescriptor`, and what to do when the dataset is too large to plot
honestly.

**Availability:** Swift Charts iOS 16+; `chartScrollableAxes`,
`chartXSelection`, and `chartScrollPosition` **iOS 17+**; `SectorMark` (donut and
pie) **iOS 17+**; `chartGesture` iOS 18+.

---

## 1. Two decisions that determine whether the chart is any good

**Plot a value type keyed by a stable identity.** Every mark needs an `id` that
survives a reload, or SwiftUI animates the wrong bars into each other on every
update. `Identifiable` on the model, `ForEach` over it — not indices.

**Decide what "too much data" means before you hit it.** Swift Charts will
happily try to draw 50,000 marks and drop frames doing it. There is no
virtualisation. The fix is to *downsample before plotting* (§5), not to hope. A
line chart 350 points wide cannot show more than about 350 distinguishable
values regardless of how many you hand it — plotting 50,000 is not more honest,
it is the same picture rendered slowly.

---

## 2. The pattern

```swift
import Charts
import SwiftUI

struct StepSample: Identifiable, Hashable, Sendable {
    let id: UUID
    let day: Date
    let steps: Int
    let source: String

    init(id: UUID = UUID(), day: Date, steps: Int, source: String) {
        self.id = id
        self.day = day
        self.steps = steps
        self.source = source
    }
}

struct StepChart: View {
    let samples: [StepSample]
    @State private var selectedDay: Date?

    private var selected: StepSample? {
        guard let selectedDay else { return nil }
        return samples.min {
            abs($0.day.timeIntervalSince(selectedDay))
                < abs($1.day.timeIntervalSince(selectedDay))
        }
    }

    var body: some View {
        Chart(samples) { sample in
            BarMark(
                // .value's first argument is the axis LABEL. It is user-facing
                // and read aloud by VoiceOver, so it is localized, not a
                // property name.
                x: .value(String(localized: "Day"), sample.day, unit: .day),
                y: .value(String(localized: "Steps"), sample.steps)
            )
            .foregroundStyle(by: .value(String(localized: "Source"), sample.source))
            .opacity(selected == nil || selected?.id == sample.id ? 1 : 0.4)
        }
        // Never let a bar chart's y-axis start anywhere but zero: a truncated
        // baseline makes a 3% difference look like a 300% one.
        .chartYScale(domain: .automatic(includesZero: true))
        .chartXAxis {
            AxisMarks(values: .stride(by: .day, count: 7)) { value in
                AxisGridLine()
                AxisValueLabel(format: .dateTime.month(.abbreviated).day())
            }
        }
        .chartYAxis {
            AxisMarks(position: .leading) { value in
                AxisGridLine()
                AxisValueLabel()
            }
        }
        .chartXSelection(value: $selectedDay)          // iOS 17+
        .chartLegend(position: .bottom, alignment: .leading)
        .frame(height: 220)                            // height only — never width
        .accessibilityLabel(String(localized: "Daily step count"))
    }
}
```

**`.frame(height:)` and nothing else.** A chart with a fixed width breaks on
every device it was not designed on, and inside a `ScrollView` it silently
clips. Height is a design decision; width belongs to the layout.

---

## 3. Colors come from tokens, and encode meaning

```swift
.chartForegroundStyleScale([
    String(localized: "Watch"): Color.appAccent,
    String(localized: "Phone"): Color.appSecondary
])
```

Two rules the default palette will not enforce for you:

- **Never encode meaning by hue alone.** Roughly 8% of men cannot separate the
  default red/green pairing. Add a symbol (`.symbol(by:)`), a dash pattern, or a
  direct label. A chart whose only distinction is colour is unreadable to a
  measurable share of users and to anyone printing it.
- **Semantic colours must stay semantic across modes.** `Color.red` for "over
  budget" is fine; a literal `Color(red: 0.9, green: 0.2, blue: 0.2)` is not —
  it does not adapt, and on a dark background it vibrates. See
  `docs/design/design-tokens.md`.

---

## 4. Accessibility

A chart is a picture of numbers. VoiceOver users get nothing from the picture,
so the numbers must be reachable directly. There are two levels.

**Level 1 — per-mark, and the cheap 80%.** Every mark gets a label and a value:

```swift
BarMark(
    x: .value(String(localized: "Day"), sample.day, unit: .day),
    y: .value(String(localized: "Steps"), sample.steps)
)
.accessibilityLabel(sample.day.formatted(.dateTime.weekday(.wide)))
.accessibilityValue(String(localized: "\(sample.steps) steps"))
```

**Level 2 — `AXChartDescriptor`, which enables Audio Graphs.** This is what lets
a VoiceOver user *hear* the series as a tone sweep and navigate axes properly.
It is the difference between "a list of numbers" and "a chart".

```swift
import Accessibility
import SwiftUI

struct StepChartDescriptor: AXChartDescriptorRepresentable {
    let samples: [StepSample]

    func makeChartDescriptor() -> AXChartDescriptor {
        let steps = samples.map { Double($0.steps) }
        let days = samples.map(\.day)

        let xAxis = AXNumericDataAxisDescriptor(
            title: String(localized: "Day"),
            range: 0...Double(max(samples.count - 1, 1)),
            gridlinePositions: [],
            valueDescriptionProvider: { position in
                let index = Int(position.rounded())
                guard days.indices.contains(index) else { return "" }
                return days[index].formatted(.dateTime.month().day())
            }
        )

        let yAxis = AXNumericDataAxisDescriptor(
            title: String(localized: "Steps"),
            range: 0...(steps.max() ?? 1),
            gridlinePositions: [],
            valueDescriptionProvider: { value in
                String(localized: "\(Int(value)) steps")
            }
        )

        let series = AXDataSeriesDescriptor(
            name: String(localized: "Daily steps"),
            isContinuous: false,
            dataPoints: samples.enumerated().map { index, sample in
                AXDataPoint(x: Double(index), y: Double(sample.steps))
            }
        )

        return AXChartDescriptor(
            title: String(localized: "Daily step count"),
            summary: String(localized: "Steps recorded each day over the last month."),
            xAxis: xAxis,
            yAxis: yAxis,
            additionalAxes: [],
            series: [series]
        )
    }

    // Required, and required to actually update: returning without reassigning
    // leaves VoiceOver describing the previous dataset.
    func updateChartDescriptor(_ descriptor: AXChartDescriptor) {
        descriptor.series = makeChartDescriptor().series
    }
}
```

Attach it, and hide the decorative marks from the accessibility tree so
VoiceOver does not read 400 individual bars *and* the summary:

```swift
Chart(samples) { … }
    .accessibilityChartDescriptor(StepChartDescriptor(samples: samples))
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(String(localized: "Daily step count"))
```

Also honour Dynamic Type: axis labels scale, and at accessibility sizes they
overlap. Reduce `AxisMarks` density as the size category grows rather than
pinning a font size.

---

## 5. Large datasets

The order of operations is: **aggregate, then downsample, then plot.** Nothing
else fixes it.

```swift
extension Array where Element == StepSample {
    /// Largest-Triangle-Three-Buckets preserves visual peaks and troughs that
    /// naive stride-sampling drops. Dropping every Nth point deletes the spike
    /// the user opened the chart to look at.
    func downsampled(to threshold: Int) -> [StepSample] {
        guard count > threshold, threshold > 2 else { return self }

        let bucketSize = Double(count - 2) / Double(threshold - 2)
        var result: [StepSample] = [self[0]]
        var previous = 0

        for bucket in 0..<(threshold - 2) {
            let start = Int(Double(bucket) * bucketSize) + 1
            let end = Swift.min(Int(Double(bucket + 1) * bucketSize) + 1, count - 1)
            let nextStart = end
            let nextEnd = Swift.min(Int(Double(bucket + 2) * bucketSize) + 1, count)

            let nextSlice = self[nextStart..<Swift.max(nextEnd, nextStart)]
            let avgX = nextSlice.isEmpty ? 0 :
                nextSlice.map(\.day.timeIntervalSince1970).reduce(0, +) / Double(nextSlice.count)
            let avgY = nextSlice.isEmpty ? 0 :
                nextSlice.map { Double($0.steps) }.reduce(0, +) / Double(nextSlice.count)

            var bestArea = -1.0
            var bestIndex = start

            for index in start..<Swift.max(end, start + 1) where indices.contains(index) {
                let area = abs(
                    (self[previous].day.timeIntervalSince1970 - avgX)
                        * (Double(self[index].steps) - Double(self[previous].steps))
                    - (self[previous].day.timeIntervalSince1970
                        - self[index].day.timeIntervalSince1970)
                        * (avgY - Double(self[previous].steps))
                ) / 2
                if area > bestArea {
                    bestArea = area
                    bestIndex = index
                }
            }

            result.append(self[bestIndex])
            previous = bestIndex
        }

        result.append(self[count - 1])
        return result
    }
}
```

Do this **off the main actor**, in the model, not in `body`:

```swift
@MainActor
@Observable
final class StepChartModel {
    private(set) var plotted: [StepSample] = []

    private let samples: any StepSampleLoading

    init(samples: any StepSampleLoading) { self.samples = samples }

    func load(pointBudget: Int = 400) async {
        // The load and the downsample both happen off the main actor. `body`
        // must never compute this — it runs on every layout pass.
        plotted = await samples.recent().downsampled(to: pointBudget)
    }
}
```

Other things that matter at scale:

- **`.drawingGroup()`** flattens the chart into a single Metal layer. It helps
  with thousands of marks and *hurts* with dozens — measure before adding it.
- **Scrolling windows**: `.chartScrollableAxes(.horizontal)` plus
  `.chartXVisibleDomain(length:)` keeps the plotted set bounded while the user
  pans (iOS 17+).
- **`RectangleMark` beats `BarMark`** for dense heatmap-style data — fewer
  layout passes per mark.

---

## Anti-Patterns

```swift
// WRONG — ForEach over indices.
// Identity is positional, so on every reload SwiftUI animates bar 3 into bar 4
// and the chart visibly scrambles.
Chart { ForEach(0..<samples.count, id: \.self) { i in BarMark(…, y: .value("", samples[i].steps)) } }

// RIGHT — stable identity from the model.
Chart(samples) { sample in BarMark(…) }
```

```swift
// WRONG — a bar chart with a truncated y-axis.
// A 3% difference is rendered as a 300% one. This is the single most common way
// a chart lies.
.chartYScale(domain: 9_500...10_000)

// RIGHT — bars are read as area, so the baseline must be zero.
.chartYScale(domain: .automatic(includesZero: true))
```

```swift
// WRONG — a property name as the axis label.
// It is user-facing and read aloud by VoiceOver. "stepCount" is not a word.
x: .value("stepCount", sample.steps)

// RIGHT
x: .value(String(localized: "Steps"), sample.steps)
```

```swift
// WRONG — meaning encoded by hue alone.
// Unreadable to roughly 8% of men, and to anyone who prints it.
.foregroundStyle(sample.isOverBudget ? .red : .green)

// RIGHT — a second channel carries the same information.
.foregroundStyle(by: .value(String(localized: "Status"), sample.status))
.symbol(by: .value(String(localized: "Status"), sample.status))
```

```swift
// WRONG — a fixed width.
// Breaks on every device it was not designed on, and clips inside a ScrollView.
.frame(width: 350, height: 200)

// RIGHT — height is a design decision; width belongs to the layout.
.frame(height: 200)
```

```swift
// WRONG — filtering or downsampling inside body.
// body runs on every layout pass, on the main actor. This is the hitch.
Chart(allSamples.filter { $0.day > cutoff }.sorted { … }) { … }

// RIGHT — the model prepares the data; body renders it.
Chart(model.plotted) { … }
```

```swift
// WRONG — plotting the raw dataset and hoping.
// There is no virtualisation. 50,000 marks drops frames and shows no more
// information than 400 does at that pixel width.
Chart(fiftyThousandSamples) { … }

// RIGHT
Chart(samples.downsampled(to: 400)) { … }
```

```swift
// WRONG — stride-sampling to reduce points.
// Deletes the spike the user opened the chart to look at.
let reduced = samples.enumerated().filter { $0.offset % 100 == 0 }.map(\.element)

// RIGHT — peak-preserving downsampling.
let reduced = samples.downsampled(to: 400)
```

```swift
// WRONG — no accessibility at all.
// A chart is a picture of numbers. Without a descriptor, VoiceOver gets the
// picture and none of the numbers.
Chart(samples) { BarMark(…) }

// RIGHT
Chart(samples) { BarMark(…) }
    .accessibilityChartDescriptor(StepChartDescriptor(samples: samples))
```

```swift
// WRONG — a descriptor attached but never updated.
// updateChartDescriptor that does nothing leaves VoiceOver reading the dataset
// from two loads ago, which is worse than no descriptor.
func updateChartDescriptor(_ descriptor: AXChartDescriptor) { }

// RIGHT
func updateChartDescriptor(_ descriptor: AXChartDescriptor) {
    descriptor.series = makeChartDescriptor().series
}
```

```swift
// WRONG — a chart with no empty state.
// Zero marks renders as blank axes, which reads as a broken screen.
Chart(samples) { … }

// RIGHT
if samples.isEmpty { ContentUnavailableView(…) } else { Chart(samples) { … } }
```

```swift
// WRONG — .drawingGroup() applied reflexively.
// It costs an offscreen render pass. On a 12-bar chart it is a regression.
Chart(twelveBars) { … }.drawingGroup()

// RIGHT — add it only after measuring, and only at thousands of marks.
```

```swift
// WRONG — SectorMark guarded at iOS 16.
// It does not exist before iOS 17; this does not compile against an iOS 16
// minimum, and guarding it at the wrong version drops working devices.
SectorMark(angle: .value("Share", slice.value))

// RIGHT
if #available(iOS 17, *) { SectorMark(angle: …) } else { BarMark(…) }
```

---

## Checklist

- [ ] Marks keyed by stable `Identifiable` identity, never by index
- [ ] Bar and area charts include zero in the y domain
- [ ] Axis labels localized — they are read aloud
- [ ] Meaning carried by more than hue (symbol, dash, or label)
- [ ] Colours from tokens; adapts in dark mode
- [ ] `.frame(height:)` only
- [ ] No filtering, sorting, or downsampling in `body`
- [ ] Datasets over ~500 points downsampled peak-preservingly, off the main actor
- [ ] `AXChartDescriptor` attached, and `updateChartDescriptor` actually updates
- [ ] Decorative marks hidden from the accessibility tree
- [ ] Axis density reduces at accessibility text sizes
- [ ] An empty state that is not blank axes
- [ ] iOS 17+ API (`SectorMark`, selection, scrolling) guarded at **17**, not 26
- [ ] `#Preview` for loaded, empty, single-point, and dark mode
