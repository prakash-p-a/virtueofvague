# Debugging

## Page renders unstyled or "looks broken" on localhost

**First hypothesis: multiple `hugo.exe` processes colliding.** Each Hugo server picks its own fingerprinted CSS bundle hash. If two servers are running, the browser loads HTML from one and hits a 404 on the bundle that the other server is serving.

```powershell
tasklist | Select-String hugo
taskkill /F /IM hugo.exe   # kill all, then start one fresh
hugo server --port 1313 --disableFastRender
```

## SVG cover renders blank in browser

If the SVG is sourced from `<img src="...featured.svg">`, fills referencing `var(--hero-*)` resolve to their initial value (transparent) because img-loaded SVGs are isolated documents. Verify the hero partial is **inlining** the SVG, not emitting an `<img>` tag. See `svg-heroes.md`.

## 404 on a post or tag URL

`disablePathToLower = true` keeps casing. Check the actual `slug` in frontmatter, not the folder name. Tag URLs must match the tag string in frontmatter exactly — `/tags/KnowTheBetter/`, not `/tags/knowthebetter/`.

## Hugo template `can't evaluate field`

Common one: `.AsTime` does not exist on string dates in `data/*.yaml`. Use the global `time` function instead: `(time .date)` not `($.AsTime .date)`.

## `hugo --gc` fails with `Access is denied`

Windows file lock on `resources/_gen/images/*`. Either another process holds it (rare) or it's transient. Workarounds:
- Re-run after a moment.
- Drop `--gc` for the build: `hugo --minify` skips the resources cleanup.
- Manually delete `resources/_gen/` and retry.

## Wrangler `Authentication error code 10000`

OAuth token expired. Fix:

```
wrangler logout
wrangler login
```

For one-off commands, `--command="<inline SQL>"` avoids file-flag auth quirks.

## Build succeeds locally but pages 404 in production

`public/` is gitignored — GitHub Actions builds and publishes on push. Confirm:
- `.github/workflows/hugo.yaml` ran successfully.
- The slug/casing matches what you typed in the URL.
- Hugo's `--baseURL` matches the deployed URL (already set in workflow).

## GitHub Actions Node.js compatibility

CI uses `ubuntu-latest`. Actions that depend on Node.js 16/18 (e.g. `peaceiris/actions-hugo@v2`, `actions/checkout@v2`) fail with "Node.js 16 is not supported" on newer runners. Fix: upgrade all action versions to their v3/v4/v5 equivalents:

```yaml
- uses: actions/checkout@v4        # was v2
- uses: peaceiris/actions-hugo@v5  # was v2 or v3
- uses: actions/upload-pages-artifact@v3
- uses: actions/deploy-pages@v4
```
