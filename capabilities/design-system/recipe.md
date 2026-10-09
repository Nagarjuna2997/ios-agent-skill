# SwiftUI design system and components

This module is included automatically when the agent creates a planned app. It depends on `color-assets`, whose semantic colors use the palette selected in `PLAN.md`.

## Tokens

Use `AppTheme.Space` for layout rhythm, `AppTheme.Radius` for continuous card/control corners, and `AppTheme.TypeStyle` for system text styles that scale with Dynamic Type. `AppColor` comes from the asset catalog and adapts to light and dark appearance.

## Components

- `HeroHeader`: a clear page title and supporting copy with a small symbolic accent.
- `AppCard`: grouped content on a semantic surface.
- `AppStatTile`: a compact metric with a label and SF Symbol.
- `AppChip`: short filter or status label.
- `AppSectionHeader`: consistent section hierarchy.
- `AppProgressRing`: labeled progress with an accessibility value.
- `AppEmptyStateView`: honest empty state with a next action.
- `ThumbnailPlaceholder`: lightweight, brand-colored artwork when no user image exists.
- `AppPrimaryButtonStyle`: consistent, accessible primary action feedback.
- `SkeletonBlock`: static placeholder styling for loading state, with no unrequested animation.

Use layouts suited to each screen's purpose. Keep settings and data-entry forms in `Form`; dashboards, editorial content and feature surfaces should use purpose-built SwiftUI layouts. Respect Reduce Motion and use native text styles.
