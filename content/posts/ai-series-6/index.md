+++
date = 2026-05-20T10:00:00+05:30
draft = false
slug = "ai-series-6"
tags = ["MindSecSet", "AIFundamentals"]
title = "this is literally what your SIEM does — now let's understand it"
showHero = true
mood = "curious"
pullquote = "alert fatigue isn't just a volume problem. it's a model calibration problem."
description = "Your SIEM knows what normal looks like. Isolation forest, LOF, one-class SVM — the three algorithms behind modern behavioural threat detection."
+++

*AI Series #6 — still figuring out AI, one post at a time*

# this is literally what your SIEM does — now let's understand it

your SIEM doesn't know what an attack looks like. it knows what normal looks like.

everything else is an anomaly.

that's the entire foundation of modern threat detection. not rules. not signatures. a learned baseline of normal behaviour — and a flag when something deviates from it.

you've been working on top of this every day. let's look inside.

---

## three types of anomalies

not all anomalies are equal. understanding the type helps you triage faster.

- **point anomaly** — one data point that sticks out. a single login at 3am from an unknown country. unusual but isolated.
- **contextual anomaly** — normal in one context, suspicious in another. 500MB download is fine from an engineer. flagged from an intern account at midnight.
- **collective anomaly** — individual events look fine. together they tell a different story. multiple failed logins from different IPs over 6 hours — none alarming alone, coordinated as a pattern.

{{< ai-s6 >}}

---

## isolation forest

builds random decision trees and measures how quickly each data point gets isolated.

anomalies are rare and different — they get isolated faster. fewer splits needed. shorter path = higher anomaly score.

fast, scalable, handles high dimensional data well. widely used in security tools for behavioural detection at scale.

anomaly score closer to 1 — investigate. closer to 0.5 — probably normal.

---

## local outlier factor (LOF)

compares the density of a data point to its neighbours.

if a point sits in a sparse region compared to its neighbours — it's likely an anomaly. think of a single house in an empty field versus a house in a dense neighbourhood.

good at detecting anomalies in datasets where density varies across regions. useful for user behaviour analysis where different user groups have different normal patterns.

---

## one-class SVM

draws a boundary around normal data. anything outside that boundary — anomaly.

uses the kernel trick from SVMs to handle complex, non-linear normal behaviour patterns. effective when you have clean examples of normal but limited examples of malicious.

common in scenarios where attack data is scarce but normal behaviour is well defined.

---

## why this matters

every false positive you chase, every alert you close — that's the model's definition of normal being tested against reality. understanding which algorithm your tool uses helps you understand why it fires, why it misses, and when to trust it.

alert fatigue isn't just a volume problem. it's a model calibration problem.

---

next up — reinforcement learning. genuinely new territory. how AI learns by doing, failing, and trying again.

which type of anomaly causes the most noise in your environment — point, contextual, or collective?

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #7 — "learn by doing — how AI figures things out the hard way"](/posts/ai-series-7/)*
*[back to series index](/posts/ai-fundamentals/)*
