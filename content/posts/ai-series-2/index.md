+++
date = 2026-04-22T10:00:00+05:30
draft = false
slug = "ai-series-2"
tags = ["MindSecSet"]
title = "teaching machines with examples — like training a junior analyst"
showHero = true
mood = "curious"
pullquote = "you've been creating labelled training data every single day. you just didn't have a name for it."
description = "Every malware sample you label, every alert you triage — you've been creating training data. Here's the supervised learning behind the tools you already use."
+++

*AI Series #2 — still figuring out AI, one post at a time*

# teaching machines with examples — like training a junior analyst

here's something you already do at work without realising it.

every malware sample you label. every alert you close as true positive or false positive. every ticket you tag as phishing or legitimate — you're creating labelled data. and labelled data is exactly how supervised learning works.

you've been doing this. you just didn't have a name for it.

---

## supervised learning — the concept

feed a machine enough labelled examples, it learns the pattern. show it 10,000 emails — spam and not spam — it figures out what separates them. then it classifies new emails on its own.

simple idea. powerful at scale.

{{< ai-s2 >}}

two types of problems it solves:
- **classification** — is this malicious or benign? spam or not spam? predicts a category.
- **regression** — how severe is this? what's the risk score? predicts a number.

---

## linear regression — predicting numbers

draws the best straight line through your data to predict a continuous value.

security example — predicting alert volume based on time of day, network load, user activity. the line captures the relationship. you get a number out.

formula is simple: `y = mx + c`
slope tells you the relationship. intercept tells you the baseline. that's it.

---

## logistic regression — predicting categories

same idea but the output is a probability between 0 and 1. cross a threshold — it makes a decision.

security example — is this login attempt legitimate? probability 0.9 — flag it. probability 0.1 — let it through.

the sigmoid function does the heavy lifting here. takes any input, squashes it between 0 and 1. clean, interpretable, still widely used.

---

## why this matters to you

most classification models in your security tools started here. before neural networks, before deep learning — logistic regression was doing the work. it's still running inside more tools than vendors admit.

understanding it means you understand the decision your tool is making. and when to trust it.

---

next up — decision trees and naive bayes. spoiler: your escalation playbook is literally a decision tree.

which part of your SOC workflow do you think is most "supervised learning" without you realising it?

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #3 — "your SOC playbook is literally a decision tree"](/posts/ai-series-3/)*
*[back to series index](/posts/ai-fundamentals/)*
