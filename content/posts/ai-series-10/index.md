+++
date = 2026-06-17T10:00:00+05:30
draft = false
slug = "ai-series-10"
tags = ["MindSecSet"]
title = "the AI everyone is talking about — how does it actually work"
showHero = false
mood = "curious"
pullquote = "the same technology. opposite directions. attackers and defenders both using LLMs."
description = "Tokenisation, transformers, self-attention — inside the architecture that powers LLMs. Attackers are using it for phishing at scale. Defenders are using it too."
+++

*AI Series #10 — still figuring out AI, one post at a time*

# the AI everyone is talking about — how does it actually work

you've used it. you've been impressed by it. you probably don't know how it works.

that's fine. most people don't. but as a security professional — understanding what's under the hood matters. because attackers already do.

---

## generative AI — the concept

previous posts covered AI that classifies, detects, predicts. generative AI does something different — it **creates**.

text. images. code. audio. content that didn't exist before, generated from learned patterns.

four main types:
- **GANs** — two networks competing. one generates, one discriminates. pushes each other toward realism.
- **VAEs** — learn a compressed representation of data, generate new samples from it.
- **autoregressive models** — generate one element at a time based on everything before it.
- **diffusion models** — start from noise, learn to reverse it into meaningful output. next post covers this.

LLMs sit in the autoregressive camp. one token at a time, based on context.

---

## LLMs — large language models

trained on massive amounts of text. billions of parameters. learned patterns across language, facts, reasoning, code.

three characteristics that define them:
- **massive scale** — billions to trillions of parameters. scale unlocked capability.
- **few-shot learning** — perform new tasks with just a few examples. no retraining needed.
- **contextual understanding** — track context across long conversations. coherent, relevant responses.

---

## how they actually work

{{< ai-s10 >}}

**tokenisation** — text is broken into tokens. words, subwords, characters depending on the model. "intelligence" might become ["intel", "ligence"]. numbers, not words, flow through the network.

**embeddings** — each token becomes a vector. a point in high dimensional space. similar meanings cluster together. "king" and "queen" sit closer than "king" and "table."

**transformer architecture** — the engine underneath. processes entire sequences in parallel unlike RNNs. faster, more efficient, handles longer context.

**self-attention** — the key innovation. for every token, calculate how much attention it should pay to every other token. "which" in "the mat which was blue" learns to attend strongly to "mat." long range dependencies captured cleanly.

**encoders and decoders** — encoders process input and capture meaning. decoders generate output based on that meaning. some models use both. some use only decoders for pure generation.

---

## security implications

this is where it gets real for SOC analysts.

**attackers are using LLMs to:**
- generate convincing phishing emails at scale
- write malware variants faster
- automate social engineering scripts
- bypass content filters with paraphrasing

**defenders are using LLMs to:**
- summarise alerts and investigations
- generate detection rules from threat intel
- assist with incident response documentation
- build AI SOC analyst agents

the same technology. opposite directions. understanding it means you can evaluate both the threat and the tool critically.

---

next up — diffusion models. the engine behind AI generated images, deepfakes, and synthetic media. increasingly a security concern.

are you using any LLM tools in your SOC workflow currently? curious what's actually being adopted versus what's still theoretical.

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #11 — "from noise to meaning — the quiet revolution in AI"](/posts/ai-series-11/)*
*[back to series index](/posts/ai-fundamentals/)*
