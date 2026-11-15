# iOS UI pack: Apple resources and native components

Use this pack when you want to design an iPhone or iPad interface with Apple's official resources and then implement it using native controls. The pack is part of this repository's agent guidance, not a replacement for the Apple SDK or the actual design files.

## Start here

1. Open [Apple's iOS/iPadOS UI kit and the other official resources](resources.md). Choose Figma or Sketch and obtain each resource through Apple's own links.
2. Find the UI you need in the [component map](components.md); follow the linked Apple Human Interface Guidelines (HIG) and framework documentation for the chosen platform and deployment target.
3. Follow the [design-to-code and verification workflow](workflow.md). Keep the app's own content, branding and requirements in view.
4. Explore the separate [native SwiftUI gallery](../../../samples/IOSUIPack/README.md) on a Mac with Xcode. It contains original repository-authored examples using system APIs; it is not Apple's design kit or a pixel-perfect reproduction of one.

Agents can discover the pack using `node scripts/query-library.mjs search "iOS UI pack"` or the MCP `search_local_references` tool. Read the specific guide and source needed for the task rather than loading every resource at once. The GitHub source includes the pack; an already published npm package does not automatically acquire it.

## Scope and evidence

- **Official sources:** Apple Design Resources, Apple HIG, Apple's framework references, and Apple sample projects linked in this pack. Their owners retain their respective terms.
- **Coverage:** iOS and iPadOS foundations, content, navigation, controls, presentations, input, status, system experiences and common technology templates. Apple's category indexes remain the authoritative route to additional or changed components; this is not a claim that every component is implemented in the gallery.
- **Source inspection:** Apple listed the linked kit destinations on November 15, 2026. The Figma/Sketch files themselves and their component variants were not inspected in this environment. Their exact contents, measurements, variables and licenses must be checked at the source before use.
- **Native gallery:** An original demo of selected standard controls, forms, presentations and states. See its README for the actual build and runtime verification status.

## Using Apple files and fonts

Apple's [Design Resources license](https://developer.apple.com/support/downloads/terms/apple-design-resources/Apple-Design-Resources-License-20230621-English.pdf) restricts use and redistribution. This repository provides links instead of copying or republishing Apple's kits, fonts, artwork or symbols. Obtain the files yourself, review the terms shown with the current resource, and follow Apple's rules for your intended use. The repository's MIT license covers repository-authored material; it does not relicense Apple assets. For app UI use system font and SF Symbols APIs; consult the relevant Apple terms for separate design-time downloads and custom exports.
