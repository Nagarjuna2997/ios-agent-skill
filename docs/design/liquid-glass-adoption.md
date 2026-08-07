# Adopting Liquid Glass

**Load this when:** rebuilding an existing app against the iOS 26 SDK or later,
auditing an interface after the rebuild, or deciding whether to take the new
look at all.

**This is the migration half.** For applying the material to a custom view —
`glassEffect`, `GlassEffectContainer`, the availability guard, the fallback —
see `docs/design/design-tokens.md` §4. That document is about opting *in* on a
view you own. This one is about what happens to the app you already shipped.

---

## 1. The decision you make before writing any code

Rebuilding against the iOS 26 SDK **adopts the new design automatically**.
Standard components from SwiftUI, UIKit, and AppKit pick up Liquid Glass with no
code change. That is the whole point, and it is also the risk: an app you have
not re-audited ships a changed interface.

There is one escape hatch:

```xml
<!-- Info.plist -->
<key>UIDesignRequiresCompatibility</key>
<true/>
```

This keeps the app looking as it did when built against the previous SDK, while
still letting you build with the current one.

**Treat it as a stopgap, not a decision.** It buys a release cycle to do the
audit properly; it does not remove the work. An app frozen on the compatibility
key looks progressively more dated as the rest of the system moves, and Apple
has historically retired these keys. Set a date to remove it.

| Situation | Do this |
|---|---|
| You can audit the interface this cycle | Rebuild, adopt, work through §2–§7 |
| You must ship urgently and cannot audit | `UIDesignRequiresCompatibility`, with a tracked removal date |
| You are on the previous SDK entirely | Nothing yet — but the audit list still tells you what to expect |

---

## 2. What changes with no code, and what you must audit

The rule that decides most of the work: **the system now owns the background of
controls and navigation.** Custom backgrounds you added to those elements do not
merely look dated — they sit on top of Liquid Glass and the scroll edge effect
and interfere with both.

Audit and, in most cases, delete custom backgrounds on:

- `NavigationStack`, `NavigationSplitView`, and split-view columns
- toolbars (`toolbar(content:)`) and title bars
- tab bars
- sheets and popovers — including any `visualEffect` view you put behind popover
  content, which is now duplicated work

```swift
// WRONG — a hand-rolled bar background, from before the system provided one.
// It overlays Liquid Glass and defeats the scroll edge effect, so content
// scrolling underneath loses the contrast the system would have given it.
.toolbarBackground(Color.appSurface, for: .navigationBar)
.toolbarBackground(.visible, for: .navigationBar)

// RIGHT — let the system decide. It adapts to overlap, focus, and scroll
// position in ways a static color cannot.
// (no modifier)
```

**Do not hard-code control metrics.** Controls adopt rounder, larger forms, and
an extra-large size option. Standard controls resize themselves; a control with
a pinned `.frame(width:height:)` will not, and will sit wrong next to the ones
that did.

---

## 3. Scroll edge effect

Scroll views obscure content passing beneath bars so controls stay legible.
System bars get this for free. **A custom bar does not** — it gets content
sliding under it at full contrast.

```swift
// A custom bottom bar. Register it so the system applies the scroll edge
// effect, rather than leaving your controls to fight the content behind them.
ScrollView {
    ArticleList(articles: model.articles)
}
.safeAreaBar(edge: .bottom) {
    PlaybackControls(model: model)
}
```

Use `scrollEdgeEffectStyle(_:for:)` when you need to choose the style rather
than accept the default.

---

## 4. Navigation

Navigation is the layer Liquid Glass lives in, so the separation between
navigation and content has to be real. If your content and your chrome are
interleaved, the new material has nothing coherent to float above.

```swift
// Tab bar that becomes a sidebar where there is room for one.
TabView {
    Tab("Library", systemImage: "books.vertical") { LibraryScreen() }
    Tab("Browse", systemImage: "square.grid.2x2") { BrowseScreen() }

    // The SEARCH ROLE, not a tab that happens to contain search. The system
    // pulls it to the trailing end and styles it as search — matching where
    // users have learned to look for it in every other app.
    Tab(role: .search) { SearchScreen() }
}
.tabViewStyle(.sidebarAdaptable)

// Let the tab bar recede while reading, and come back on the reverse scroll.
.tabBarMinimizeBehavior(.onScrollDown)
```

**Background extension** makes a hero image read as continuing beneath a
sidebar or inspector, without actually placing content under it — the system
mirrors and blurs the adjacent content so the sidebar stays legible:

```swift
NavigationSplitView {
    LibrarySidebar(selection: $selection)
} detail: {
    ScrollView {
        HeroImage(article: article)
            .backgroundExtensionEffect()
        ArticleBody(article: article)
    }
}
```

After adding either, **check the safe areas of the content beside the sidebar
and inspector** — that is where "peeking through" either works or clips.

---

## 5. Toolbars and menus

Toolbar items now group, and the grouping is meaningful: items sharing a
background read as related.

```swift
.toolbar {
    ToolbarItemGroup(placement: .primaryAction) {
        Button("Bookmark", systemImage: "bookmark") { model.bookmark() }
        Button("Share", systemImage: "square.and.arrow.up") { model.share() }
    }

    // Separates groups that must not read as one control.
    ToolbarSpacer(.fixed, placement: .primaryAction)

    ToolbarItem(placement: .primaryAction) {
        Button("Delete", systemImage: "trash", role: .destructive) { model.delete() }
    }
}
```

Three rules that are easy to get wrong:

- **Do not mix text and icons inside one group.** Across items sharing a
  background it reads as an inconsistency, not a distinction.
- **Every icon-only item needs an accessibility label**, regardless of what is
  on screen. Someone using VoiceOver or Voice Control gets nothing from the
  glyph. `review_swiftui` and `audit_app_store_readiness` both flag this.
- **Hide the item, not its content.** A toolbar item whose *view* is hidden
  leaves an empty slot the system still lays out.

```swift
// WRONG — an empty toolbar item the system reserves space for.
ToolbarItem { if canEdit { EditButton() } }

// RIGHT — the item itself goes away.
ToolbarItem { EditButton() }
    .hidden(!canEdit)
```

---

## 6. Controls and shape

Reach for the built-in glass button styles before building anything custom:

```swift
Button("Continue") { model.advance() }
    .buttonStyle(.glass)

Button("Buy Now") { model.purchase() }
    .buttonStyle(.glassProminent)
```

Nested shapes should be **concentric** with their container — the hardware's
corner radius informs the whole chain of rounded elements:

```swift
// Concentric with whatever contains it, rather than a guessed radius that
// looks subtly wrong at one screen size and badly wrong at another.
CardContent(article: article)
    .clipShape(ConcentricRectangle())
```

**Be sparing with colour on controls and navigation.** Colour on a glass surface
costs legibility. When you do use it, use a system colour or a custom one with
light, dark, and increased-contrast variants — the same rule as every other
token in `docs/design/design-tokens.md`.

---

## 7. Lists, forms, and a silent text change

Rows and sections gained height, padding, and corner radius. The change that
bites is quieter:

**Section headers are now title-case, not upper-case.** The system no longer
force-capitalises them. A header you wrote as `"recently played"` — relying on
the old behaviour to render `RECENTLY PLAYED` — now renders exactly as written.

```swift
// WRONG — depended on the system shouting it for you.
Section("recently played") { … }

// RIGHT — write the capitalisation you want to see.
Section("Recently Played") { … }
```

Grep for lowercase `Section(` string literals. Nothing warns about this; it just
ships.

---

## 8. App icons

Icons are now layered, and the system applies reflection, refraction, shadow,
blur, and highlights across light, dark, clear, and tinted variants.

- **Separate your artwork into foreground / middle / background layers.**
- **Do not bake in effects.** Shadows and blurs you paint yourself get composited
  on top of the system's, and the result is muddy.
- Prefer solid, filled, overlapping semi-transparent shapes over fine detail.
- Compose in **Icon Composer** (ships with Xcode; also on Apple Design
  Resources), which previews the system effects and appearance variants.
- Keep elements centred — the system masks to a rounded rectangle on
  iOS/iPadOS/macOS and a circle on watchOS. An irregular icon gets a
  system-provided background.

---

## 9. Test matrix

Liquid Glass adapts to user settings, and those settings remove or change the
effects you designed around. Standard components adapt on their own; **anything
custom is yours to verify.**

| Setting | What to check |
|---|---|
| Reduce Transparency | Custom glass surfaces stay legible when the blur is gone |
| Reduce Motion | Morphing and fluid transitions degrade to something sensible |
| Increase Contrast | Custom colours still meet contrast against a glass background |
| Dark mode | Every custom surface and colour pairing |
| Accessibility text sizes | Controls and bars reflow rather than clip |
| The user's Liquid Glass appearance preference | Custom elements follow it |

Per platform:

- **watchOS** — changes are minimal and appear even without rebuilding. Adopt
  the watchOS 10 toolbar APIs and standard button styles to pick them up.
- **tvOS** — controls take on glass **when focused**. Adopt the standard focus
  APIs (`focusable(_:)`, `isFocused`) so custom controls match. Only Apple TV 4K
  (2nd generation) and newer render the effects; older devices keep the current
  appearance, which is a fallback you do not have to write.
- **iPadOS** — windows resize continuously to a minimum size rather than
  snapping between presets. See `docs/tooling/device-hub.md`; rebuilding against
  the iOS 27 SDK also opts you into resizability.

---

## Anti-Patterns

```swift
// WRONG — glass on every custom control in the app.
// The material exists to draw attention to content. Applied everywhere it
// competes with the content and flattens the hierarchy it was meant to create.
ForEach(filters) { filter in
    FilterChip(filter).glassEffect()
}

// RIGHT — reserve it for the few genuinely functional elements.
```

```swift
// WRONG — separate glass effects stacked next to each other.
// Each is its own render pass, and they will not morph into one another.
HStack {
    BackButton().glassEffect()
    PlayButton().glassEffect()
}

// RIGHT — one container, so they blend and merge.
GlassEffectContainer(spacing: Space.tight) {
    HStack {
        BackButton().glassEffect().glassEffectID("back", in: namespace)
        PlayButton().glassEffect().glassEffectID("play", in: namespace)
    }
}
```

```swift
// WRONG — an action sheet with no source.
// It now originates from the control that triggered it. With no anchor it
// appears detached from the thing it acts on.
.confirmationDialog("Delete?", isPresented: $isConfirming) { … }

// RIGHT — anchor it to its source so the relationship is visible.
.confirmationDialog("Delete?", isPresented: $isConfirming, presenting: item) { … }
```

```swift
// WRONG — shipping UIDesignRequiresCompatibility with no removal plan.
// It is a deferral. Left in place the app drifts further from the system every
// release, and the audit it postponed only grows.

// RIGHT — set it, file the work, remove it next cycle.
```

```swift
// WRONG — assuming every adoption API shares one availability floor.
// Liquid Glass arrived in iOS 26, but these APIs did not all land together.
// A blanket #available(iOS 26, *) around a symbol introduced later fails to
// compile; one at iOS 27 around an iOS 26 symbol silently drops every iOS 26
// device to the fallback — the mistake this skill flags most often.
if #available(iOS 26, *) { /* every new API */ }

// RIGHT — check each symbol's own floor in Xcode's documentation and guard on
// THAT version. `check_availability_guards` catches the over-restrictive case.
```

---

## Checklist

- [ ] Rebuilt against the current SDK and reviewed every screen
- [ ] `UIDesignRequiresCompatibility` either absent, or present with a removal date
- [ ] Custom backgrounds removed from bars, split views, sheets, popovers
- [ ] No hard-coded control metrics
- [ ] Custom bars registered for the scroll edge effect (`safeAreaBar`)
- [ ] Navigation clearly separated from content
- [ ] Search uses `Tab(role: .search)`, not an ordinary tab
- [ ] Toolbar items grouped meaningfully; `ToolbarSpacer` between unrelated groups
- [ ] No group mixing text and icon items
- [ ] Every icon-only control has an accessibility label
- [ ] Hidden toolbar items hide the item, not the view
- [ ] Section headers written in the capitalisation you want to see
- [ ] Nested shapes concentric with their containers
- [ ] Glass reserved for the few most important elements
- [ ] Multiple glass elements share one `GlassEffectContainer`
- [ ] App icon rebuilt as layers in Icon Composer, with no baked-in effects
- [ ] Verified under Reduce Transparency, Reduce Motion, Increase Contrast, dark
      mode, and accessibility text sizes
- [ ] Each new API guarded on **its own** introduction version
