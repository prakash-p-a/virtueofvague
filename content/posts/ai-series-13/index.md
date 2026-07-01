+++
date = 2026-07-01T10:00:00+05:30
draft = false
slug = "ai-series-13"
tags = ["MindSecSet", "AIFundamentals"]
title = "how to actually talk to Claude — and get something useful back"
showHero = true
mood = "curious"
pullquote = "google is built for keywords. Claude is built for context. the more you give it, the better it performs."
description = "Most people treat their first Claude prompt like a Google search. How to write prompts that work, the iteration mindset, common mistakes, and the 4D framework — filtered for SOC analysts."
+++

{{< ai-series-header n="13" total="18" >}}

# how to actually talk to Claude — and get something useful back

most people treat their first Claude prompt like a google search. that's where it goes wrong.

google is built for keywords. Claude is built for context. the more you give it, the better it performs. one line in, one line out — you're not using it, you're just testing it.

---

## what Claude actually is

not a chatbot. not a search engine. a thinking partner.

Claude is built on three principles — helpful, harmless, honest. trained to align with human values, take direction on tone and behavior, and work collaboratively across a wide range of tasks.

what it can do well:
- writing and content creation
- research and analysis
- coding assistance
- complex reasoning and problem solving
- learning new things at your pace

for SOC analysts specifically — think investigation summaries, detection rule drafting, alert triage documentation, threat intel synthesis, report writing. all of it.

---

## how to write prompts that actually work

three things every good prompt needs:

**set the stage** — give Claude your role and context. "i'm a SOC L2 analyst investigating a potential phishing incident" lands very differently than just "help me with phishing."

**define the task** — be specific about what you want. write, analyze, summarize, compare — tell Claude exactly what action to take.

**specify rules** — tone, format, length, style. "keep it under 200 words, bullet points, professional tone" saves you three rounds of back and forth.

putting it together:

*"i'm a SOC analyst writing an incident summary for a non-technical stakeholder. summarize the following alert details in plain language, under 150 words, no jargon, with a clear recommended action at the end."*

that prompt gets you something usable on the first try.

{{< ai-s13 >}}

---

## the iteration mindset

first response is a draft. not a final answer.

if it's too long — "cut this by half, keep the key points."
if the tone is off — "make this more direct, less formal."
if it missed the point — "i was asking about X not Y, let me clarify."

chaining short follow-up prompts is more effective than writing one massive prompt upfront. think conversation, not command.

---

## common mistakes and quick fixes

| problem | fix |
|---|---|
| response too generic | add more context about your specific situation |
| wrong tone | describe it plainly — "more direct" or "less formal" |
| too long or too short | be explicit — "under 100 words" or "comprehensive, length isn't a concern" |
| factually wrong | verify independently, ask Claude to cite sources |
| went off track | start a fresh chat with a clearer prompt |

---

## one framework worth knowing

Anthropic references the 4D framework for AI fluency — delegation, description, discernment, diligence.

simplified for daily use:
- **delegate** — decide what Claude should handle vs. what needs your judgment
- **describe** — communicate clearly what you need
- **discern** — evaluate what comes back critically
- **diligence** — use it responsibly, verify what matters

you're already doing this intuitively. naming it just makes you more deliberate about it.

---

next up — projects, artifacts, and skills. how to stop starting from scratch every single conversation.

what's the most frustrating Claude response you've gotten? usually points to a prompt that needed more context.

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #14 — "stop starting from scratch — organising your work in Claude"](/posts/ai-series-14/)*
*[back to series index](/posts/ai-fundamentals/)*
