# Derive a usable seed from brand color evidence

## Context

An extracted logo color is a candidate, not proof of an official brand standard. Prefer a user-provided brand seed when available. `generate_color_system` accepts locally sampled opaque sRGB colors; the MCP adapter also accepts `imagePath` for a local PNG. It never uploads images or fetches URLs.

## Local workflow

1. Supply an explicit local `imagePath` (PNG, at most 1024 × 1024 and 4 MiB), or use a trusted local decoder to produce opaque sRGB samples. The PNG adapter skips transparent pixels and rejects color profiles requiring conversion. Exclude known background regions before manual sampling.
2. Pass a bounded list of colors and positive frequency weights as `imageSamples`.
3. The generator rejects very light/dark and near-neutral background-like samples, combines identical colors and ranks by frequency, with deterministic tie-breaking.
4. Inspect the chosen seed and candidates. The report includes black/white text contrast, showing which foreground is unsuitable without adjustment.
5. Confirm the intended identity with the designer. Regenerate supporting semantic variants and inspect them in real screens.

```json
{"imageSamples":[{"color":"#FFFFFF","weight":900},{"color":"#145AC8","weight":160},{"color":"#E34D7A","weight":30}]}
```

This heuristic favors chromatic logo colors. A monochrome logo can legitimately produce no extracted seed; provide black/gray explicitly rather than pretending background rejection identifies brand intent. Existing project colors and design tokens can also supply seeds, but neither reveals the designer's semantic roles automatically.

## Limits

The existing bundled PNG decoder is reused with size/dimension bounds. JPEG/HEIC/SVG, color-profile conversion, alpha compositing, spatial segmentation, near-color clustering and trademark lookup are unsupported. JPEG noise may create many small buckets; pre-quantize with the local decoder or select an explicit seed. Do not claim this is a full image-understanding system. Sample weights must be finite positive values; inputs are bounded for predictable local operation.
