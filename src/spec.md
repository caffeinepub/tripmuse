# Specification

## Summary
**Goal:** Switch TripMuse’s visual theme from a sunset-orange primary palette to a sky-blue primary palette while preserving the current dark, vibrant, readable look.

**Planned changes:**
- Update global theme color tokens so primary brand color (buttons, links, focus rings, icons, gradients, and interactive states) uses a sky-blue palette instead of sunset orange, maintaining accessible contrast on dark surfaces.
- Update premium shadow/glow styling (including reusable shadow utilities and any Tailwind shadow tokens) to use subtle sky-blue glow values instead of orange, without changing overall depth/legibility.
- Update the app-wide `.app-backdrop` overlay gradients to a cool/sky-blue treatment while preserving layering (z-index), opacity behavior, and reduced-motion behavior for drift animation.
- Add a new sky-blue background image asset and update `.app-backdrop` to use it on both authenticated AppShell screens and the unauthenticated AuthGate screen.

**User-visible outcome:** The app’s branding and backdrop shift to a sky-blue theme across screens (including glows and gradients), with the same dark-mode readability and motion preferences respected.
