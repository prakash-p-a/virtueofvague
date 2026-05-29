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
