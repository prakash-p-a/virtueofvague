+++
date = 2026-04-26T13:40:43+05:30
draft = false
slug = "Axios-Threat"
tags = ["MindSecSet"]
title = "How a Fake Teams Meeting Took Down One of npm's Most Trusted Packages"
showHero = false
+++


---

On March 30, 2026, one of the most downloaded JavaScript packages on the internet was weaponized against the developers who trusted it most. The Axios npm supply chain attack wasn't a sophisticated zero-day or a brute-force credential attack. It started with a fake Slack workspace and a Microsoft Teams call.

Here's what happened, why it matters, and what defenders should take away.

---

## What Is Axios?

If you've ever built a web application in JavaScript, there's a very good chance Axios touched your code. It's a promise-based HTTP client used to make API requests in both browsers and Node.js — downloaded over **300 million times weekly** on npm. It's the kind of package that's so ubiquitous, most developers don't even think about it. That trust is exactly what the attacker exploited.

---

## How the Attack Happened

### Step 1: Social Engineering the Maintainer

The attacker didn't brute-force anything. They built a fake Slack workspace, cloned the branding and profiles of real engineers, and arranged a live Microsoft Teams meeting with `jasonsaayman` — the lead maintainer of Axios.

During that call, the maintainer was prompted to install what looked like a routine software update. It wasn't. That install gave the attacker access to his machine and, more critically, his npm credentials.

This is worth sitting with. The entry point to one of npm's most critical packages was a video call and a fake software update. No CVE. No exploit chain. Just social engineering.

### Step 2: Pre-Staging the Payload

Before touching the Axios package itself, the attacker seeded a phantom dependency — `plain-crypto-js@4.2.1` — onto the npm registry approximately 18 hours in advance. This was deliberate: automated scanners flag brand-new packages as suspicious. By pre-staging it, the malicious package was already "existing" infrastructure when the poisoned Axios versions went live.

### Step 3: Bypassing OIDC — A Critical Misconfiguration

Axios had OIDC Trusted Publishing configured on its 1.x branch, which is supposed to cryptographically bind npm publishes to verified GitHub Actions workflows. But here's the catch:

The publish workflow also passed `NPM_TOKEN` as an environment variable alongside OIDC credentials. **When npm sees both, it uses the token.** The attacker published the malicious versions manually via npm CLI using the stolen long-lived token — no GitHub commit, no tag, no release trail.

OIDC was configured. It didn't matter. This is a significant lesson for any team that thinks Trusted Publishing alone is sufficient protection.

### Step 4: Publishing the Backdoored Versions

Within **39 minutes**, both `axios@1.14.1` (1.x branch) and `axios@0.30.4` (legacy 0.x branch) were live on npm. When developers or CI/CD pipelines installed "the latest" Axios, the postinstall hook in `plain-crypto-js` fired and deployed the RAT.

The attack propagated transitively — any package that depended on axios, including WordPress modules and Datadog packages, also pulled in the malicious dependency.

---

## The Malware: WAVESHAPER.V2

The RAT deployed was a fully functional, cross-platform backdoor targeting Windows, macOS, and Linux. It:

- Beaconed to its C2 (`sfrclak[.]com` / `142.11.206[.]73`) every 60 seconds
- Performed immediate system reconnaissance: hostname, username, OS version, running processes
- Established persistence on Windows via a hidden batch file and registry run key
- **Then erased itself**, replacing its files with clean decoys to frustrate forensics

That last part is what makes post-incident investigation so painful. If you don't have pre-compromise telemetry — network logs, endpoint logs — from the exposure window, you may never know the full scope.

---

## Who Was Behind It?

Google's Threat Intelligence Group (GTIG) and others attributed this to **UNC1069**, a North Korea-nexus threat actor. This wasn't an isolated campaign either. Around the same time, a related group (TeamPCP/UNC6780) compromised GitHub Actions and PyPI packages including Trivy, Checkmarx, and LiteLLM — stealing credentials that cascaded into further attacks.

Supply chain compromise is a DPRK playbook staple. They go after the trust layer of software development because the payoff is enormous: one poisoned package, millions of installs, a single C2 server collecting data from organizations across government, finance, and tech.

---

## What SOC Analysts Should Take Away

**1. Social engineering is the preferred initial access vector for nation-state actors targeting developers.** Phishing emails are detectable. A convincing Slack workspace with a Teams meeting is much harder to flag.

**2. OIDC Trusted Publishing is not a silver bullet.** If long-lived tokens exist and are passed as environment variables in your CI/CD workflows, they can be used to bypass the control entirely. Audit your token hygiene now.

**3. Transitive dependencies are your blind spot.** Most teams checked if they directly used axios. Far fewer checked if their dependencies' dependencies did. This is where supply chain attacks win.

**4. The detection was done by a researcher with an AI-powered diff-monitoring tool built in an afternoon.** The enterprise EDR solutions were slower. Creative lightweight tooling and behavioral visibility (network logs showing Node.js making outbound connections on port 8000 with a suspicious legacy User-Agent) is what caught this.

**5. If `plain-crypto-js` is in your dependency tree — assume compromise. Rotate everything.**

---

## Key IOCs (Defanged)

| Type | Value |
|------|-------|
| Malicious packages | `axios@1.14.1`, `axios@0.30.4` |
| Phantom dependency | `plain-crypto-js@4.2.0 / 4.2.1` |
| C2 Domain | `sfrclak[.]com` |
| C2 IP | `142.11.206[.]73` |
| C2 Port | `8000` |

Safe versions: `axios@1.14.0` or `axios@0.30.3`

---

## Full Technical Report

For the complete breakdown — full timeline, MITRE ATT&CK mapping, detection queries, IOC list, and remediation checklist — see the GitHub report:

🔗 [github.com/yourusername/threat-intel-reports/2026/axios-supply-chain](https://github.com/yourusername/threat-intel-reports/2026/axios-supply-chain)

---

*This post is part of the mindsecset series — where I document real-world threats through a SOC analyst lens.*  
*Follow along at [virtueofvague.com](https://virtueofvague.com)*