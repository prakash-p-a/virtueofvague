+++
date = 2026-06-10T10:00:00+05:30
draft = false
slug = "ai-series-9"
tags = ["MindSecSet"]
title = "how AI sees images and reads sequences — two tools, one post"
showHero = false
mood = "curious"
pullquote = "CNNs for grids. RNNs for sequences. wrong tool, wrong result."
description = "CNNs see spatial patterns in malware binaries. RNNs and LSTMs track behavioural sequences across user sessions. Two deep learning tools, two different problems."
+++

*AI Series #9 — still figuring out AI, one post at a time*

# how AI sees images and reads sequences — two tools, one post

not all data looks the same. images are grids. logs are sequences. deep learning has a different tool for each.

feed an image into a standard neural network — it loses all spatial information. feed a log sequence into one — it loses all temporal context. wrong tool, wrong result.

two architectures were built to solve this. CNNs for grids. RNNs for sequences.

---

## CNNs — convolutional neural networks

built for grid-like data. images, screenshots, binary visualisations.

three layer types working together:

- **convolutional layers** — slide a small filter across the input. detect local patterns. edges, textures, shapes. each filter produces a feature map highlighting where that pattern appears.
- **pooling layers** — shrink the feature maps. keep the important signal, reduce noise and computation.
- **fully connected layers** — take the extracted features, make the final classification decision.

hierarchical learning:
- early layers detect edges and textures
- middle layers detect shapes and patterns
- deeper layers detect complex structures and objects

**security application — malware visualisation.** convert a binary file to a grayscale image. different malware families produce visually distinct patterns. CNN classifies the family from the image. fast, effective, no code execution required.

---

## RNNs — recurrent neural networks

built for sequential data. text, logs, network traffic, time series.

standard networks process inputs independently. RNNs maintain a **hidden state** — memory of previous inputs. each step considers current input and what came before.

security application — log sequence analysis. user behaviour over time. network connection patterns. the sequence matters as much as the individual event.

---

## the vanishing gradient problem

standard RNNs struggle with long sequences. gradients shrink as they travel back through time steps. early inputs stop influencing the model. long term dependencies get lost.

two solutions were built:

### LSTM — long short term memory

three gates control information flow:
- **input gate** — what new information to store
- **forget gate** — what old information to discard
- **output gate** — what to pass to the next step

memory cell persists important context across long sequences. good for long documents, extended user sessions, prolonged attack sequences.

### GRU — gated recurrent unit

simpler version of LSTM. two gates instead of three. faster to train. comparable performance in most tasks.

- **update gate** — how much previous state to keep
- **reset gate** — how much previous state to combine with current input

---

## why this matters in security

CNNs power malware image classification and screenshot analysis tools. RNNs and LSTMs power user behaviour analytics, log anomaly detection, and sequence based threat detection.

when your UBA tool flags a behavioural sequence — there's likely an LSTM underneath tracking that session over time.

---

next up — generative AI and LLMs. the AI everyone is talking about. let's open the hood.

which feels more relevant to your current SOC environment — image based analysis or sequence based detection?

*took ai help to clean up typos. my brain works faster than my fingers. xd*

---
*next up: [AI Series #10 — "the AI everyone is talking about — how does it actually work"](/posts/ai-series-10/)*
*[back to series index](/posts/ai-fundamentals/)*
