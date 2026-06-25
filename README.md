# virtue of vague

> *the less you know, more you believe.*

a personal site by [Prakash Ayyanagoudar](https://virtueofvague.com/about/) — built with [Hugo](https://gohugo.io/) and the [Blowfish](https://blowfish.page/) theme.

---

## what this is

two streams. one space.

**KnowTheBetter** — emotions, spirituality, philosophy, growth. the inner stuff.

**MindSecSet** — cybersecurity career, tools, threat intelligence, and the mindset behind it all.

not a polished knowledge base. a journal. raw reflections on figuring things out one vague step at a time.

---

## site structure

```
virtueofvague.com/
├── posts/              # all blog content (KnowTheBetter + MindSecSet)
├── tags/
│   ├── KnowTheBetter/  # personal / philosophical posts
│   └── MindSecSet/     # cybersecurity / career posts
├── stillness/breath/   # breath game (Breath & Be)
├── discussions/        # discussions section
├── reads/              # reads / book notes
└── about/              # about the author
```

---

## tech stack

| layer | tool |
|---|---|
| static site generator | Hugo 0.162.1 |
| theme | Blowfish |
| hosting | — |
| content format | Markdown + frontmatter |

---

## content tags

every post gets one tag:

- `KnowTheBetter` — personal, emotional, philosophical
- `MindSecSet` — cybersecurity, career, technical

posts also carry a mood label: `quiet` / `fierce` / `lost` / `curious` / `tender`

---

## running locally

```bash
# install Hugo (extended version recommended)
brew install hugo

# clone the repo
git clone <your-repo-url>
cd virtueofvague

# start local dev server
hugo server -D
```

site runs at `http://localhost:1313`

---

## writing a new post

```bash
hugo new posts/your-post-slug.md
```

frontmatter template:

```yaml
---
title: "your title here"
date: YYYY-MM-DD
tags: ["KnowTheBetter"]   # or MindSecSet
draft: false
---
```

---

## note on ai

posts are written by Prakash. ai helps clean up typos. brain works faster than fingers. xd

---

## license

words are mine. steal the ideas, not the sentences.

© 2026 Virtue of Vague