# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep this file short — link out to `docs/claude/*.md` for detail.

## What this repo is

**Virtue of Vague (V·O·V)** — a Hugo static site (theme: Blowfish) at https://virtueofvague.com. Two voices: personal reflection (`KnowTheBetter`) and cybersecurity writing (`MindSecSet`), plus a breath practice at `/stillness/`. The site is in deliberately lowercase, contemplative voice — preserve that register in any copy you write.

Two backends:
- **Site** — Hugo + Blowfish, deployed to GitHub Pages.
- **`worker/`** — Cloudflare Worker (D1 + KV + Turnstile) powering comments/forum + `/admin/` panel. See `memory/project_comments_forum.md`.

## Common commands

| Task | Command |
|------|---------|
| Dev server (clean start) | `hugo server --port 1313 --disableFastRender` |
| Production build | `hugo --gc --minify` |
| Kill stray Hugo processes (Windows) | `taskkill /F /IM hugo.exe` |

No package.json, no test suite, no linter. Hugo + Blowfish provide all build tooling.

### Worker (`worker/`)

| Task | Command |
|------|---------|
| Local dev | `wrangler dev` |
| Deploy | `wrangler deploy` |
| Run D1 SQL | `wrangler d1 execute DB --command="SELECT ..."` |
| Re-auth if expired | `wrangler logout && wrangler login` |

## Deployment

`.github/workflows/hugo.yaml` builds with `hugo --minify` and deploys `./public` to GitHub Pages on every push to `main`. **`public/` is gitignored** — CI rebuilds it from source. Don't try to commit it.

## Key architectural rules

- **Add section-scoped behavior via `data-section`** (set on `<body>`) — not by copying theme templates. JS/CSS key off `body.dataset.section`.
- **Global head-level features** (styles, scripts) go in `layouts/partials/custom-head.html` — append there, don't create new partials.
- **Never edit `themes/blowfish/` directly** — override via project `assets/` (same path wins) or `layouts/` mirror.

## Sub-docs (read when relevant)

- [docs/claude/architecture.md](docs/claude/architecture.md) — theme override pattern, `data-section` per-section behavior, `custom-head.html` overloading, cosmic-time coupling, the custom `/stillness/` layout.
- [docs/claude/svg-heroes.md](docs/claude/svg-heroes.md) — the inlined-SVG cover system that lets KnowTheBetter hand-drawn covers re-paint on theme toggle. Read before touching `hero/big.html`, `article-link/simple.html`, `article-link/card.html`, the `--hero-*` palette, or any `featured.svg`.
- [docs/claude/posts.md](docs/claude/posts.md) — folder-per-post layout, TOML frontmatter fields that drive site behavior, case-sensitive URLs, homepage featured-slot rules.
- [docs/claude/debugging.md](docs/claude/debugging.md) — first-hypothesis checklist for common failure modes (multiple Hugo processes, blank SVGs, 404s, build errors, wrangler auth).

## Persistent memory

Memory system at `C:\Users\Praka\.claude\projects\c--Users-Praka-OneDrive-Documents-GitHub-virtueofvague-virtueofvague\memory\`. `MEMORY.md` (the index) loads automatically. Individual files cover user profile, communication style, workflow, debugging instincts, post conventions, comments+forum stack, and stillness tuning history. Read those when relevant rather than re-deriving.

## Things explicitly not in scope

- No npm/pip dependencies — pure Hugo.
- Gitignored — don't stage: `.agents/`, `.claude/`, `resources/_gen/`, `.hugo_build.lock`, `public/`, `.vs/`, `.idea/`, `.vscode/`, `ghostToHugo.exe`.
