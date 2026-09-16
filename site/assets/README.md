# Website artwork

- `playground-hero.webp`: original AI-generated decorative illustration created for the Developer Playground website design. It depicts a fictional reading-list interface; it is not a screenshot or evidence of a tool run. Optimized to 1536 × 512 WebP (approximately 128 KiB).
- `icons/*.svg`: Phosphor Icons regular set, retrieved from https://github.com/phosphor-icons/core. MIT license included in `icons/LICENSE`. The source SVGs are unmodified.

The website uses system fonts and local assets. No paid animation library, remote font service, or runtime image service is required. The original collage is retained as a design reference. The current hero uses the independent objects described below; it has no whole-scene floating animation.

## Independent playground objects

`objects/` contains eleven separately generated, transparent WebP objects matching the original artwork. Each object is its own focusable interaction target. Pointer dragging uses local transforms, pointer capture and a bounded return transition. Hover affects only the selected object; there is no scene-wide movement or idle animation. Touch keeps vertical page scrolling through `touch-action: pan-y`. Arrow keys move the focused object; Escape/Home and Reset restore positions. Freeze disables interaction; reduced motion removes hover effects and animated settling. These are image cutouts with perspective, not volumetric 3D meshes.

## Scroll story evidence

`reading-list-evidence.png` is an unmodified copy of `examples/reading-list/library.png`: a recorded iOS 26.5 simulator acceptance capture using synthetic book data. See `examples/reading-list/README.md` for provenance and limits. It is not a live AI session or an iOS 27 capture. The other scroll-story visuals reuse the decorative playground objects.
