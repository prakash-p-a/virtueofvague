+++
date = 2026-07-01T10:00:00+05:30
draft = false
slug = "ai-series-14"
tags = ["MindSecSet", "AIFundamentals"]
title = "stop starting from scratch — organising your work in Claude"
showHero = true
mood = "curious"
pullquote = "Claude has a memory problem. Projects fix it."
description = "Projects, Artifacts, and Skills — the three building blocks for persistent, structured Claude workflows. Stop re-explaining yourself every conversation."
+++

{{< ai-series-header n="14" total="18" >}}

# stop starting from scratch — organising your work in Claude

Claude has a memory problem. Projects fix it.

every new chat starts blank. no context. no history. no understanding of who you are or what you're working on. if you're re-explaining yourself every single conversation — that's the problem. Projects, Artifacts, and Skills are how you solve it.

---

## Projects — your persistent workspace

a Project is a self-contained workspace with its own memory, knowledge base, and instructions. everything Claude needs to understand your work — already loaded before you type a single word.

three things a Project gives you:

**project knowledge** — upload documents Claude should always reference. brand guidelines, SOC playbooks, investigation templates, threat intel reports. no more re-uploading the same files every conversation.

**project instructions** — tell Claude how to behave in this context. tone, format, expertise level, specific requirements. applies to every chat inside the project automatically.

**collaboration** — on Team and Enterprise plans, share projects with teammates. everyone works from the same context, same instructions, same knowledge base.

practical SOC use cases:
- incident response project with playbooks and templates loaded
- threat intel project with your current campaigns and IOC context
- reporting project with your organisation's documentation style baked in

---

## Artifacts — outputs you can actually use

when Claude creates something substantial — a document, a piece of code, a diagram — it appears as an Artifact. a dedicated window alongside your chat, rendered and ready to use.

artifact types:
- **documents** — reports, summaries, templates, exportable as Word or PDF
- **code** — working code in any language, downloadable
- **diagrams** — flowcharts, sequence diagrams, org charts via Mermaid
- **HTML pages** — complete web pages, interactive prototypes
- **React components** — functional UI elements with real logic

for SOC work — investigation summaries as exportable documents, detection logic as code artifacts, incident timelines as diagrams. finished outputs, not just chat responses.

you can share artifacts publicly via link or within your organisation. others can remix them — open in their own Claude to modify and build on.

---

## Skills — reusable workflows

Skills are instruction packages that teach Claude how to execute specific tasks consistently. think of them as expertise modules Claude loads when relevant.

two types:

**Anthropic built-in Skills** — Excel, Word, PowerPoint, PDF creation. already available on paid plans. Claude invokes them automatically when you ask for these file types.

**custom Skills** — workflows you define. your investigation report format. your weekly threat summary template. your detection rule writing process. create them once, Claude follows them every time.

projects store knowledge. skills define process. the two complement each other — your Project holds the what, your Skill handles the how.

{{< ai-s14 >}}

---

## how they work together

imagine a weekly threat intel report workflow:

- **Project** holds your threat intel sources, report templates, and writing style instructions
- **Skill** encodes the exact process — pull IOCs, summarise TTPs, format by severity, add recommendations
- **Artifact** delivers the finished report as a downloadable document

one prompt. consistent output. every time.

---

next up — connecting Claude to the tools you already use. this is where it gets seriously useful.

which part of your current workflow involves the most repetitive context-setting? that's your first Project candidate.

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #15 — "Claude meets your tools — connectors and enterprise search"](/posts/ai-series-15/)*
*[back to series index](/posts/ai-fundamentals/)*
