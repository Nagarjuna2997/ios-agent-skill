# iOS Font Catalog — Ultimate Reference

> The definitive font reference for iOS and SwiftUI development.
> Every font name listed here is the exact string to use in `Font.custom()` or `UIFont(name:size:)`.

---

## Table of Contents

1. [Apple System Fonts](#1-apple-system-fonts)
2. [Built-in iOS Fonts](#2-built-in-ios-fonts)
3. [Google Fonts — Top 100 for iOS](#3-google-fonts--top-100-for-ios)
4. [How to Add Custom Fonts to iOS](#4-how-to-add-custom-fonts-to-ios)
5. [Font Pairing Recommendations](#5-font-pairing-recommendations)
6. [Font Management Utilities](#6-font-management-utilities)
7. [Variable Fonts](#7-variable-fonts)

---

## 1. Apple System Fonts

Apple provides a family of proprietary system fonts that are optimized for every Apple platform.
These fonts are accessed through the SwiftUI `.system()` modifier and cannot be referenced by
PostScript name in `Font.custom()`. They are available on-device without bundling.

### SF Pro — The Default System Font

SF Pro is the default sans-serif used across iOS, iPadOS, macOS, and tvOS.
The system automatically selects **SF Pro Text** for sizes below 20pt and
**SF Pro Display** for sizes at 20pt and above. You never need to handle this manually.

**All Weights:**

| Weight      | UIFont.Weight    | SwiftUI              |
|-------------|------------------|----------------------|
| Ultra Light | `.ultraLight`    | `.ultraLight`        |
| Thin        | `.thin`          | `.thin`              |
| Light       | `.light`         | `.light`             |
| Regular     | `.regular`       | `.regular`           |
| Medium      | `.medium`        | `.medium`            |
| Semibold    | `.semibold`      | `.semibold`          |
| Bold        | `.bold`          | `.bold`              |
| Heavy       | `.heavy`         | `.heavy`             |
| Black       | `.black`         | `.black`             |

**SwiftUI Examples:**

```swift
// Default system font at various text styles
Text("Headline").font(.headline)
Text("Body text").font(.body)
Text("Caption").font(.caption)

// Explicit size and weight
Text("Custom").font(.system(size: 24, weight: .bold))
Text("Light text").font(.system(size: 16, weight: .light))
Text("Heavy text").font(.system(size: 32, weight: .heavy))

// Using text style with weight
Text("Title").font(.system(.title, weight: .semibold))
Text("Footnote").font(.system(.footnote, weight: .medium))
```

**UIKit Examples:**

```swift
let headline = UIFont.systemFont(ofSize: 24, weight: .bold)
let body = UIFont.systemFont(ofSize: 17, weight: .regular)
let caption = UIFont.systemFont(ofSize: 12, weight: .light)
let preferredBody = UIFont.preferredFont(forTextStyle: .body)
```

### SF Pro Display vs SF Pro Text

The system handles optical size switching automatically:

- **SF Pro Text**: Optimized for sizes below 20pt. Slightly wider letter spacing, more open counters for legibility at small sizes.
- **SF Pro Display**: Optimized for sizes 20pt and above. Tighter spacing, refined details that shine at large sizes.

You do NOT need to select these manually. The system font API handles the switch.

```swift
// The system chooses Text or Display automatically based on size
Text("Small").font(.system(size: 14))   // Uses SF Pro Text
Text("Large").font(.system(size: 28))   // Uses SF Pro Display
```

### SF Pro Rounded

A rounded variant of SF Pro with softer terminals. Great for friendly, approachable UIs,
settings screens, and apps aimed at younger audiences.

```swift
// SwiftUI — Rounded design
Text("Rounded").font(.system(size: 20, weight: .bold, design: .rounded))
Text("Rounded body").font(.system(.body, design: .rounded))
Text("Rounded title").font(.system(.title, design: .rounded, weight: .semibold))
Text("Rounded caption").font(.system(.caption, design: .rounded, weight: .medium))

// UIKit — Rounded design
let descriptor = UIFont.systemFont(ofSize: 20, weight: .bold).fontDescriptor
    .withDesign(.rounded)!
let roundedFont = UIFont(descriptor: descriptor, size: 20)
```

**When to use:** Health apps, children's apps, casual games, notification badges, friendly onboarding flows, Apple Fitness-style interfaces.

### SF Mono — Monospaced

The system monospaced font. Every character occupies the same horizontal space.
Essential for code editors, terminal UIs, data tables with aligned numbers, and
countdown timers.

```swift
// SwiftUI — Monospaced design
Text("0123456789").font(.system(size: 16, weight: .regular, design: .monospaced))
Text("func hello()").font(.system(.body, design: .monospaced))
Text("Code block").font(.system(.callout, design: .monospaced, weight: .semibold))

// Monospaced digit (only digits are monospaced, letters are proportional)
Text("$1,234.56").monospacedDigit()

// UIKit
let descriptor = UIFont.systemFont(ofSize: 14, weight: .regular).fontDescriptor
    .withDesign(.monospaced)!
let monoFont = UIFont(descriptor: descriptor, size: 14)
```

**When to use:** Code editors, terminal emulators, data tables, timers, counters, version numbers, financial figures, developer tools.

### SF Compact

Designed for Apple Watch and compact UI contexts. Narrower than SF Pro to fit more
content in constrained spaces.

```swift
// watchOS uses SF Compact automatically
// On iOS, you can access it through font descriptors if needed
```

**When to use:** watchOS apps (used automatically), widgets, compact UI elements.

### New York — Serif Font

Apple's serif typeface. Available in four optical sizes that the system selects automatically.
Gives an editorial, literary, or premium magazine feel.

**Optical Sizes:**
- **Small**: Optimized for caption and footnote sizes
- **Medium**: Optimized for body text
- **Large**: Optimized for titles and headlines
- **Extra Large**: Optimized for large display text

```swift
// SwiftUI — Serif design
Text("Editorial").font(.system(size: 32, weight: .bold, design: .serif))
Text("Article body").font(.system(.body, design: .serif))
Text("Book title").font(.system(.largeTitle, design: .serif, weight: .black))
Text("Byline").font(.system(.subheadline, design: .serif, weight: .light))
Text("Pull quote").font(.system(.title2, design: .serif, weight: .semibold))

// UIKit
let descriptor = UIFont.systemFont(ofSize: 24, weight: .bold).fontDescriptor
    .withDesign(.serif)!
let serifFont = UIFont(descriptor: descriptor, size: 24)
```

**When to use:** News apps, book readers, editorial content, magazine layouts, Apple News-style interfaces, premium branding, literary apps.

### Width Variants (iOS 16+)

Starting with iOS 16, you can access compressed, condensed, and expanded width variants
of the system font.

```swift
// SwiftUI — Width variants (iOS 16+)
Text("Compressed").font(.system(size: 20, weight: .bold).width(.compressed))
Text("Condensed").font(.system(size: 20, weight: .bold).width(.condensed))
Text("Standard").font(.system(size: 20, weight: .bold).width(.standard))
Text("Expanded").font(.system(size: 20, weight: .bold).width(.expanded))

// Combine with design
Text("Rounded Condensed")
    .font(.system(size: 20, weight: .semibold, design: .rounded).width(.condensed))

// UIKit — Width traits
var traits = UIFontDescriptor.SymbolicTraits()
let descriptor = UIFont.systemFont(ofSize: 20, weight: .bold).fontDescriptor
let condensedDescriptor = descriptor.withSymbolicTraits(.traitCondensed)!
let condensedFont = UIFont(descriptor: condensedDescriptor, size: 20)
```

**Width options:**
| Width        | Description                              |
|--------------|------------------------------------------|
| `.compressed`| Narrowest, fits maximum content          |
| `.condensed` | Narrower than standard                   |
| `.standard`  | Default width                            |
| `.expanded`  | Wider, more spacious letterforms         |

### Complete System Font Design Matrix

```swift
// All four system font designs
Text("Default").font(.system(.title, design: .default))      // SF Pro
Text("Rounded").font(.system(.title, design: .rounded))      // SF Pro Rounded
Text("Serif").font(.system(.title, design: .serif))           // New York
Text("Monospaced").font(.system(.title, design: .monospaced)) // SF Mono
```

### All SwiftUI Text Styles

```swift
Text("Large Title")  .font(.largeTitle)    // 34pt bold
Text("Title")        .font(.title)         // 28pt regular
Text("Title 2")      .font(.title2)        // 22pt regular
Text("Title 3")      .font(.title3)        // 20pt regular
Text("Headline")     .font(.headline)      // 17pt semibold
Text("Subheadline")  .font(.subheadline)   // 15pt regular
Text("Body")         .font(.body)          // 17pt regular
Text("Callout")      .font(.callout)       // 16pt regular
Text("Footnote")     .font(.footnote)      // 13pt regular
Text("Caption")      .font(.caption)       // 12pt regular
Text("Caption 2")    .font(.caption2)      // 11pt regular
```

---

## 2. Built-in iOS Fonts

Every font listed below is preinstalled on iOS. The string shown is the exact PostScript name
to pass to `Font.custom(_:size:)` or `UIFont(name:size:)`.

### Sans-Serif Fonts

#### Helvetica Neue

The classic Swiss typeface. Was the iOS system font before SF Pro (iOS 8 and earlier).

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Ultra Light            | `HelveticaNeue-UltraLight`         |
| Ultra Light Italic     | `HelveticaNeue-UltraLightItalic`   |
| Thin                   | `HelveticaNeue-Thin`               |
| Thin Italic            | `HelveticaNeue-ThinItalic`         |
| Light                  | `HelveticaNeue-Light`              |
| Light Italic           | `HelveticaNeue-LightItalic`        |
| Regular                | `HelveticaNeue`                    |
| Italic                 | `HelveticaNeue-Italic`             |
| Medium                 | `HelveticaNeue-Medium`             |
| Medium Italic          | `HelveticaNeue-MediumItalic`       |
| Bold                   | `HelveticaNeue-Bold`               |
| Bold Italic            | `HelveticaNeue-BoldItalic`         |
| Condensed Bold         | `HelveticaNeue-CondensedBold`      |
| Condensed Black        | `HelveticaNeue-CondensedBlack`     |

```swift
Text("Helvetica Neue").font(.custom("HelveticaNeue", size: 17))
Text("Helvetica Bold").font(.custom("HelveticaNeue-Bold", size: 17))
Text("Helvetica Light").font(.custom("HelveticaNeue-Light", size: 24))
```

**Best for:** Clean UI text, legacy app compatibility, neutral typography.

#### Avenir

A geometric sans-serif with a warm, humanist feel. Excellent readability.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Book                   | `Avenir-Book`                      |
| Book Oblique           | `Avenir-BookOblique`               |
| Roman                  | `Avenir-Roman`                     |
| Oblique                | `Avenir-Oblique`                   |
| Medium                 | `Avenir-Medium`                    |
| Medium Oblique         | `Avenir-MediumOblique`             |
| Heavy                  | `Avenir-Heavy`                     |
| Heavy Oblique          | `Avenir-HeavyOblique`             |
| Black                  | `Avenir-Black`                     |
| Black Oblique          | `Avenir-BlackOblique`              |
| Light                  | `Avenir-Light`                     |
| Light Oblique          | `Avenir-LightOblique`             |

```swift
Text("Avenir Body").font(.custom("Avenir-Book", size: 17))
Text("Avenir Heading").font(.custom("Avenir-Heavy", size: 28))
```

**Best for:** Modern app UIs, lifestyle apps, friendly body text.

#### Avenir Next

The successor to Avenir with improved legibility and a wider weight range.

| Variant                      | Font Name                          |
|------------------------------|------------------------------------|
| Ultra Light                  | `AvenirNext-UltraLight`           |
| Ultra Light Italic           | `AvenirNext-UltraLightItalic`     |
| Regular                      | `AvenirNext-Regular`              |
| Italic                       | `AvenirNext-Italic`               |
| Medium                       | `AvenirNext-Medium`               |
| Medium Italic                | `AvenirNext-MediumItalic`         |
| Demi Bold                    | `AvenirNext-DemiBold`             |
| Demi Bold Italic             | `AvenirNext-DemiBoldItalic`       |
| Bold                         | `AvenirNext-Bold`                 |
| Bold Italic                  | `AvenirNext-BoldItalic`           |
| Heavy                        | `AvenirNext-Heavy`                |
| Heavy Italic                 | `AvenirNext-HeavyItalic`         |

```swift
Text("Avenir Next").font(.custom("AvenirNext-Regular", size: 17))
Text("Avenir Next Bold").font(.custom("AvenirNext-Bold", size: 24))
```

**Best for:** Professional apps, enterprise UIs, presentations, marketing content.

#### Avenir Next Condensed

The condensed variant of Avenir Next. Useful when horizontal space is limited.

| Variant                      | Font Name                               |
|------------------------------|-----------------------------------------|
| Ultra Light                  | `AvenirNextCondensed-UltraLight`        |
| Ultra Light Italic           | `AvenirNextCondensed-UltraLightItalic`  |
| Regular                      | `AvenirNextCondensed-Regular`           |
| Italic                       | `AvenirNextCondensed-Italic`            |
| Medium                       | `AvenirNextCondensed-Medium`            |
| Medium Italic                | `AvenirNextCondensed-MediumItalic`      |
| Demi Bold                    | `AvenirNextCondensed-DemiBold`          |
| Demi Bold Italic             | `AvenirNextCondensed-DemiBoldItalic`    |
| Bold                         | `AvenirNextCondensed-Bold`              |
| Bold Italic                  | `AvenirNextCondensed-BoldItalic`        |
| Heavy                        | `AvenirNextCondensed-Heavy`             |
| Heavy Italic                 | `AvenirNextCondensed-HeavyItalic`       |

```swift
Text("Condensed").font(.custom("AvenirNextCondensed-Bold", size: 20))
```

**Best for:** Navigation bars, tab labels, space-constrained UI, tags, badges.

#### Gill Sans

A classic British humanist sans-serif with distinctive character.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `GillSans`                         |
| Italic                 | `GillSans-Italic`                  |
| Light                  | `GillSans-Light`                   |
| Light Italic           | `GillSans-LightItalic`            |
| Semibold               | `GillSans-SemiBold`               |
| Semibold Italic        | `GillSans-SemiBoldItalic`         |
| Bold                   | `GillSans-Bold`                   |
| Bold Italic            | `GillSans-BoldItalic`             |
| Ultra Bold             | `GillSans-UltraBold`              |

```swift
Text("Gill Sans").font(.custom("GillSans", size: 17))
Text("Gill Sans Bold").font(.custom("GillSans-Bold", size: 24))
```

**Best for:** British branding, classic design, book covers, elegant headings.

#### Futura

A geometric sans-serif icon. Clean circles and triangles form its letterforms.

| Variant                    | Font Name                          |
|----------------------------|------------------------------------|
| Medium                     | `Futura-Medium`                    |
| Medium Italic              | `Futura-MediumItalic`              |
| Bold                       | `Futura-Bold`                      |
| Condensed Medium           | `Futura-CondensedMedium`           |
| Condensed Extra Bold       | `Futura-CondensedExtraBold`        |

```swift
Text("FUTURA").font(.custom("Futura-Bold", size: 32))
Text("Futura body").font(.custom("Futura-Medium", size: 17))
```

**Best for:** Fashion apps, bold statements, modern branding, geometric design systems.

#### Optima

A humanist sans-serif with subtle stroke contrast, straddling serif and sans-serif.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Optima-Regular`                   |
| Italic                 | `Optima-Italic`                    |
| Bold                   | `Optima-Bold`                      |
| Bold Italic            | `Optima-BoldItalic`                |
| Extra Black            | `Optima-ExtraBlack`                |

```swift
Text("Optima").font(.custom("Optima-Regular", size: 17))
```

**Best for:** Wellness apps, spa and beauty branding, elegant body text, high-end retail.

#### Verdana

Designed by Matthew Carter for screen legibility. Wide letterforms, generous x-height.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Verdana`                          |
| Italic                 | `Verdana-Italic`                   |
| Bold                   | `Verdana-Bold`                     |
| Bold Italic            | `Verdana-BoldItalic`               |

```swift
Text("Verdana").font(.custom("Verdana", size: 17))
```

**Best for:** Maximum screen readability, accessible UIs, form labels.

#### Trebuchet MS

A humanist sans-serif designed for web and screen use.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `TrebuchetMS`                      |
| Italic                 | `TrebuchetMS-Italic`               |
| Bold                   | `TrebuchetMS-Bold`                 |
| Bold Italic            | `Trebuchet-BoldItalic`             |

```swift
Text("Trebuchet").font(.custom("TrebuchetMS", size: 17))
```

**Best for:** Web-style UIs, cross-platform consistency.

#### Arial

The ubiquitous sans-serif. Near-identical to Helvetica in metrics.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `ArialMT`                          |
| Italic                 | `Arial-ItalicMT`                   |
| Bold                   | `Arial-BoldMT`                     |
| Bold Italic            | `Arial-BoldItalicMT`              |

```swift
Text("Arial").font(.custom("ArialMT", size: 17))
```

**Best for:** Cross-platform compatibility, documents, web views.

#### Arial Rounded MT Bold

A rounded, friendly variant of Arial.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Bold                   | `ArialRoundedMTBold`               |

```swift
Text("Rounded").font(.custom("ArialRoundedMTBold", size: 20))
```

**Best for:** Friendly UI elements, buttons, badges.

#### Academy Engraved LET

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Plain                  | `AcademyEngravedLetPlain`          |

#### Al Nile

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `AlNile`                           |
| Bold                   | `AlNile-Bold`                      |

#### DIN Alternate / DIN Condensed

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| DIN Alternate Bold     | `DINAlternate-Bold`                |
| DIN Condensed Bold     | `DINCondensed-Bold`                |

```swift
Text("DIN").font(.custom("DINAlternate-Bold", size: 20))
```

**Best for:** Road signs style, technical UIs, data displays, dashboards.

#### Helvetica

The original Helvetica (not Neue).

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Helvetica`                        |
| Italic (Oblique)       | `Helvetica-Oblique`                |
| Light                  | `Helvetica-Light`                  |
| Light Oblique          | `Helvetica-LightOblique`          |
| Bold                   | `Helvetica-Bold`                   |
| Bold Oblique           | `Helvetica-BoldOblique`           |

### Serif Fonts

#### Georgia

A screen-optimized serif with generous proportions.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Georgia`                          |
| Italic                 | `Georgia-Italic`                   |
| Bold                   | `Georgia-Bold`                     |
| Bold Italic            | `Georgia-BoldItalic`               |

```swift
Text("Georgia").font(.custom("Georgia", size: 17))
Text("Georgia Bold").font(.custom("Georgia-Bold", size: 24))
```

**Best for:** Long-form reading, news articles, blog content, editorial apps.

#### Times New Roman

The classic newspaper serif.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `TimesNewRomanPSMT`                |
| Italic                 | `TimesNewRomanPS-ItalicMT`         |
| Bold                   | `TimesNewRomanPS-BoldMT`           |
| Bold Italic            | `TimesNewRomanPS-BoldItalicMT`     |

```swift
Text("Times").font(.custom("TimesNewRomanPSMT", size: 17))
```

**Best for:** Document viewers, academic apps, traditional editorial.

#### Palatino

A Renaissance-inspired serif with wide proportions and excellent readability.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Roman                  | `Palatino-Roman`                   |
| Italic                 | `Palatino-Italic`                  |
| Bold                   | `Palatino-Bold`                    |
| Bold Italic            | `Palatino-BoldItalic`              |

```swift
Text("Palatino").font(.custom("Palatino-Roman", size: 17))
```

**Best for:** Book reading apps, literary content, premium editorial.

#### Baskerville

A transitional serif with sharp contrast and refined details.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Baskerville`                      |
| Italic                 | `Baskerville-Italic`               |
| Semibold               | `Baskerville-SemiBold`             |
| Semibold Italic        | `Baskerville-SemiBoldItalic`       |
| Bold                   | `Baskerville-Bold`                 |
| Bold Italic            | `Baskerville-BoldItalic`           |

```swift
Text("Baskerville").font(.custom("Baskerville", size: 17))
Text("Baskerville Bold").font(.custom("Baskerville-Bold", size: 28))
```

**Best for:** Premium branding, luxury apps, classic literature, legal documents.

#### Didot

A high-contrast modern serif with dramatic thick-thin strokes.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Didot`                            |
| Italic                 | `Didot-Italic`                     |
| Bold                   | `Didot-Bold`                       |

```swift
Text("DIDOT").font(.custom("Didot-Bold", size: 36))
```

**Best for:** Fashion, luxury branding, magazine covers, high-end product displays.

#### Bodoni 72

Another high-contrast modern serif. Multiple optical variants available.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Book                   | `BodoniSvtyTwoITCTT-Book`         |
| Book Italic            | `BodoniSvtyTwoITCTT-BookIta`      |
| Bold                   | `BodoniSvtyTwoITCTT-Bold`         |
| OS Book                | `BodoniSvtyTwoOSITCTT-Book`       |
| OS Book Italic         | `BodoniSvtyTwoOSITCTT-BookIt`     |
| OS Bold                | `BodoniSvtyTwoOSITCTT-Bold`       |
| SC Book                | `BodoniSvtyTwoSCITCTT-Book`       |
| Ornaments              | `BodoniOrnamentsITCTT`             |

```swift
Text("BODONI").font(.custom("BodoniSvtyTwoITCTT-Bold", size: 36))
Text("Small Caps").font(.custom("BodoniSvtyTwoSCITCTT-Book", size: 20))
```

**Best for:** Fashion editorial, luxury branding, poster-style headings, high-contrast display.

#### Charter

A highly legible serif designed for laser printers and screens.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Roman                  | `Charter-Roman`                    |
| Italic                 | `Charter-Italic`                   |
| Bold                   | `Charter-Bold`                     |
| Bold Italic            | `Charter-BoldItalic`               |
| Black                  | `Charter-Black`                    |
| Black Italic           | `Charter-BlackItalic`              |

```swift
Text("Charter").font(.custom("Charter-Roman", size: 17))
```

**Best for:** Long-form reading, documentation, e-books, RSS readers.

#### Iowan Old Style

A refined old-style serif optimized for extended reading on screens.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Roman                  | `IowanOldStyle-Roman`              |
| Italic                 | `IowanOldStyle-Italic`             |
| Bold                   | `IowanOldStyle-Bold`               |
| Bold Italic            | `IowanOldStyle-BoldItalic`         |

```swift
Text("Iowan Old Style").font(.custom("IowanOldStyle-Roman", size: 17))
```

**Best for:** Apple Books-style reading, literary apps, elegant body text.

#### Cochin

An elegant old-style serif.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Cochin`                           |
| Italic                 | `Cochin-Italic`                    |
| Bold                   | `Cochin-Bold`                      |
| Bold Italic            | `Cochin-BoldItalic`                |

#### Superclarendon

A bold slab serif with strong visual impact.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Superclarendon-Regular`           |
| Italic                 | `Superclarendon-Italic`            |
| Light                  | `Superclarendon-Light`             |
| Light Italic           | `Superclarendon-LightItalic`       |
| Bold                   | `Superclarendon-Bold`              |
| Bold Italic            | `Superclarendon-BoldItalic`        |
| Black                  | `Superclarendon-Black`             |
| Black Italic           | `Superclarendon-BlackItalic`       |

### Monospaced Fonts

#### Courier New

The classic typewriter monospaced font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `CourierNewPSMT`                   |
| Italic                 | `CourierNewPS-ItalicMT`            |
| Bold                   | `CourierNewPS-BoldMT`              |
| Bold Italic            | `CourierNewPS-BoldItalicMT`        |

```swift
Text("Courier").font(.custom("CourierNewPSMT", size: 14))
```

**Best for:** Retro terminal UIs, typewriter aesthetic, screenplay formatters.

#### Courier

The original Courier (slightly different from Courier New).

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Courier`                          |
| Oblique                | `Courier-Oblique`                  |
| Bold                   | `Courier-Bold`                     |
| Bold Oblique           | `Courier-BoldOblique`              |

#### Menlo

A monospaced font based on Bitstream Vera Sans Mono. The default Xcode font before SF Mono.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Menlo-Regular`                    |
| Italic                 | `Menlo-Italic`                     |
| Bold                   | `Menlo-Bold`                       |
| Bold Italic            | `Menlo-BoldItalic`                 |

```swift
Text("func main()").font(.custom("Menlo-Regular", size: 14))
Text("// Bold comment").font(.custom("Menlo-Bold", size: 14))
```

**Best for:** Code display, terminal emulators, developer tools, log viewers.

#### American Typewriter

A monospaced font with typewriter charm and serifs.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `AmericanTypewriter`               |
| Light                  | `AmericanTypewriter-Light`         |
| Semibold               | `AmericanTypewriter-Semibold`      |
| Bold                   | `AmericanTypewriter-Bold`          |
| Condensed              | `AmericanTypewriter-Condensed`     |
| Condensed Light        | `AmericanTypewriter-CondensedLight`|
| Condensed Bold         | `AmericanTypewriter-CondensedBold` |

```swift
Text("Typewriter").font(.custom("AmericanTypewriter", size: 17))
```

**Best for:** Note-taking apps, journal/diary UIs, retro aesthetics, creative writing tools.

### Display and Decorative Fonts

#### Rockwell

A geometric slab serif with strong presence.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Rockwell-Regular`                 |
| Italic                 | `Rockwell-Italic`                  |
| Bold                   | `Rockwell-Bold`                    |
| Bold Italic            | `Rockwell-BoldItalic`              |

```swift
Text("ROCKWELL").font(.custom("Rockwell-Bold", size: 32))
```

**Best for:** Bold headings, poster-style layouts, strong brand statements.

#### Copperplate

An all-caps engraved style font with small-cap lowercase.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Copperplate`                      |
| Light                  | `Copperplate-Light`                |
| Bold                   | `Copperplate-Bold`                 |

```swift
Text("COPPERPLATE").font(.custom("Copperplate-Bold", size: 24))
```

**Best for:** Formal invitations, certificates, luxury branding, restaurant menus.

#### Papyrus

A distressed, hand-drawn style font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Papyrus`                          |
| Condensed              | `Papyrus-Condensed`               |

```swift
Text("Papyrus").font(.custom("Papyrus", size: 20))
```

**Best for:** Themed apps (ancient, natural), generally avoid for professional UIs.

#### Marker Felt

A felt-tip marker style font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Thin                   | `MarkerFelt-Thin`                  |
| Wide                   | `MarkerFelt-Wide`                  |

```swift
Text("Marker Felt").font(.custom("MarkerFelt-Thin", size: 20))
```

**Best for:** Whiteboard UIs, sketching apps, children's content.

#### Chalkboard SE

A clean chalkboard-style handwriting font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `ChalkboardSE-Regular`             |
| Light                  | `ChalkboardSE-Light`               |
| Bold                   | `ChalkboardSE-Bold`                |

```swift
Text("Chalkboard").font(.custom("ChalkboardSE-Regular", size: 17))
```

**Best for:** Education apps, children's apps, informal notes.

#### Chalkduster

A rougher chalkboard-style font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Chalkduster`                      |

```swift
Text("Chalkduster").font(.custom("Chalkduster", size: 20))
```

#### Noteworthy

A casual handwriting font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Light                  | `Noteworthy-Light`                 |
| Bold                   | `Noteworthy-Bold`                  |

```swift
Text("Noteworthy").font(.custom("Noteworthy-Light", size: 17))
```

**Best for:** Personal notes, diary entries, sticky note UIs.

#### Zapfino

An elaborate calligraphic script with extreme flourishes.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Zapfino`                          |

```swift
Text("Zapfino").font(.custom("Zapfino", size: 24))
```

**Best for:** Decorative headers only, wedding apps, formal invitations (use sparingly).

#### Party LET

A festive, playful display font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Plain                  | `PartyLetPlain`                    |

#### Savoye LET

An elegant script font.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Plain                  | `SavoyeLetPlain`                   |

```swift
Text("Savoye LET").font(.custom("SavoyeLetPlain", size: 28))
```

**Best for:** Elegant signatures, wedding invitations, formal flourishes.

### Script and Handwriting Fonts

#### Snell Roundhand

A flowing copperplate script with graceful strokes.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `SnellRoundhand`                   |
| Bold                   | `SnellRoundhand-Bold`              |
| Black                  | `SnellRoundhand-Black`             |

```swift
Text("Elegant Script").font(.custom("SnellRoundhand", size: 24))
```

**Best for:** Formal invitations, signatures, elegant accents.

#### Bradley Hand

A casual handwriting style.

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Bold                   | `BradleyHandITCTT-Bold`           |

```swift
Text("Handwritten").font(.custom("BradleyHandITCTT-Bold", size: 17))
```

**Best for:** Personal touches, note-style UIs, casual annotations.

#### Kefa

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `Kefa-Regular`                     |

#### Kohinoor Telugu

| Variant                | Font Name                          |
|------------------------|------------------------------------|
| Regular                | `KohinoorTelugu-Regular`           |
| Medium                 | `KohinoorTelugu-Medium`            |
| Light                  | `KohinoorTelugu-Light`             |

### Additional Built-in Fonts

#### Symbol / Dingbat Fonts

| Font Family            | Font Name                          | Description                 |
|------------------------|------------------------------------|-----------------------------|
| Symbol                 | `Symbol`                           | Greek and math symbols      |
| Zapf Dingbats          | `ZapfDingbatsITC`                  | Decorative symbols          |

#### Additional Sans-Serif

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Euphemia UCAS                  | `EuphemiaUCAS`                     |
| Euphemia UCAS Bold             | `EuphemiaUCAS-Bold`                |
| Euphemia UCAS Italic           | `EuphemiaUCAS-Italic`              |
| Galvji                         | `Galvji`                           |
| Galvji Bold                    | `Galvji-Bold`                      |
| Galvji Bold Oblique            | `Galvji-BoldOblique`               |
| Galvji Oblique                 | `Galvji-Oblique`                   |
| Grantha Sangam MN              | `GranthaSangamMN-Regular`          |
| Grantha Sangam MN Bold         | `GranthaSangamMN-Bold`             |
| Hoefler Text                   | `HoeflerText-Regular`              |
| Hoefler Text Italic            | `HoeflerText-Italic`               |
| Hoefler Text Bold              | `HoeflerText-Black`                |
| Hoefler Text Bold Italic       | `HoeflerText-BlackItalic`          |
| Kailasa                        | `Kailasa`                          |
| Kailasa Bold                   | `Kailasa-Bold`                     |
| Khmer Sangam MN                | `KhmerSangamMN`                    |
| Lao Sangam MN                  | `LaoSangamMN`                      |
| Malayalam Sangam MN             | `MalayalamSangamMN`                |
| Malayalam Sangam MN Bold        | `MalayalamSangamMN-Bold`           |
| Myanmar Sangam MN              | `MyanmarSangamMN`                  |
| Myanmar Sangam MN Bold         | `MyanmarSangamMN-Bold`             |
| Noto Nastaliq Urdu             | `NotoNastaliqUrdu`                 |
| Noto Nastaliq Urdu Bold        | `NotoNastaliqUrdu-Bold`            |
| Noto Sans Kannada              | `NotoSansKannada-Regular`          |
| Noto Sans Kannada Bold         | `NotoSansKannada-Bold`             |
| Noto Sans Kannada Light        | `NotoSansKannada-Light`            |
| Noto Sans Myanmar              | `NotoSansMyanmar-Regular`          |
| Noto Sans Myanmar Bold         | `NotoSansMyanmar-Bold`             |
| Noto Sans Myanmar Light        | `NotoSansMyanmar-Light`            |
| Noto Sans Oriya                | `NotoSansOriya`                    |
| Noto Sans Oriya Bold           | `NotoSansOriya-Bold`               |
| Sinhala Sangam MN              | `SinhalaSangamMN`                  |
| Sinhala Sangam MN Bold         | `SinhalaSangamMN-Bold`             |
| Tamil Sangam MN                | `TamilSangamMN`                    |
| Tamil Sangam MN Bold           | `TamilSangamMN-Bold`               |
| Thonburi                       | `Thonburi`                         |
| Thonburi Light                 | `Thonburi-Light`                   |
| Thonburi Bold                  | `Thonburi-Bold`                    |

### International and Multi-script Fonts

#### Chinese

| Variant                        | Font Name                          | Script                |
|--------------------------------|------------------------------------|-----------------------|
| PingFang SC Regular            | `PingFangSC-Regular`               | Simplified Chinese    |
| PingFang SC Medium             | `PingFangSC-Medium`                | Simplified Chinese    |
| PingFang SC Semibold           | `PingFangSC-Semibold`              | Simplified Chinese    |
| PingFang SC Light              | `PingFangSC-Light`                 | Simplified Chinese    |
| PingFang SC Thin               | `PingFangSC-Thin`                  | Simplified Chinese    |
| PingFang SC Ultralight         | `PingFangSC-Ultralight`            | Simplified Chinese    |
| PingFang TC Regular            | `PingFangTC-Regular`               | Traditional Chinese   |
| PingFang TC Medium             | `PingFangTC-Medium`                | Traditional Chinese   |
| PingFang TC Semibold           | `PingFangTC-Semibold`              | Traditional Chinese   |
| PingFang TC Light              | `PingFangTC-Light`                 | Traditional Chinese   |
| PingFang TC Thin               | `PingFangTC-Thin`                  | Traditional Chinese   |
| PingFang TC Ultralight         | `PingFangTC-Ultralight`            | Traditional Chinese   |
| PingFang HK Regular            | `PingFangHK-Regular`               | Hong Kong Chinese     |
| PingFang HK Medium             | `PingFangHK-Medium`                | Hong Kong Chinese     |
| PingFang HK Semibold           | `PingFangHK-Semibold`              | Hong Kong Chinese     |
| PingFang HK Light              | `PingFangHK-Light`                 | Hong Kong Chinese     |
| PingFang HK Thin               | `PingFangHK-Thin`                  | Hong Kong Chinese     |
| PingFang HK Ultralight         | `PingFangHK-Ultralight`            | Hong Kong Chinese     |

#### Japanese

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Hiragino Sans W3               | `HiraginoSans-W3`                 |
| Hiragino Sans W6               | `HiraginoSans-W6`                 |
| Hiragino Sans W7               | `HiraginoSans-W7`                 |
| Hiragino Mincho ProN W3        | `HiraMinProN-W3`                   |
| Hiragino Mincho ProN W6        | `HiraMinProN-W6`                   |

```swift
Text("Japanese text").font(.custom("HiraginoSans-W3", size: 17))
```

#### Korean

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Apple SD Gothic Neo Regular    | `AppleSDGothicNeo-Regular`         |
| Apple SD Gothic Neo Thin       | `AppleSDGothicNeo-Thin`            |
| Apple SD Gothic Neo UltraLight | `AppleSDGothicNeo-UltraLight`      |
| Apple SD Gothic Neo Light      | `AppleSDGothicNeo-Light`           |
| Apple SD Gothic Neo Medium     | `AppleSDGothicNeo-Medium`          |
| Apple SD Gothic Neo Semibold   | `AppleSDGothicNeo-SemiBold`        |
| Apple SD Gothic Neo Bold       | `AppleSDGothicNeo-Bold`            |

```swift
Text("Korean text").font(.custom("AppleSDGothicNeo-Regular", size: 17))
```

#### Arabic

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Geeza Pro Regular              | `GeezaPro`                         |
| Geeza Pro Bold                 | `GeezaPro-Bold`                    |
| Mishafi Regular                | `DiwanMishafi`                     |
| Baghdad Regular                | `Baghdad`                          |
| Farah                          | `Farah`                            |
| Damascus                       | `Damascus`                         |
| Damascus Light                 | `DamascusLight`                    |
| Damascus Medium                | `DamascusMedium`                   |
| Damascus Semibold              | `DamascusSemiBold`                 |
| Damascus Bold                  | `DamascusBold`                     |

#### Devanagari (Hindi)

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Kohinoor Devanagari Regular    | `KohinoorDevanagari-Regular`       |
| Kohinoor Devanagari Light      | `KohinoorDevanagari-Light`         |
| Kohinoor Devanagari Semibold   | `KohinoorDevanagari-Semibold`      |
| Devanagari Sangam MN           | `DevanagariSangamMN`               |
| Devanagari Sangam MN Bold      | `DevanagariSangamMN-Bold`          |

#### Bangla

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Kohinoor Bangla Regular        | `KohinoorBangla-Regular`           |
| Kohinoor Bangla Light          | `KohinoorBangla-Light`             |
| Kohinoor Bangla Semibold       | `KohinoorBangla-Semibold`          |

#### Gujarati

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Kohinoor Gujarati Regular      | `KohinoorGujarati-Regular`         |
| Kohinoor Gujarati Light        | `KohinoorGujarati-Light`           |
| Kohinoor Gujarati Bold         | `KohinoorGujarati-Bold`            |
| Gujarati Sangam MN             | `GujaratiSangamMN`                 |
| Gujarati Sangam MN Bold        | `GujaratiSangamMN-Bold`            |

#### Telugu

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Kohinoor Telugu Regular        | `KohinoorTelugu-Regular`           |
| Kohinoor Telugu Medium         | `KohinoorTelugu-Medium`            |
| Kohinoor Telugu Light          | `KohinoorTelugu-Light`             |

#### Gurmukhi (Punjabi)

| Variant                        | Font Name                          |
|--------------------------------|------------------------------------|
| Mukta Mahee Regular            | `MuktaMahee-Regular`               |
| Mukta Mahee Light              | `MuktaMahee-Light`                 |
| Mukta Mahee Bold               | `MuktaMahee-Bold`                  |
| Gurmukhi MN                    | `GurmukhiMN`                       |
| Gurmukhi MN Bold               | `GurmukhiMN-Bold`                  |

---

## 3. Google Fonts -- Top 100 for iOS

These are the most popular Google Fonts used in iOS apps. To use any of these, you must
download the font files and add them to your Xcode project (see Section 4).

### Sans-Serif

| #  | Font Name            | Weights Available          | Best Use Case                        |
|----|----------------------|----------------------------|--------------------------------------|
| 1  | Inter                | 100-900                    | UI text, dashboards, SaaS            |
| 2  | Roboto               | 100, 300, 400, 500, 700, 900 | Material Design, Android parity   |
| 3  | Open Sans            | 300-800                    | Universal body text                  |
| 4  | Lato                 | 100, 300, 400, 700, 900   | Friendly body text, corporate        |
| 5  | Montserrat           | 100-900                    | Modern headings, marketing           |
| 6  | Poppins              | 100-900                    | SaaS, startup, geometric UI          |
| 7  | Nunito               | 200-900                    | Rounded, friendly, children's apps   |
| 8  | Raleway              | 100-900                    | Elegant headings, fashion            |
| 9  | Source Sans 3        | 200-900                    | Technical docs, code-adjacent text   |
| 10 | Work Sans            | 100-900                    | Clean UI, editorial                  |
| 11 | DM Sans              | 100-900                    | Minimal UI, dashboard                |
| 12 | Manrope              | 200-800                    | Tech products, developer tools       |
| 13 | Plus Jakarta Sans    | 200-800                    | Fintech, professional                |
| 14 | Space Grotesk        | 300-700                    | Tech, developer, coding apps         |
| 15 | Outfit               | 100-900                    | Modern branding, startup             |
| 16 | Sora                 | 100-800                    | Futuristic, crypto, web3             |
| 17 | Urbanist             | 100-900                    | Modern geometric, luxury tech        |
| 18 | Lexend               | 100-900                    | Accessibility, dyslexia-friendly     |
| 19 | Albert Sans          | 100-900                    | Geometric, versatile UI              |
| 20 | Figtree              | 300-900                    | Friendly, approachable UI            |
| 21 | Geist                | 100-900                    | Vercel-style, developer UI           |
| 22 | Satoshi              | 300-900                    | Minimal, modern branding             |
| 23 | Nunito Sans          | 200-900                    | UI text, clean dashboards            |
| 24 | Karla                | 200-800                    | Grotesque, editorial                 |
| 25 | Rubik                | 300-900                    | Rounded, playful                     |
| 26 | Barlow               | 100-900                    | Industrial, technical                |
| 27 | Mulish               | 200-900                    | Clean, minimal                       |
| 28 | Quicksand            | 300-700                    | Rounded, friendly                    |
| 29 | Cabin                | 400-700                    | Humanist, warm                       |
| 30 | Josefin Sans         | 100-700                    | Elegant, geometric                   |
| 31 | PT Sans              | 400, 700                   | Universal text, multilingual         |
| 32 | Noto Sans            | 100-900                    | Global multilingual support          |
| 33 | Overpass             | 100-900                    | Highway signage inspired, clean      |
| 34 | IBM Plex Sans        | 100-700                    | Enterprise, corporate, IBM design    |
| 35 | Red Hat Display      | 300-900                    | Open source branding                 |
| 36 | Exo 2                | 100-900                    | Futuristic, geometric                |
| 37 | Archivo              | 100-900                    | Bold headings, editorial             |
| 38 | Hind                 | 300-700                    | Devanagari + Latin body text         |
| 39 | Public Sans          | 100-900                    | Government, accessible               |
| 40 | General Sans         | 200-700                    | Modern grotesque, branding           |

### Serif

| #  | Font Name              | Weights Available        | Best Use Case                       |
|----|------------------------|--------------------------|-------------------------------------|
| 41 | Playfair Display       | 400-900                  | Editorial headings, magazine        |
| 42 | Merriweather           | 300, 400, 700, 900      | Long-form reading, blogs            |
| 43 | Lora                   | 400-700                  | Book text, literary                 |
| 44 | Source Serif 4         | 200-900                  | Technical docs, paired with Source Sans |
| 45 | Crimson Text           | 400, 600, 700            | Book text, classic reading          |
| 46 | Libre Baskerville      | 400, 700                 | Elegant body text, traditional      |
| 47 | EB Garamond            | 400-800                  | Book typography, literary           |
| 48 | Cormorant Garamond     | 300-700                  | High fashion, luxury headings       |
| 49 | DM Serif Display       | 400                      | Bold editorial headings             |
| 50 | Bitter                 | 100-900                  | Screen reading, warm serif          |
| 51 | Noto Serif             | 100-900                  | Global multilingual serif           |
| 52 | PT Serif               | 400, 700                 | Multilingual reading                |
| 53 | Spectral               | 200-800                  | Long-form, screen-optimized         |
| 54 | Vollkorn               | 400-900                  | Warm, organic reading               |
| 55 | Fraunces               | 100-900                  | Playful serif, retro                |
| 56 | Instrument Serif       | 400                      | Minimal editorial                   |
| 57 | Newsreader             | 200-800                  | News, journalism                    |

### Monospaced

| #  | Font Name            | Weights Available          | Best Use Case                       |
|----|----------------------|----------------------------|-------------------------------------|
| 58 | Fira Code            | 300-700                    | Code editor with ligatures          |
| 59 | JetBrains Mono       | 100-800                    | IDE, code editor, terminal          |
| 60 | Source Code Pro       | 200-900                    | Code display, terminal              |
| 61 | IBM Plex Mono        | 100-700                    | Enterprise code, terminal           |
| 62 | Space Mono           | 400, 700                   | Futuristic, retro-tech              |
| 63 | Roboto Mono          | 100-700                    | Data tables, code blocks            |
| 64 | Inconsolata          | 200-900                    | Code display, clean mono            |
| 65 | Ubuntu Mono          | 400, 700                   | Linux-style terminal                |
| 66 | Cascadia Code        | 200-700                    | Windows Terminal-style              |
| 67 | Geist Mono           | 100-900                    | Vercel developer tools              |
| 68 | Anonymous Pro        | 400, 700                   | Coding, terminal                    |
| 69 | Overpass Mono        | 300-700                    | Data, tables                        |
| 70 | Red Hat Mono         | 300-700                    | Enterprise code                     |

### Display

| #  | Font Name            | Weights Available          | Best Use Case                       |
|----|----------------------|----------------------------|-------------------------------------|
| 71 | Bebas Neue           | 400                        | Bold headings, posters              |
| 72 | Oswald               | 200-700                    | Condensed headings, news            |
| 73 | Anton                | 400                        | Impact headings, bold statements    |
| 74 | Archivo Black        | 400                        | Ultra bold display                  |
| 75 | Righteous            | 400                        | Retro, rounded display              |
| 76 | Fredoka              | 300-700                    | Playful, children's content         |
| 77 | Lilita One           | 400                        | Fun, casual headings                |
| 78 | Passion One          | 400, 700, 900              | Sports, energetic                   |
| 79 | Bungee               | 400                        | Signage, athletic                   |
| 80 | Abril Fatface        | 400                        | High-contrast display               |
| 81 | Alfa Slab One        | 400                        | Slab serif display                  |
| 82 | Lobster              | 400                        | Retro script display                |
| 83 | Permanent Marker     | 400                        | Hand-drawn, casual                  |
| 84 | Bangers              | 400                        | Comic book, energetic               |
| 85 | Staatliches          | 400                        | Display, condensed sans             |
| 86 | Comfortaa            | 300-700                    | Rounded, futuristic                 |
| 87 | Russo One            | 400                        | Tech, gaming                        |
| 88 | Press Start 2P       | 400                        | Pixel art, retro gaming             |
| 89 | Orbitron             | 400-900                    | Sci-fi, space, futuristic           |
| 90 | Teko                 | 300-700                    | Sports, condensed display           |

### Handwriting and Script

| #  | Font Name            | Weights Available          | Best Use Case                       |
|----|----------------------|----------------------------|-------------------------------------|
| 91 | Dancing Script       | 400-700                    | Casual elegance, invitations        |
| 92 | Pacifico             | 400                        | Retro surf, casual branding         |
| 93 | Caveat               | 400-700                    | Handwritten notes, annotations      |
| 94 | Sacramento           | 400                        | Elegant script, signatures          |
| 95 | Great Vibes          | 400                        | Formal calligraphy                  |
| 96 | Satisfy              | 400                        | Retro script                        |
| 97 | Kalam                | 300, 400, 700              | Informal handwriting, notes         |
| 98 | Patrick Hand         | 400                        | Casual handwriting                  |
| 99 | Indie Flower         | 400                        | Playful handwriting, fun            |
| 100| Amatic SC            | 400, 700                   | Tall, narrow handwriting            |

---

## 4. How to Add Custom Fonts to iOS

### Step 1: Obtain Font Files

Download `.ttf` (TrueType) or `.otf` (OpenType) font files. For Google Fonts,
download from https://fonts.google.com or use a package manager.

### Step 2: Add Files to Xcode Project

1. Drag the font files into your Xcode project navigator.
2. In the dialog that appears, check **"Copy items if needed"**.
3. Ensure **"Add to targets"** has your app target checked.
4. Verify the files appear under **Build Phases > Copy Bundle Resources**.

### Step 3: Register Fonts in Info.plist

Add the font file names to your `Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
    <string>Inter-Regular.ttf</string>
    <string>Inter-Medium.ttf</string>
    <string>Inter-Bold.ttf</string>
    <string>PlayfairDisplay-Bold.ttf</string>
    <string>PlayfairDisplay-Regular.ttf</string>
</array>
```

Or in the Xcode Info tab, add a row:
- Key: **Fonts provided by application**
- Type: Array
- Items: each font filename (including extension)

### Step 4: Find the Exact Font Name

The filename is NOT always the font name. Use this code to discover exact PostScript names:

```swift
// Run this once at app launch to print all available fonts
for family in UIFont.familyNames.sorted() {
    print("Family: \(family)")
    for name in UIFont.fontNames(forFamilyName: family) {
        print("  -- \(name)")
    }
}
```

Or find a specific family:

```swift
// Check a specific font family
let names = UIFont.fontNames(forFamilyName: "Inter")
print(names) // ["Inter-Regular", "Inter-Medium", "Inter-Bold", ...]
```

### Step 5: Use in SwiftUI

```swift
// Basic usage
Text("Custom Font").font(.custom("Inter-Regular", size: 17))
Text("Bold Custom").font(.custom("Inter-Bold", size: 24))

// With Dynamic Type support (RECOMMENDED)
Text("Dynamic Type").font(.custom("Inter-Regular", size: 17, relativeTo: .body))
Text("Dynamic Title").font(.custom("Inter-Bold", size: 28, relativeTo: .title))
Text("Dynamic Caption").font(.custom("Inter-Regular", size: 12, relativeTo: .caption))

// Fixed size (does not scale with Dynamic Type)
Text("Fixed Size").font(.custom("Inter-Regular", fixedSize: 14))
```

### Step 6: Use in UIKit

```swift
// Basic usage
let font = UIFont(name: "Inter-Regular", size: 17)

// With Dynamic Type metrics
let customFont = UIFont(name: "Inter-Regular", size: 17)!
let scaledFont = UIFontMetrics(forTextStyle: .body).scaledFont(for: customFont)
label.font = scaledFont
label.adjustsFontForContentSizeCategory = true
```

### Dynamic Type with @ScaledMetric

Use `@ScaledMetric` for custom font sizes that scale with Dynamic Type settings:

```swift
struct ContentView: View {
    @ScaledMetric(relativeTo: .body) var bodySize: CGFloat = 17
    @ScaledMetric(relativeTo: .title) var titleSize: CGFloat = 28
    @ScaledMetric(relativeTo: .caption) var captionSize: CGFloat = 12
    @ScaledMetric var iconSize: CGFloat = 24

    var body: some View {
        VStack {
            Text("Title")
                .font(.custom("PlayfairDisplay-Bold", size: titleSize))
            Text("Body text here")
                .font(.custom("Inter-Regular", size: bodySize))
            Text("Caption")
                .font(.custom("Inter-Regular", size: captionSize))
            Image(systemName: "star.fill")
                .font(.system(size: iconSize))
        }
    }
}
```

### Complete Custom Font Integration Example

```swift
// App entry point - register fonts
@main
struct MyApp: App {
    init() {
        // Fonts are auto-registered via Info.plist
        // But you can verify they loaded:
        #if DEBUG
        if UIFont(name: "Inter-Regular", size: 17) == nil {
            print("WARNING: Inter-Regular font not found. Check Info.plist and bundle.")
        }
        #endif
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### Swift Package Manager Font Loading

If your fonts come from a Swift Package:

```swift
import SwiftUI

extension Font {
    static func registerFontsFromBundle(bundle: Bundle) {
        let fontURLs = bundle.urls(forResourcesWithExtension: "ttf", subdirectory: nil) ?? []
        let otfURLs = bundle.urls(forResourcesWithExtension: "otf", subdirectory: nil) ?? []

        for url in fontURLs + otfURLs {
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}
```

### Troubleshooting Custom Fonts

| Problem                       | Solution                                                     |
|-------------------------------|--------------------------------------------------------------|
| Font not appearing            | Check Info.plist entry matches exact filename                |
| Wrong weight showing          | Use PostScript name, not display name                        |
| Font not in bundle            | Verify target membership in File Inspector                   |
| Dynamic Type not working      | Use `relativeTo:` parameter in `Font.custom()`               |
| Font looks different on device| Simulator and device may render differently; always test both |

---

## 5. Font Pairing Recommendations

Fifteen proven font pairings for iOS apps. Each pairing includes a heading font,
a body font, the design context, and ready-to-use SwiftUI code.

### Pairing 1: SF Pro Display + SF Pro Text

**Style:** System default, clean, Apple-native
**Use case:** Any iOS app that wants to feel native and polished

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Welcome Back")
        .font(.system(size: 34, weight: .bold))
    Text("Here is what happened while you were away. Your projects have new updates and your team left comments.")
        .font(.system(size: 17, weight: .regular))
        .foregroundStyle(.secondary)
}
```

### Pairing 2: Playfair Display + Source Sans 3

**Style:** Editorial, magazine
**Use case:** News apps, editorial content, blog readers

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("The Art of Typography")
        .font(.custom("PlayfairDisplay-Bold", size: 32, relativeTo: .largeTitle))
    Text("Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.")
        .font(.custom("SourceSans3-Regular", size: 17, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 3: Montserrat + Lora

**Style:** Modern heading with classic body
**Use case:** Portfolio apps, creative agencies, lifestyle brands

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("CREATIVE STUDIO")
        .font(.custom("Montserrat-Bold", size: 28, relativeTo: .title))
        .tracking(2)
    Text("We craft digital experiences that blend innovation with timeless design principles.")
        .font(.custom("Lora-Regular", size: 17, relativeTo: .body))
}
```

### Pairing 4: Poppins + Inter

**Style:** SaaS, modern dashboard
**Use case:** Productivity apps, dashboards, admin panels, B2B tools

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Dashboard Overview")
        .font(.custom("Poppins-SemiBold", size: 24, relativeTo: .title2))
    Text("Your key metrics are performing above average this quarter with a 23% increase in engagement.")
        .font(.custom("Inter-Regular", size: 15, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 5: Bebas Neue + Roboto

**Style:** Bold impact with clean body
**Use case:** Sports apps, fitness trackers, event apps, bold branding

```swift
VStack(alignment: .leading, spacing: 4) {
    Text("GAME DAY")
        .font(.custom("BebasNeue-Regular", size: 48, relativeTo: .largeTitle))
    Text("Get ready for tonight's matchup. Here are the stats, lineups, and predictions you need.")
        .font(.custom("Roboto-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 6: DM Serif Display + DM Sans

**Style:** Luxury, minimal elegance
**Use case:** Premium products, luxury e-commerce, high-end hospitality

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Curated Collection")
        .font(.custom("DMSerifDisplay-Regular", size: 32, relativeTo: .largeTitle))
    Text("Each piece in our collection has been carefully selected for its craftsmanship and timeless appeal.")
        .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 7: Space Grotesk + Inter

**Style:** Tech, developer-focused
**Use case:** Developer tools, coding apps, API documentation

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("API Reference")
        .font(.custom("SpaceGrotesk-Bold", size: 28, relativeTo: .title))
    Text("Explore our comprehensive API documentation with interactive examples and detailed guides.")
        .font(.custom("Inter-Regular", size: 15, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 8: Plus Jakarta Sans + Source Serif 4

**Style:** Professional, trustworthy
**Use case:** Fintech, banking, insurance, professional services

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Financial Summary")
        .font(.custom("PlusJakartaSans-Bold", size: 24, relativeTo: .title2))
    Text("Your portfolio has grown 12.4% this quarter, outperforming the market benchmark by 3.2 percentage points.")
        .font(.custom("SourceSerif4-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 9: Outfit + Lato

**Style:** Startup, approachable
**Use case:** Startup landing pages, onboarding flows, consumer apps

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Get Started")
        .font(.custom("Outfit-SemiBold", size: 28, relativeTo: .title))
    Text("Set up your profile in just a few steps and start connecting with people who share your interests.")
        .font(.custom("Lato-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 10: Oswald + Open Sans

**Style:** News, content-heavy
**Use case:** News readers, content aggregators, media apps

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("BREAKING NEWS")
        .font(.custom("Oswald-Bold", size: 28, relativeTo: .title))
    Text("Markets rally as economic indicators show stronger-than-expected growth in the third quarter.")
        .font(.custom("OpenSans-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 11: New York + SF Pro

**Style:** Apple editorial
**Use case:** Apple News-style apps, premium editorial, literary content

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("The Future of Design")
        .font(.system(size: 32, weight: .bold, design: .serif))
    Text("As technology evolves, so does the language of design. New tools and paradigms are reshaping how we create.")
        .font(.system(size: 17, weight: .regular))
        .foregroundStyle(.secondary)
}
```

### Pairing 12: Archivo Black + Work Sans

**Style:** Bold, sporty
**Use case:** Sports brands, fitness apps, bold product pages

```swift
VStack(alignment: .leading, spacing: 4) {
    Text("PUSH LIMITS")
        .font(.custom("ArchivoBlack-Regular", size: 36, relativeTo: .largeTitle))
    Text("Track your workouts, set new records, and compete with friends in weekly challenges.")
        .font(.custom("WorkSans-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 13: Cormorant Garamond + Montserrat

**Style:** High fashion, luxury
**Use case:** Fashion apps, luxury brands, art galleries, premium retail

```swift
VStack(alignment: .leading, spacing: 12) {
    Text("Autumn Collection")
        .font(.custom("CormorantGaramond-SemiBold", size: 36, relativeTo: .largeTitle))
    Text("EXPLORE THE LATEST ARRIVALS")
        .font(.custom("Montserrat-Medium", size: 12, relativeTo: .caption))
        .tracking(3)
        .foregroundStyle(.secondary)
}
```

### Pairing 14: Fredoka + Nunito

**Style:** Kids, playful
**Use case:** Children's apps, educational games, family content

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Let's Learn!")
        .font(.custom("Fredoka-SemiBold", size: 32, relativeTo: .largeTitle))
    Text("Choose a fun activity below and start your learning adventure today.")
        .font(.custom("Nunito-Regular", size: 17, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

### Pairing 15: Manrope + Merriweather

**Style:** Blog, long-form reading
**Use case:** Blog readers, RSS apps, knowledge bases, documentation

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Understanding Swift Concurrency")
        .font(.custom("Manrope-Bold", size: 24, relativeTo: .title2))
    Text("Swift concurrency introduces structured approaches to writing asynchronous code, making it safer and more readable than traditional callback patterns.")
        .font(.custom("Merriweather-Regular", size: 16, relativeTo: .body))
        .foregroundStyle(.secondary)
}
```

---

## 6. Font Management Utilities

### FontManager: Register Custom Fonts Programmatically

```swift
import SwiftUI
import CoreText

final class FontManager {
    static let shared = FontManager()

    private var registeredFonts: Set<String> = []

    private init() {}

    /// Register all custom fonts from the main bundle.
    /// Call this in your App init or AppDelegate.
    func registerAllFonts() {
        registerFonts(from: .main, extensions: ["ttf", "otf"])
    }

    /// Register fonts from a specific bundle (useful for SPM packages).
    func registerFonts(from bundle: Bundle, extensions: [String] = ["ttf", "otf"]) {
        for ext in extensions {
            guard let urls = bundle.urls(forResourcesWithExtension: ext, subdirectory: nil) else {
                continue
            }
            for url in urls {
                registerFont(at: url)
            }
        }
    }

    /// Register a single font file by URL.
    func registerFont(at url: URL) {
        let fontName = url.lastPathComponent
        guard !registeredFonts.contains(fontName) else { return }

        var error: Unmanaged<CFError>?
        let success = CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error)

        if success {
            registeredFonts.insert(fontName)
        } else if let error = error?.takeRetainedValue() {
            print("Failed to register font \(fontName): \(error)")
        }
    }

    /// Print all available font families and their font names (debug utility).
    func printAllFonts() {
        for family in UIFont.familyNames.sorted() {
            print("Family: \(family)")
            for name in UIFont.fontNames(forFamilyName: family).sorted() {
                print("  \(name)")
            }
        }
    }

    /// Check if a specific font is available.
    func isFontAvailable(_ fontName: String) -> Bool {
        return UIFont(name: fontName, size: 12) != nil
    }
}
```

### App-Specific Type Scale Extension

Define a consistent type scale for your entire app:

```swift
import SwiftUI

extension Font {
    // MARK: - Display
    static let appDisplayLarge = Font.custom("Inter-Bold", size: 40, relativeTo: .largeTitle)
    static let appDisplayMedium = Font.custom("Inter-Bold", size: 34, relativeTo: .largeTitle)
    static let appDisplaySmall = Font.custom("Inter-SemiBold", size: 28, relativeTo: .title)

    // MARK: - Headings
    static let appHeading1 = Font.custom("Inter-Bold", size: 24, relativeTo: .title2)
    static let appHeading2 = Font.custom("Inter-SemiBold", size: 20, relativeTo: .title3)
    static let appHeading3 = Font.custom("Inter-SemiBold", size: 17, relativeTo: .headline)

    // MARK: - Body
    static let appBodyLarge = Font.custom("Inter-Regular", size: 17, relativeTo: .body)
    static let appBody = Font.custom("Inter-Regular", size: 15, relativeTo: .subheadline)
    static let appBodySmall = Font.custom("Inter-Regular", size: 13, relativeTo: .footnote)

    // MARK: - Labels
    static let appLabel = Font.custom("Inter-Medium", size: 14, relativeTo: .subheadline)
    static let appLabelSmall = Font.custom("Inter-Medium", size: 12, relativeTo: .caption)

    // MARK: - Caption
    static let appCaption = Font.custom("Inter-Regular", size: 12, relativeTo: .caption)
    static let appCaptionSmall = Font.custom("Inter-Regular", size: 11, relativeTo: .caption2)

    // MARK: - Monospaced
    static let appCode = Font.custom("JetBrainsMono-Regular", size: 14, relativeTo: .body)
    static let appCodeSmall = Font.custom("JetBrainsMono-Regular", size: 12, relativeTo: .caption)

    // MARK: - Special
    static let appButton = Font.custom("Inter-SemiBold", size: 16, relativeTo: .body)
    static let appTabBar = Font.custom("Inter-Medium", size: 10, relativeTo: .caption2)
    static let appBadge = Font.custom("Inter-Bold", size: 11, relativeTo: .caption2)
}
```

Usage:

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Page Title").font(.appHeading1)
    Text("Body content goes here.").font(.appBody)
    Text("12:34 PM").font(.appCaption)
    Text("let x = 42").font(.appCode)
}
```

### Font Preview View

A debug view that displays all registered fonts:

```swift
import SwiftUI

struct FontPreviewView: View {
    @State private var families: [String] = []
    @State private var searchText = ""
    @State private var previewText = "The quick brown fox jumps over the lazy dog"
    @State private var previewSize: CGFloat = 17

    var filteredFamilies: [String] {
        if searchText.isEmpty {
            return families
        }
        return families.filter { $0.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    TextField("Preview text", text: $previewText)
                    Stepper("Size: \(Int(previewSize))pt", value: $previewSize, in: 8...72)
                }

                ForEach(filteredFamilies, id: \.self) { family in
                    Section(header: Text(family)) {
                        ForEach(UIFont.fontNames(forFamilyName: family).sorted(), id: \.self) { name in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(previewText)
                                    .font(.custom(name, size: previewSize))
                                Text(name)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                }
            }
            .navigationTitle("Font Preview")
            .searchable(text: $searchText, prompt: "Search fonts...")
            .onAppear {
                families = UIFont.familyNames.sorted()
            }
        }
    }
}

#Preview {
    FontPreviewView()
}
```

### Dynamic Type Helper

Ensure custom fonts respect the user's Dynamic Type preferences:

```swift
import SwiftUI

struct DynamicTypeFont: ViewModifier {
    let fontName: String
    let baseSize: CGFloat
    let textStyle: Font.TextStyle

    @ScaledMetric private var scaledSize: CGFloat

    init(fontName: String, baseSize: CGFloat, textStyle: Font.TextStyle = .body) {
        self.fontName = fontName
        self.baseSize = baseSize
        self.textStyle = textStyle
        self._scaledSize = ScaledMetric(wrappedValue: baseSize, relativeTo: textStyle)
    }

    func body(content: Content) -> some View {
        content.font(.custom(fontName, size: scaledSize))
    }
}

extension View {
    func dynamicFont(_ name: String, size: CGFloat, relativeTo style: Font.TextStyle = .body) -> some View {
        modifier(DynamicTypeFont(fontName: name, baseSize: size, textStyle: style))
    }
}

// Usage:
// Text("Hello").dynamicFont("Inter-Regular", size: 17, relativeTo: .body)
```

### List All Device Fonts (Utility Function)

```swift
import UIKit

func getAllFonts() -> [(family: String, fonts: [String])] {
    UIFont.familyNames.sorted().map { family in
        (family: family, fonts: UIFont.fontNames(forFamilyName: family).sorted())
    }
}

func findFont(containing query: String) -> [String] {
    var results: [String] = []
    for family in UIFont.familyNames {
        for name in UIFont.fontNames(forFamilyName: family) {
            if name.localizedCaseInsensitiveContains(query) {
                results.append(name)
            }
        }
    }
    return results.sorted()
}

// Usage:
// let allFonts = getAllFonts()
// let interFonts = findFont(containing: "Inter")
```

---

## 7. Variable Fonts

### What Are Variable Fonts?

A variable font is a single font file that contains an entire family of variations along
one or more design axes (weight, width, slant, optical size). Instead of shipping separate
files for Regular, Medium, Bold, and so on, a single variable font file can interpolate
smoothly between any values on its defined axes.

### Benefits

- **Single file**: One `.ttf` replaces 10-20 individual weight files
- **Smooth interpolation**: Animate between weights or widths fluidly
- **Smaller bundle size**: Typically smaller than the equivalent collection of static fonts
- **Fine-grained control**: Access any weight (e.g., 450, 550) not just named stops
- **Animation**: Smoothly transition font weight, width, or slant

### Common Axes

| Axis Code | Name          | Typical Range  | Description                                |
|-----------|---------------|----------------|--------------------------------------------|
| `wght`    | Weight        | 100-900        | Thin to Black                              |
| `wdth`    | Width         | 75-125         | Condensed to Expanded                      |
| `slnt`    | Slant         | -12 to 0       | Upright to slanted                         |
| `ital`    | Italic        | 0 or 1         | Roman or Italic                            |
| `opsz`    | Optical Size  | 8-144          | Small text to display                      |

### Using Variable Fonts in SwiftUI

SwiftUI does not natively support setting arbitrary axis values. You need to drop down
to `UIFont` with font descriptors and bridge back to SwiftUI.

```swift
import SwiftUI
import UIKit

extension Font {
    /// Create a font from a variable font with a specific weight value.
    /// - Parameters:
    ///   - name: The PostScript name of the variable font
    ///   - size: Point size
    ///   - weight: Weight value (100-900, where 400 = regular, 700 = bold)
    static func variable(_ name: String, size: CGFloat, weight: CGFloat = 400) -> Font {
        let descriptor = UIFontDescriptor(fontAttributes: [
            .name: name,
            kCTFontVariationAttribute as UIFontDescriptor.AttributeName: [
                // Weight axis tag: 2003265652 = 'wght'
                2003265652: weight
            ]
        ])
        let uiFont = UIFont(descriptor: descriptor, size: size)
        return Font(uiFont)
    }

    /// Create a font from a variable font with weight and width axes.
    static func variable(
        _ name: String,
        size: CGFloat,
        weight: CGFloat = 400,
        width: CGFloat = 100
    ) -> Font {
        let descriptor = UIFontDescriptor(fontAttributes: [
            .name: name,
            kCTFontVariationAttribute as UIFontDescriptor.AttributeName: [
                2003265652: weight,  // wght
                2003072104: width    // wdth
            ]
        ])
        let uiFont = UIFont(descriptor: descriptor, size: size)
        return Font(uiFont)
    }
}
```

Usage:

```swift
VStack(spacing: 8) {
    Text("Weight 300").font(.variable("Inter", size: 17, weight: 300))
    Text("Weight 400").font(.variable("Inter", size: 17, weight: 400))
    Text("Weight 500").font(.variable("Inter", size: 17, weight: 500))
    Text("Weight 600").font(.variable("Inter", size: 17, weight: 600))
    Text("Weight 700").font(.variable("Inter", size: 17, weight: 700))
}
```

### Animating Variable Font Axes

You can animate weight or width changes for smooth transitions:

```swift
import SwiftUI

struct AnimatedWeightText: View {
    @State private var weight: CGFloat = 400
    let fontName: String
    let text: String

    var body: some View {
        VStack(spacing: 20) {
            Text(text)
                .font(.variable(fontName, size: 32, weight: weight))
                .animation(.easeInOut(duration: 0.3), value: weight)

            Slider(value: $weight, in: 100...900, step: 1)
                .padding(.horizontal)

            Text("Weight: \(Int(weight))")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}
```

### Axis Tags Reference

When working with variable fonts programmatically, you need numeric axis tags.
These are computed from the 4-character axis tag string:

```swift
func axisTag(from string: String) -> Int {
    let chars = Array(string.utf8)
    guard chars.count == 4 else { return 0 }
    return Int(chars[0]) << 24 | Int(chars[1]) << 16 | Int(chars[2]) << 8 | Int(chars[3])
}

// Common axis tags:
// axisTag(from: "wght") = 2003265652
// axisTag(from: "wdth") = 2003072104
// axisTag(from: "slnt") = 1936486004
// axisTag(from: "ital") = 1769234796
// axisTag(from: "opsz") = 1869640570
```

### Inspecting Variable Font Axes

Discover which axes and ranges a variable font supports:

```swift
import CoreText

func inspectVariableFont(named fontName: String, size: CGFloat = 17) {
    guard let uiFont = UIFont(name: fontName, size: size) else {
        print("Font not found: \(fontName)")
        return
    }

    let ctFont = uiFont as CTFont
    guard let axes = CTFontCopyVariationAxes(ctFont) as? [[String: Any]] else {
        print("\(fontName) is not a variable font (no variation axes).")
        return
    }

    print("Variable font: \(fontName)")
    print("Axes:")
    for axis in axes {
        let name = axis[kCTFontVariationAxisNameKey as String] ?? "Unknown"
        let tag = axis[kCTFontVariationAxisIdentifierKey as String] ?? 0
        let min = axis[kCTFontVariationAxisMinimumValueKey as String] ?? 0
        let max = axis[kCTFontVariationAxisMaximumValueKey as String] ?? 0
        let def = axis[kCTFontVariationAxisDefaultValueKey as String] ?? 0
        print("  \(name): tag=\(tag), range=\(min)...\(max), default=\(def)")
    }
}
```

### Popular Variable Fonts for iOS

| Font Name         | Axes Available          | Weight Range | Width Range | Notes                           |
|-------------------|-------------------------|--------------|-------------|---------------------------------|
| Inter             | wght                    | 100-900      | --          | Best all-around UI variable font|
| Roboto Flex       | wght, wdth, slnt, opsz  | 100-1000     | 75-151      | Most versatile variable font    |
| Source Sans 3     | wght, ital              | 200-900      | --          | Excellent for technical content |
| Outfit            | wght                    | 100-900      | --          | Modern, geometric               |
| Work Sans         | wght, ital              | 100-900      | --          | Clean, editorial                |
| DM Sans           | wght, ital, opsz        | 100-1000     | --          | Minimal, versatile              |
| Manrope           | wght                    | 200-800      | --          | Tech-focused                    |
| Plus Jakarta Sans | wght, ital              | 200-800      | --          | Professional, fintech           |
| Space Grotesk     | wght                    | 300-700      | --          | Developer tools                 |
| Sora              | wght                    | 100-800      | --          | Futuristic, web3                |
| Montserrat        | wght, ital              | 100-900      | --          | Popular geometric sans          |
| Nunito            | wght, ital              | 200-900      | --          | Rounded, friendly               |
| Raleway           | wght, ital              | 100-900      | --          | Elegant sans-serif              |
| Playfair Display  | wght, ital              | 400-900      | --          | Editorial serif                 |
| Lora              | wght, ital              | 400-700      | --          | Literary serif                  |
| Fraunces          | wght, opsz, SOFT, WONK  | 100-900      | --          | Playful serif with custom axes  |

### Variable Font with Dynamic Type

Combine variable font control with Dynamic Type support:

```swift
import SwiftUI

struct VariableDynamicTypeFont: ViewModifier {
    let fontName: String
    let baseSize: CGFloat
    let weight: CGFloat
    let textStyle: Font.TextStyle

    @ScaledMetric private var scaledSize: CGFloat

    init(fontName: String, baseSize: CGFloat, weight: CGFloat, textStyle: Font.TextStyle) {
        self.fontName = fontName
        self.baseSize = baseSize
        self.weight = weight
        self.textStyle = textStyle
        self._scaledSize = ScaledMetric(wrappedValue: baseSize, relativeTo: textStyle)
    }

    func body(content: Content) -> some View {
        content.font(.variable(fontName, size: scaledSize, weight: weight))
    }
}

extension View {
    func variableFont(
        _ name: String,
        size: CGFloat,
        weight: CGFloat = 400,
        relativeTo style: Font.TextStyle = .body
    ) -> some View {
        modifier(VariableDynamicTypeFont(
            fontName: name,
            baseSize: size,
            weight: weight,
            textStyle: style
        ))
    }
}

// Usage:
// Text("Dynamic Variable").variableFont("Inter", size: 17, weight: 500, relativeTo: .body)
```

---

## Quick Reference: Font Selection Decision Tree

```
What kind of content?
|
+-- System / Native feel
|   +-- Default        -> .system()
|   +-- Friendly       -> .system(design: .rounded)
|   +-- Editorial      -> .system(design: .serif)       (New York)
|   +-- Code/Data      -> .system(design: .monospaced)  (SF Mono)
|
+-- Custom branding
|   +-- Need variable weight control?
|   |   +-- Yes -> Inter, Roboto Flex, Outfit (variable fonts)
|   |   +-- No  -> Static font files
|   |
|   +-- What style?
|       +-- Clean modern        -> Inter, DM Sans, Plus Jakarta Sans
|       +-- Geometric           -> Poppins, Montserrat, Urbanist
|       +-- Humanist            -> Lato, Open Sans, Source Sans 3
|       +-- Tech / Developer    -> Space Grotesk, Manrope, Geist
|       +-- Rounded / Friendly  -> Nunito, Quicksand, Fredoka
|       +-- Editorial serif     -> Playfair Display, DM Serif Display
|       +-- Reading serif       -> Merriweather, Lora, EB Garamond
|       +-- Monospaced code     -> JetBrains Mono, Fira Code
|       +-- Bold display        -> Bebas Neue, Oswald, Anton
|
+-- Built-in (no bundling needed)
    +-- Sans-serif body     -> Avenir Next, Helvetica Neue, Gill Sans
    +-- Serif body          -> Georgia, Palatino, Charter, Iowan Old Style
    +-- Luxury display      -> Didot, Bodoni
    +-- Monospaced          -> Menlo, Courier New
    +-- Decorative          -> Copperplate, Rockwell, Zapfino
```

---

## Quick Reference: PostScript Names Cheat Sheet

The most commonly needed PostScript names for `Font.custom()`:

```swift
// Sans-Serif (built-in)
"HelveticaNeue"                   "HelveticaNeue-Bold"
"AvenirNext-Regular"              "AvenirNext-Bold"
"AvenirNext-DemiBold"             "AvenirNext-Medium"
"GillSans"                        "GillSans-Bold"
"Futura-Medium"                   "Futura-Bold"
"Optima-Regular"                  "Optima-Bold"

// Serif (built-in)
"Georgia"                         "Georgia-Bold"
"TimesNewRomanPSMT"               "TimesNewRomanPS-BoldMT"
"Palatino-Roman"                  "Palatino-Bold"
"Baskerville"                     "Baskerville-Bold"
"Didot"                           "Didot-Bold"
"BodoniSvtyTwoITCTT-Bold"        "BodoniSvtyTwoSCITCTT-Book"
"Charter-Roman"                   "Charter-Bold"
"IowanOldStyle-Roman"             "IowanOldStyle-Bold"

// Monospaced (built-in)
"Menlo-Regular"                   "Menlo-Bold"
"CourierNewPSMT"                  "CourierNewPS-BoldMT"
"AmericanTypewriter"              "AmericanTypewriter-Bold"

// Display (built-in)
"Copperplate"                     "Copperplate-Bold"
"Rockwell-Regular"                "Rockwell-Bold"
"DINAlternate-Bold"               "DINCondensed-Bold"

// Script (built-in)
"SnellRoundhand"                  "SnellRoundhand-Bold"
"BradleyHandITCTT-Bold"           "Zapfino"
"SavoyeLetPlain"                  "ChalkboardSE-Regular"

// International (built-in)
"PingFangSC-Regular"              "PingFangSC-Semibold"
"HiraginoSans-W3"                 "HiraginoSans-W6"
"AppleSDGothicNeo-Regular"        "AppleSDGothicNeo-Bold"
"KohinoorDevanagari-Regular"      "KohinoorBangla-Regular"
```

---

*This catalog covers the Apple system fonts, all major built-in iOS fonts with exact PostScript names, the top 100 Google Fonts for mobile development, custom font integration guides, proven font pairings, management utilities, and variable font techniques. Every font name string is ready to use directly in Font.custom() or UIFont(name:size:).*
