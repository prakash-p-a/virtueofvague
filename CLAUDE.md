# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**Virtue of Vague (V·O·V)** — a Hugo static site (theme: Blowfish) deployed to https://virtueofvague.com. It blends two voices: personal reflection (tag `KnowTheBetter`) and cybersecurity writing (tag `MindSecSet`), plus a meditation/breath practice under `/stillness/`. The site is in deliberately lowercase, contemplative voice — preserve that register in any copy you write.

## Common commands

| Task | Command |
|------|---------|
| Dev server (clean start) | `hugo server --port 1313 --disableFastRender` |
| Production build | `hugo --gc --minify` |
| Identify live CSS bundle | `grep -oE 'main\.bundle\.min\.[a-f0-9]+\.css' public/index.html \| sort -u` |
| Delete orphan CSS bundles | `find public/css -name "main.bundle.min.*.css" ! -name "main.bundle.min.<live-hash>*" -delete` |
| Kill stray Hugo processes (Windows) | `taskkill /F /IM hugo.exe` |

There is no test suite, lint config, or package.json. Hugo + Blowfish provide all build tooling.

## Deployment

`.github/workflows/hugo.yaml` builds with `hugo --minify` and deploys `./public` to GitHub Pages on every push to `main`. **`public/` is gitignored** — CI rebuilds it from source on every push. Don't try to commit it. To inspect the built site locally, run `hugo --gc --minify` and browse `./public/`, but never `git add` it.

## Architecture

### Theme override pattern

`themes/blowfish/` is a **git submodule — never edit it directly**. Two override mechanisms:

1. **Assets** (icons, CSS) — drop a same-named file under project `assets/` and Hugo's `resources.Get` picks it up over the theme version. Example: `assets/icons/sun.svg` overrides Blowfish's default sun icon.
2. **Templates** — mirror the theme's path under project `layouts/`. Heavy because Blowfish's `single.html` is ~150 lines; prefer the scoped-injection pattern below for small additions.

### Per-section behavior via `data-section`

`layouts/_default/baseof.html` sets `data-section="{{ .Section | default 'home' }}"` on `<body>`. This is the project's primary mechanism for page-specific behavior without forking theme templates. Examples:

- The end-of-post "go breathe" callout is JS in `layouts/partials/custom-head.html` that runs only when `body.dataset.section === 'posts'`, injecting an aside after `.article-content`.
- Per-section CSS rules in `custom-head.html` key off `body[data-section="..."]`.

When adding section-scoped behavior, prefer this pattern over copying theme templates.

### `custom-head.html` is overloaded

`layouts/partials/custom-head.html` is a single file holding inline `<style>` blocks and `<script>` blocks for: starfield canvas, custom cursor with debris, reading progress bar, scroll-based word-reveal effect on posts, end-of-post breathe callout injection, header typography overrides, mobile menu fix-ups, theme-toggle pill styling, and homepage tagline styling. It's load-bearing and intentionally not split — adding a new global head-level feature usually means appending here.

### Cosmic-time coupling

`window._cosmicDilation` is a global float set by the breath practice (`layouts/stillness/single.html`) — `1` during inhale, `0.35` during exhale, `1` when idle. The starfield loop in `custom-head.html` reads it each frame, so the universe visibly slows on exhale across the whole site. Anything else that wants to "feel" the breath cadence can read this same global.

### Posts: folder-per-post + load-bearing frontmatter

Posts live at `content/posts/<slug>/index.md` with **TOML** frontmatter (`+++` delimiters, not YAML). These fields drive site behavior, not just metadata:

- `tags = ["KnowTheBetter"]` or `["MindSecSet"]` — chooses the homepage entry door
- `mood` — drives homepage mood filters; reuse existing vocabulary (check other posts) rather than inventing new moods, which would break the filter UI
- `pullquote` — shown on the homepage in the featured-post slot if this is the newest post

`disablePathToLower = true` is set in `config/_default/hugo.toml`, so **tag URLs preserve casing** — links must be `/tags/KnowTheBetter/`, not lowercase, or they 404.

### Stillness section is custom

`/stillness/` has dedicated layouts (`layouts/stillness/single.html`, `layouts/stillness/list.html`) instead of using the theme's defaults. The breath page (`/stillness/breath/`) is an elaborate single-file template with embedded JS that arcs a real moon photo across the viewport, syncs glow to inhale/exhale phases, slowly rotates the moon, and writes `_cosmicDilation`. Many constants are load-bearing and have been tuned across many sessions (see `memory/project_stillness_breath.md` for tuning history). When changing the moon, preserve "no black artifacts at the rim" — the current `background-size: 132%` crop is what fixes that.

## Windows debugging note

If a page renders unstyled or "looks broken" on `localhost:1313`, the #1 cause is **multiple `hugo.exe` processes** colliding (each serves a different fingerprinted CSS bundle, so the browser gets HTML pointing to a bundle a different server doesn't have → 404). Check `tasklist | grep -i hugo` before debugging CSS or templates; if multiple, kill all and start one fresh.

## Persistent memory

This project uses Claude Code's memory system at `C:\Users\Praka\.claude\projects\c--Users-Praka-OneDrive-Documents-GitHub-virtueofvague-virtueofvague\memory\`. `MEMORY.md` (the index) loads automatically into context; individual memory files cover user profile, communication style, workflow, debugging instincts, site architecture, post conventions, and stillness-page tuning history. Read those when relevant rather than re-deriving from the codebase.

## Things explicitly not in scope

- No npm/pip dependencies — pure Hugo
- No test suite or linter
- `ghostToHugo.exe` was a one-shot migration binary (Ghost CMS export → Hugo) — untracked and gitignored now; may still exist on disk locally
- Gitignored — don't stage: `.agents/`, `.claude/`, `resources/_gen/`, `.hugo_build.lock`, `public/`, `.vs/`, `.idea/`, `.vscode/`, `ghostToHugo.exe`
