# Theme-switching SVG hero covers

KnowTheBetter posts ship a hand-drawn `featured.svg` whose fills/strokes reference `var(--hero-bg-1)`, `var(--hero-gold)`, etc. Those variables are declared twice in `layouts/partials/custom-head.html` — dark defaults on `:root`, light overrides under `html:not(.dark)` — so flipping the theme toggle re-paints the artwork live with no reload.

## Why inlining is required

A `<img src="cover.svg">` tag **cannot see the parent page's CSS variables** — an `<img>`-loaded SVG is its own document, so every `var(--hero-*)` reference resolves to its initial value (transparent) and the cover renders blank. The SVG must be inlined into the page HTML so it inherits the document's variable scope.

## Overridden partials

Three theme partials are overridden to inline any local page-resource cover with `MediaType.SubType == "svg"`:

- `layouts/partials/hero/big.html` — the post-page hero (site uses `article.heroStyle = "big"`)
- `layouts/partials/article-link/simple.html` — list/term/recent rows (when `cardView = false`)
- `layouts/partials/article-link/card.html` — list/term/recent cards (when `cardView = true`)

Each follows the same shape:

```hugo
{{ $isInlineSvg := false }}
{{ with $featured }}
  {{ if and (not (reflect.IsSlice .)) (eq .MediaType.SubType "svg") }}
    {{ $isInlineSvg = true }}
  {{ end }}
{{ end }}

{{ if $isInlineSvg }}
  {{ $svgRaw := os.ReadFile (printf "%s%s" $page.File.Dir $featured.Name) }}
  <div class="... hero-inline-svg">{{ $svgRaw | safeHTML }}</div>
{{ else }}
  {{/* standard <img> path */}}
{{ end }}
```

We use `os.ReadFile` rather than `.Content` because Hugo's image-type page resources don't expose `.Content` as text.

Raster covers (MindSecSet PNGs, welcome posts) fall through to the standard `<img>` path untouched.

## Container CSS

`custom-head.html` sizes the inlined SVG to fill its container in both the figure and thumbnail layouts:

- `figure.hero-inline-svg svg` — width 100%, height auto (preserves 16:9 ratio in post hero)
- `.thumbnail_card.hero-inline-svg svg`, `.thumbnail.hero-inline-svg svg` — absolute-positioned, 100%/100% (mimics the absolutely-positioned `<img>` cover behavior in list views)

The `preserveAspectRatio="xMidYMid slice"` on each SVG handles cover-style cropping at narrow widths.

## Variable palette

Declared in `custom-head.html`. Dark = the brand default; light = warm-cream override. Both sets share the same names so a single SVG paints correctly in either mode:

`--hero-bg-1`, `--hero-bg-2`, `--hero-bg-3`, `--hero-mute`, `--hero-edge`, `--hero-stone`, `--hero-stone-warm`, `--hero-paper`, `--hero-gold`, `--hero-gold-deep`, `--hero-bright`

## Adding a new themeable cover

1. Author an SVG with `viewBox="0 0 1600 900"` and `preserveAspectRatio="xMidYMid slice"`.
2. Paint with `var(--hero-*)` from the palette above (don't hardcode hex).
3. Save as `content/posts/<slug>/featured.svg`.
4. Done — both hero and list views inline + theme-switch automatically.

## Known limitation

Each SVG defines `<defs><linearGradient id="bg">…` etc. Inlining means multiple SVGs on the same page share an ID namespace and could collide. Not an issue today — list pages render many SVGs but each has a unique `id="bg"` that resolves against its own SVG root. If we ever inline two SVGs that reference each other's defs (unlikely), namespace the IDs.
