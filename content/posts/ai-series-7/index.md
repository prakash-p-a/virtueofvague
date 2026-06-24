+++
date = 2026-05-27T10:00:00+05:30
draft = false
slug = "ai-series-7"
tags = ["MindSecSet"]
title = "learn by doing — how AI figures things out the hard way"
showHero = false
mood = "curious"
pullquote = "no labelled data. no predefined rules. just feedback from experience."
description = "Reinforcement learning is the technology behind adaptive SOAR — an agent that learns which actions lead to faster resolution through trial and error."
+++

*AI Series #7 — still figuring out AI, one post at a time*

# learn by doing — how AI figures things out the hard way

how do you learn to drive? not from a textbook. from doing it, failing, adjusting.

nobody handed you a perfect rulebook. you got in the car, made mistakes, got feedback, improved. over time your decisions got better because the feedback loop worked.

reinforcement learning is exactly that. an algorithm that learns by doing.

this one is genuinely new territory for most SOC analysts. no shortcuts here. let's build it properly.

---

## the core idea

an **agent** interacts with an **environment**. it takes **actions**. it receives **rewards** or **penalties** based on those actions. over time it learns which actions lead to better outcomes.

no labelled data. no predefined rules. just feedback from experience.

five things to know:

- **agent** — the learner. the decision maker.
- **environment** — everything the agent interacts with.
- **state** — current situation the agent is in.
- **action** — what the agent does next.
- **reward** — feedback. positive for good decisions. negative for bad ones.

the goal — maximise cumulative reward over time. not just the next action. the whole sequence.

---

## Q-learning

most well known reinforcement learning algorithm.

builds a **Q-table** — a lookup table of every state-action pair and its expected reward. agent consults this table to decide what to do next.

update rule:
`Q(s,a) = Q(s,a) + α * [reward + γ * max(Q(s',a')) - Q(s,a)]`

two key parameters:
- **α (learning rate)** — how much new information overrides old. too high — unstable. too low — learns slowly.
- **γ (discount factor)** — how much future rewards matter. close to 1 — thinks long term. close to 0 — only cares about immediate reward.

one challenge — exploration vs exploitation. does the agent try new actions or stick to what worked before? **epsilon-greedy** strategy balances this — explore randomly with probability ε, exploit best known action otherwise.

---

## SARSA

similar to Q-learning with one key difference.

Q-learning learns the **optimal** policy regardless of what it's actually doing — off-policy.

SARSA learns the value of the policy it's **currently following** — on-policy. it updates based on the actual next action taken, not the theoretical best one.

result — SARSA is more cautious. better in environments where safety matters. Q-learning is more aggressive. better when finding the optimal path is the priority.

---

## SOC relevance

reinforcement learning is behind automated response tuning in advanced SOAR platforms. the system learns which response actions lead to faster resolution, fewer false positives, fewer escalations — and adjusts over time.

not widely deployed yet in most SOC environments. but it's coming. understanding it now puts you ahead of the curve.

---

next up — deep learning and neural networks. the technology behind everything your vendors call "AI-powered."

does your SOAR platform learn from outcomes or just execute static playbooks? curious how advanced your automation actually is.

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #8 — "the brain analogy everyone uses — here's what it actually means"](/posts/ai-series-8/)*
*[back to series index](/posts/ai-fundamentals/)*
