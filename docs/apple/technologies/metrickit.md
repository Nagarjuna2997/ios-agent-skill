# MetricKit

## Context

Load this when a task names **MetricKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/metrickit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Measure your app’s performance using daily metric and diagnostic reports from real users.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MetricKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.0 | — | No |
| iPadOS | 13.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 12.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Monitoring app performance with MetricKit](https://developer.apple.com/documentation/metrickit/monitoring-app-performance-with-metrickit)
- [Analyzing app performance with MetricKit](https://developer.apple.com/documentation/metrickit/analyzing-app-performance-with-metrickit)
- [Track performance by app state using MetricKit](https://developer.apple.com/documentation/metrickit/track-performance-by-app-state-using-metrickit)
- [MetricKit updates](https://developer.apple.com/documentation/updates/metrickit)

### Performance improvements

- [Improving your app’s performance](https://developer.apple.com/documentation/xcode/improving-your-app-s-performance)

### Metric and diagnostic reports

- [MetricManager](https://developer.apple.com/documentation/metrickit/metricmanager)
- [MetricReport](https://developer.apple.com/documentation/metrickit/metricreport)
- [DiagnosticReport](https://developer.apple.com/documentation/metrickit/diagnosticreport)

### Result types

- [MetricResult](https://developer.apple.com/documentation/metrickit/metricresult)
- [MetricGroup](https://developer.apple.com/documentation/metrickit/metricgroup)
- [DiagnosticResult](https://developer.apple.com/documentation/metrickit/diagnosticresult)

### Time-in-use metrics

- [TotalForegroundTimeMetric](https://developer.apple.com/documentation/metrickit/totalforegroundtimemetric)
- [TotalBackgroundTimeMetric](https://developer.apple.com/documentation/metrickit/totalbackgroundtimemetric)
- [TotalBackgroundAudioTimeMetric](https://developer.apple.com/documentation/metrickit/totalbackgroundaudiotimemetric)
- [TotalBackgroundLocationTimeMetric](https://developer.apple.com/documentation/metrickit/totalbackgroundlocationtimemetric)
- [LocationActivityTimeMetric](https://developer.apple.com/documentation/metrickit/locationactivitytimemetric)
- [CellularConditionTimeMetric](https://developer.apple.com/documentation/metrickit/cellularconditiontimemetric)

### Launch and responsiveness metrics

- [TimeToFirstDrawMetric](https://developer.apple.com/documentation/metrickit/timetofirstdrawmetric)
- [OptimizedTimeToFirstDrawMetric](https://developer.apple.com/documentation/metrickit/optimizedtimetofirstdrawmetric)
- [ApplicationResumeTimeMetric](https://developer.apple.com/documentation/metrickit/applicationresumetimemetric)
- [ExtendedLaunchMetric](https://developer.apple.com/documentation/metrickit/extendedlaunchmetric)
- [HangTimeMetric](https://developer.apple.com/documentation/metrickit/hangtimemetric)
- [HitchTimeMetric](https://developer.apple.com/documentation/metrickit/hitchtimemetric)

### CPU and memory metrics

- [CPUTimeMetric](https://developer.apple.com/documentation/metrickit/cputimemetric)
- [CPUInstructionsCountMetric](https://developer.apple.com/documentation/metrickit/cpuinstructionscountmetric)
- [CPUExceptionDiagnostic](https://developer.apple.com/documentation/metrickit/cpuexceptiondiagnostic)
- [PeakMemoryMetric](https://developer.apple.com/documentation/metrickit/peakmemorymetric)
- [SuspendedMemoryMetric](https://developer.apple.com/documentation/metrickit/suspendedmemorymetric)
- [MemoryExceptionDiagnostic](https://developer.apple.com/documentation/metrickit/memoryexceptiondiagnostic)

### GPU and display metrics

- [GPUTimeMetric](https://developer.apple.com/documentation/metrickit/gputimemetric)
- [MetalFrameRateMetric](https://developer.apple.com/documentation/metrickit/metalframeratemetric)
- [PixelLuminanceMetric](https://developer.apple.com/documentation/metrickit/pixelluminancemetric)
- [AveragePixelLuminance](https://developer.apple.com/documentation/metrickit/averagepixelluminance)

### Network metrics

- [TotalWiFiUploadMetric](https://developer.apple.com/documentation/metrickit/totalwifiuploadmetric)
- [TotalWiFiDownloadMetric](https://developer.apple.com/documentation/metrickit/totalwifidownloadmetric)
- [TotalCellularUploadMetric](https://developer.apple.com/documentation/metrickit/totalcellularuploadmetric)
- [TotalCellularDownloadMetric](https://developer.apple.com/documentation/metrickit/totalcellulardownloadmetric)

### Disk metrics

- [LogicalDiskWritesMetric](https://developer.apple.com/documentation/metrickit/logicaldiskwritesmetric)
- [DiskWriteExceptionDiagnostic](https://developer.apple.com/documentation/metrickit/diskwriteexceptiondiagnostic)
- [TotalDiskSpaceCapacityMetric](https://developer.apple.com/documentation/metrickit/totaldiskspacecapacitymetric)
- [TotalFileCountMetric](https://developer.apple.com/documentation/metrickit/totalfilecountmetric)
- [TotalFileSizeMetric](https://developer.apple.com/documentation/metrickit/totalfilesizemetric)

### Termination metrics

- [ForegroundTerminationMetric](https://developer.apple.com/documentation/metrickit/foregroundterminationmetric)
- [BackgroundTerminationMetric](https://developer.apple.com/documentation/metrickit/backgroundterminationmetric)

### Signpost and custom metrics

- [SignpostIntervalMetric](https://developer.apple.com/documentation/metrickit/signpostintervalmetric)
- [mxSignpost(_:dso:log:name:signpostID:_:_:)](https://developer.apple.com/documentation/metrickit/mxsignpost(_:dso:log:name:signpostid:_:_:))
- [mxSignpostAnimationIntervalBegin(dso:log:name:signpostID:_:_:)](https://developer.apple.com/documentation/metrickit/mxsignpostanimationintervalbegin(dso:log:name:signpostid:_:_:))

### Crash and hang diagnostics

- [CrashDiagnostic](https://developer.apple.com/documentation/metrickit/crashdiagnostic)
- [HangDiagnostic](https://developer.apple.com/documentation/metrickit/hangdiagnostic)
- [AppLaunchDiagnostic](https://developer.apple.com/documentation/metrickit/applaunchdiagnostic)

### App state reporting

- [StateReportingDomain](https://developer.apple.com/documentation/metrickit/statereportingdomain)
- [LaunchTaskID](https://developer.apple.com/documentation/metrickit/launchtaskid)

### Call stack data

- [CallStackTree](https://developer.apple.com/documentation/metrickit/callstacktree)
- [CallStackThread](https://developer.apple.com/documentation/metrickit/callstackthread)
- [CallStackFrame](https://developer.apple.com/documentation/metrickit/callstackframe)
- [SignpostRecord](https://developer.apple.com/documentation/metrickit/signpostrecord)

### Supporting types

- [Histogram](https://developer.apple.com/documentation/metrickit/histogram)
- [AverageStatistics](https://developer.apple.com/documentation/metrickit/averagestatistics)
- [SignalBars](https://developer.apple.com/documentation/metrickit/signalbars)
- [HitchTimeRatio](https://developer.apple.com/documentation/metrickit/hitchtimeratio)
- [OSVersion](https://developer.apple.com/documentation/metrickit/osversion)

### MXMetricManager API

- [MXMetricManager API](https://developer.apple.com/documentation/metrickit/mxmetricmanager-api)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
