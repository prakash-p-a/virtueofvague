+++
date = 2026-04-29T10:00:00+05:30
draft = false
slug = "ai-series-3"
tags = ["MindSecSet"]
title = "your SOC playbook is literally a decision tree"
showHero = false
mood = "curious"
pullquote = "you've been running a decision tree in your head every shift. the algorithm just formalises it."
description = "Your escalation playbook is literally a decision tree. Here's how machines do the same thing — and why naive bayes still powers your phishing filter."
+++

*AI Series #3 — still figuring out AI, one post at a time*

# your SOC playbook is literally a decision tree

every escalation decision you make follows a pattern. machines do it too.

is this alert high severity? yes — escalate. is the IP external? yes — check threat intel. is there lateral movement? yes — page the IR team.

you've been running a decision tree in your head every single shift. the algorithm just formalises it.

---

## decision trees — the concept

a decision tree splits data into branches based on questions. at each node, it asks the most useful question. keeps splitting until it reaches a conclusion — a leaf node.

{{< ai-s3 >}}

three parts:
- **root node** — the starting question. the most important split.
- **internal nodes** — follow-up questions based on the answer.
- **leaf nodes** — the final decision. escalate. close. investigate further.

the tree learns which questions to ask by measuring how much each split reduces confusion in the data.

two ways it measures that:
- **gini impurity** — how mixed is this group? lower is better.
- **information gain** — how much does this split help? higher is better.

---

## naive bayes — the probability engine

different algorithm. same classification goal.

naive bayes uses probability to make decisions. it asks — given what i'm seeing, what's the most likely class?

security example — given this email contains "free", "click here", and "urgent" — what's the probability it's phishing?

it calculates that using bayes theorem:

`P(spam | words) = P(words | spam) * P(spam) / P(words)`

the "naive" part — it assumes every feature is independent. words don't influence each other. technically not always true. practically still works surprisingly well.

widely used in:
- spam filtering
- phishing detection
- malware classification

---

## which one to use

decision trees are great when you need explainability. you can literally show someone the path the model took — useful in SOC when you need to justify an escalation to management.

naive bayes is faster, simpler, works well with text data. less explainable but very efficient at scale.

---

next up — SVMs. how machines draw the sharpest possible line between threats and noise.

do your current SOC runbooks feel more like decision trees or probability calculations? curious how different teams think about this.

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #4 — "drawing the line — how machines separate threats from noise"](/posts/ai-series-4/)*
*[back to series index](/posts/ai-fundamentals/)*
