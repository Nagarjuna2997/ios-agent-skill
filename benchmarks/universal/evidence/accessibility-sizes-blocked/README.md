# Accessibility text sizes — incomplete local verification

The experimental harness now exercises accessibility1 through accessibility5, native static-text semantics, width bounds, clipping audits, restoration to Large, and longer-content reflow at accessibility5. Controls remain outside a scrolling text region. This changes only the explicitly launched test harness, not ordinary app rendering or the production generator.

The local Xcode 27 / iOS 27 build reached native test execution, but the filesystem exhausted free space (ENOSPC). The run was interrupted and only its dedicated disposable simulator was removed. No test pass is claimed. The attached log and executed-test.swift preserve that incomplete attempt. The final source additionally contains the independent review's stronger AX5 settling/reflow assertions; those final assertions have NOT been executed.

Re-run the LiveTextUpdateTests target on a supported Mac with sufficient free disk, retain xcresult screenshots, and require both tests to pass before using these checks as evidence. This test uses programmatic SwiftUI Dynamic Type environment changes, not Settings changes or manual VoiceOver evaluation. Hosted 14-test results elsewhere predate these additions and do not verify them. No baseline promotion, production integration, merge or publication is authorized.
