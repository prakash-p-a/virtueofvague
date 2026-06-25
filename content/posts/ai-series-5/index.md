+++
date = 2026-05-13T10:00:00+05:30
draft = false
slug = "ai-series-5"
tags = ["MindSecSet"]
title = "no labels, no problem — finding patterns in the chaos"
showHero = false
mood = "curious"
pullquote = "you can't train a model on what you don't know exists. unsupervised learning handles exactly that."
description = "Zero days don't come with labels. Unsupervised learning — clustering, PCA, anomaly detection — finds patterns without being told what to look for."
+++

*AI Series #5 — still figuring out AI, one post at a time*

# no labels, no problem — finding patterns in the chaos

some threats don't come with a label. that's where unsupervised learning lives.

supervised learning needs examples. labelled data. known outcomes. but what about a zero day? a novel attack technique? behaviour you've never seen before and have no label for?

you can't train a model on what you don't know exists. unsupervised learning handles exactly that.

---

## the concept

no labels. no predefined categories. just raw data and an algorithm looking for structure.

it finds patterns, groupings, and anomalies on its own. three main tasks:

- **clustering** — group similar things together
- **dimensionality reduction** — simplify complex data without losing meaning
- **anomaly detection** — find what doesn't belong

---

## k-means clustering

picks K number of groups and assigns every data point to the nearest group center — called a **centroid**. then recalculates the center. repeats until stable.

security example — group network connections by behaviour. normal traffic clusters together. something unusual sits alone or in a tiny cluster. worth investigating.

{{< ai-s5 >}}

one challenge — you have to decide K upfront. two ways to find the right number:
- **elbow method** — plot variance vs K, look for where improvement flattens
- **silhouette score** — measures how well each point fits its cluster. higher is better.

---

## PCA — principal component analysis

data in security is high dimensional. hundreds of features per event. PCA compresses that without losing the important signal.

it finds the directions of maximum variance in your data — called **principal components** — and projects everything onto those directions. fewer dimensions. same essential information.

useful for:
- visualising high dimensional security data
- removing noise before feeding data into another model
- speeding up processing without losing insight

---

## why this matters

unsupervised learning is the engine behind threat hunting at scale. no rules. no signatures. just behaviour patterns that don't fit.

the analyst still makes the final call. but unsupervised learning surfaces what's worth looking at.

---

next up — anomaly detection. the concept your SIEM is built on. let's actually understand it.

what's your current approach to hunting for unknown threats? rules, intuition, or something else?

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #6 — "this is literally what your SIEM does — now let's understand it"](/posts/ai-series-6/)*
*[back to series index](/posts/ai-fundamentals/)*
