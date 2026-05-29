# Architecture

## Theme override pattern

`themes/blowfish/` is a **git submodule — never edit it directly**. Two override mechanisms:

1. **Assets** (icons, CSS) — drop a same-named file under project `assets/` and Hugo's `resources.Get` picks it up over the theme version. Example: `assets/icons/sun.svg` overrides Blowfish's default sun icon.
2. **Templates** — mirror the theme's path under project `layouts/`. Heavy because Blowfish's `single.html` is ~150 lines; prefer the scoped-injection pattern below for small additions.

## Per-section behavior via `data-section`

`layouts/_default/baseof.html` sets `data-section="{{ .Section | default 'home' }}"` on `<body>`. This is the project's primary mechanism for page-specific behavior without forking theme templates. Examples:

- The end-of-post "go breathe" callout is JS in `layouts/partials/custom-head.html` that runs only when `body.dataset.section === 'posts'`, injecting an aside after `.article-content`.
- Per-section CSS rules in `custom-head.html` key off `body[data-section="..."]`.

When adding section-scoped behavior, prefer this pattern over copying theme templates.

## `custom-head.html` is overloaded

`layouts/partials/custom-head.html` is a single file holding inline `<style>` blocks and `<script>` blocks for: starfield canvas, custom cursor with debris, reading progress bar, scroll-based word-reveal effect on posts, end-of-post breathe callout injection, header typography overrides, mobile menu fix-ups, theme-toggle pill styling, hero-svg CSS variables (dark/light palettes), and homepage tagline styling. It's load-bearing and intentionally not split — adding a new global head-level feature usually means appending here.

## Cosmic-time coupling

`window._cosmicDilation` is a global float set by the breath practice (`layouts/stillness/single.html`) — `1` during inhale, `0.35` during exhale, `1` when idle. The starfield loop in `custom-head.html` reads it each frame, so the universe visibly slows on exhale across the whole site. Anything else that wants to "feel" the breath cadence can read this same global.

## Stillness section is custom

`/stillness/` has dedicated layouts (`layouts/stillness/single.html`, `layouts/stillness/list.html`) instead of using the theme's defaults. The breath page (`/stillness/breath/`) is an elaborate single-file template with embedded JS that arcs a real moon photo across the viewport, syncs glow to inhale/exhale phases, slowly rotates the moon, and writes `_cosmicDilation`. Many constants are load-bearing and have been tuned across many sessions (see `memory/project_stillness_breath.md` for tuning history). When changing the moon, preserve "no black artifacts at the rim" — the current `background-size: 132%` crop is what fixes that.
