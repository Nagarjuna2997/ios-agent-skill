# iOS UI component map

Use this map to choose a native implementation and the relevant Apple design guidance. The links point to Apple; the API examples and notes are a repository-authored navigation aid. The [complete Apple component index](https://developer.apple.com/design/human-interface-guidelines/components) includes platform-specific entries beyond iOS. A listed component is not a guarantee that an API or variant is available on every OS version or that it appears in the local gallery.

## Foundations

| Need | Apple guidance | Implementation direction |
|---|---|---|
| Layout, spacing and adaptation | [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | Use stacks, grids, safe areas and adaptive containers; test compact and regular widths. |
| Color and appearance | [Color](https://developer.apple.com/design/human-interface-guidelines/color) | Prefer semantic foreground/background styles; check light, dark and increased contrast. |
| Text and readability | [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | Use semantic text styles and allow Dynamic Type and localization to reflow. |
| Materials | [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Use system materials and controls; check availability before custom Liquid Glass. |
| Motion and interaction | [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) · [Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures) | Give feedback with a purpose; honor Reduce Motion and provide accessible alternatives. |
| Inclusion | [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) · [VoiceOver](https://developer.apple.com/design/human-interface-guidelines/voiceover) | Keep labels, reading order and controls usable with assistive technologies. |
| Symbols and icons | [SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) · [App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons) | Use system symbols in code and obtain design resources from Apple. |

## Content and layout

| UI | Apple guidance | Common SwiftUI route |
|---|---|---|
| Text, labels and images | [Text views](https://developer.apple.com/design/human-interface-guidelines/text-views) · [Labels](https://developer.apple.com/design/human-interface-guidelines/labels) · [Image views](https://developer.apple.com/design/human-interface-guidelines/image-views) | `Text`, `Label`, `Image` |
| Charts | [Charts](https://developer.apple.com/design/human-interface-guidelines/charts) | Swift Charts; account for accessible descriptions. |
| Lists and collections | [Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) · [Collections](https://developer.apple.com/design/human-interface-guidelines/collections) | `List`, `ForEach`, grids |
| Groups and disclosure | [Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls) | `Section`, `DisclosureGroup` |
| Scrolling | [Scroll views](https://developer.apple.com/design/human-interface-guidelines/scroll-views) | `ScrollView` |
| Web content | [Web views](https://developer.apple.com/design/human-interface-guidelines/web-views) | Choose a supported web presentation and check target availability. |

## Navigation, actions and presentation

| UI | Apple guidance | Common SwiftUI route |
|---|---|---|
| Hierarchical navigation | [Navigation and search](https://developer.apple.com/design/human-interface-guidelines/navigation-and-search) | `NavigationStack`, `NavigationLink` |
| iPad sidebar and detail | [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars) · [Split views](https://developer.apple.com/design/human-interface-guidelines/split-views) | `NavigationSplitView`; test collapsed and expanded layouts. |
| Tabs | [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) · [Tab views](https://developer.apple.com/design/human-interface-guidelines/tab-views) | `TabView` |
| Search | [Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields) · [Searching](https://developer.apple.com/design/human-interface-guidelines/searching) | `searchable` |
| Buttons and menus | [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) · [Menus](https://developer.apple.com/design/human-interface-guidelines/menus) · [Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus) | `Button`, `Menu`, `contextMenu` |
| Toolbar actions | [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars) | `toolbar`, `ToolbarItem` |
| Sharing | [Activity views](https://developer.apple.com/design/human-interface-guidelines/activity-views) | `ShareLink` when appropriate. |
| Alerts and choices | [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) · [Action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets) | `alert`, `confirmationDialog` |
| Sheets and popovers | [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) · [Popovers](https://developer.apple.com/design/human-interface-guidelines/popovers) | `sheet`, `popover`; support a clear dismissal path. |

## Selection, entry and status

| UI | Apple guidance | Common SwiftUI route |
|---|---|---|
| Text and password entry | [Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) · [Virtual keyboards](https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards) | `TextField`, `SecureField`, `TextEditor`; choose appropriate input traits. |
| Toggle | [Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles) | `Toggle` |
| Options and segmented controls | [Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers) · [Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls) | `Picker` and an appropriate picker style. |
| Slider and stepper | [Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders) · [Steppers](https://developer.apple.com/design/human-interface-guidelines/steppers) | `Slider`, `Stepper`; expose values accessibly. |
| Date and color | [Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers) · [Color wells](https://developer.apple.com/design/human-interface-guidelines/color-wells) | `DatePicker`, `ColorPicker` |
| Progress and gauges | [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) · [Gauges](https://developer.apple.com/design/human-interface-guidelines/gauges) | `ProgressView`, `Gauge` |
| Loading, empty and error | [Loading](https://developer.apple.com/design/human-interface-guidelines/loading) · [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) | Model distinct states; use `ContentUnavailableView` where supported and provide recovery. |

## System experiences and input

For widgets, notifications, Live Activities, Home Screen and Lock Screen, start with Apple's [system experiences](https://developer.apple.com/design/human-interface-guidelines/system-experiences), [Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets) and [Live Activities](https://developer.apple.com/design/human-interface-guidelines/live-activities). These require their own app extensions or system APIs; a design template alone does not implement them. See Apple's [inputs](https://developer.apple.com/design/human-interface-guidelines/inputs), [patterns](https://developer.apple.com/design/human-interface-guidelines/patterns) and [technologies](https://developer.apple.com/design/human-interface-guidelines/technologies) indexes for additional areas including Pencil, keyboard, onboarding, Apple Pay, Wallet and Sign in with Apple.

For a cross-platform or older deployment target, check the actual HIG page and installed SDK for each specific API. The kit's version is not the introduction version of all of its controls. Refer to the repository's [compatibility matrix](../../compatibility-matrix.md) and [gallery coverage](../../../samples/IOSUIPack/README.md).
