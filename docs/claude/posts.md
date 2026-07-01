# Post conventions

## Folder-per-post + TOML frontmatter

Posts live at `content/posts/<slug>/index.md` with **TOML** frontmatter (`+++` delimiters, not YAML). These fields drive site behavior, not just metadata:

- `tags = ["KnowTheBetter"]` or `["MindSecSet"]` — chooses the homepage entry door
- `mood` — drives homepage mood filters; reuse existing vocabulary (check other posts) rather than inventing new moods, which would break the filter UI
- `pullquote` — shown on the homepage in the featured-post slot if this is the newest KnowTheBetter post
- `showHero = true` — required for the post-page hero cover to render
- `slug` — overrides folder name for the URL; case is preserved (see below)

## Case-sensitive URLs

`disablePathToLower = true` is set in `config/_default/hugo.toml`, so **tag URLs preserve casing**. Links must be `/tags/KnowTheBetter/`, not lowercase, or they 404.

Same applies to post slugs: `slug = "Think-negative"` produces `/posts/Think-negative/`, not `/posts/think-negative/`. When debugging a 404, check the actual slug, not the folder name — `content/posts/Think_negative/index.md` has `slug = "Think-negative"`, so its URL is the hyphenated form, not the underscore form of the folder.

## Hero cover image

Drop a `featured.svg` (KnowTheBetter — themeable) or `featured.png` (MindSecSet — photo). The hero partial auto-detects which one and renders appropriately. See `svg-heroes.md` for the SVG theme-switching mechanics.

## Homepage featured slot

Pinned to KnowTheBetter only. The newest KnowTheBetter post with a `pullquote` field appears in the featured slot. MindSecSet posts never occupy the top slot — kept reserve for the personal voice. If no KnowTheBetter post qualifies, the slot is hidden.

## Inline SVG concept diagrams (shortcodes)

Concept diagrams live in `layouts/shortcodes/` and are invoked with `{{< shortcode-name >}}`. Existing ones:

- `million-years.html` — reference style (robert-sapolsky post)
- `axios-attack.html` — 5-step supply-chain attack chain
- `copy-fail.html` — 4-step LPE exploit chain (CVE-2026-31431)
- `eyes-filter.html` — radial "same sea, different filters" diagram
- `negative-fork.html` — Y-fork: negative thinking vs. overthinking
- `tool-pillars.html` — 3 pillars converging to PURPOSE
- `ai-series-header.html` — "AI Series · post N of 12 · series index →" banner; usage: `{{< ai-series-header n="1" >}}`
- `ai-s0.html` through `ai-s11.html` — per-post concept diagrams for the MindSecSet AI Fundamentals 12-post series (one shortcode per post, matching the post slug number)

Palette (all inline styles, no `<style>` block — avoids Blowfish CSS leakage):
`#0a0a0a` bg · `#e8e4dc` bright text · `#a89880` labels · `#c8c0b4` body · `#6a5f52` muted · `#3a3630` connectors · `#c8a56a` gold accent · `#111009` slight lift · `#2a2622` hairline dividers

Place diagrams right after the paragraph that introduces the concept being visualized. Don't spam — only add where a diagram genuinely reduces cognitive load.
