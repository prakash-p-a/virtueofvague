+++
date = 2026-05-26T13:40:43+05:30
draft = false
slug = "copy-fail-cve"
tags = ["MindSecSet"]
title = "Copy Fail (CVE-2026-31431): A Four‑Byte Linux Kernel LPE Hidden for Nine Years"
showHero = true
mood = "curious"
pullquote = "the bug nobody filed, and the clipboard nobody trusted."
description = "CVE-2026-31431, the four-byte Linux kernel local privilege escalation hidden for nine years. What the bug is, how it works, and what it teaches about review blind spots."
+++


## Executive Summary

**CVE-2026-31431** – a high‑severity local privilege escalation (LPE) in the Linux kernel – was disclosed on April 29, 2026. Nicknamed **“Copy Fail”**, it allows any unprivileged local user to gain root access on almost every Linux distribution since 2017.

A 732‑byte Python PoC exists. The exploit is reliable, requires no race conditions or offset guessing, and works on Ubuntu, Amazon Linux, RHEL, SUSE, and others.

The upstream fix (commit `a664bf3d603d`) landed on April 1, 2026, but no major distribution had shipped a fixed kernel as of the disclosure.

Notably, the flaw was found by **Theori’s AI‑based SAST tool, Xint Code**, in about one hour of automated scanning.

---

## Technical Details

The bug resides in the kernel’s `algif_aead` module – the AEAD socket interface of the userspace crypto API (`AF_ALG`).

Introduced in 2017 via commit `72548b093ee3`, an in‑place operation optimization for AEAD encryption created a 4‑byte page‑cache write primitive. Under specific conditions, four bytes are written into the file page cache of a target binary (e.g., `/usr/bin/su`), corrupting its in‑memory image without touching the disk.

**Attack chain:**
1. Open a `setuid` binary (e.g., `/usr/bin/su`).
2. Create an `AF_ALG` AEAD socket with parameters that trigger the logic flaw.
3. Use `splice()` to transfer data from the binary into the socket → 4 bytes of attacker‑controlled data are written into the binary’s page cache.
4. Execute the binary → the corrupted in‑memory version runs, returning a root shell.

No race conditions, no kernel‑specific offsets – fully deterministic.

{{< copy-fail >}}

---

## Affected Systems

Every mainstream Linux distribution with a kernel built between 2017 and the upstream fix:

| Distribution | Kernel Version |
|------------|----------------|
| Ubuntu 24.04 LTS | 6.17.0‑1007‑aws |
| Amazon Linux 2023 | 6.18.8‑9.213.amzn2023 |
| RHEL 10.1 | 6.12.0‑124.45.1.el10_1 |
| SUSE 16 | 6.12.0‑160000.9‑default |

Also Debian, Arch, Fedora, Rocky, Alma, Oracle, and embedded Linux.

**As of April 30, 2026, no major distribution had shipped a fixed kernel.** Patched kernels: upstream 6.18.22 / 6.19.12+.

---

## Impact & Risk

- **CVSS 7.8 (High)** – Local, low complexity, no privileges.
- **Container breakout:** Default Docker/LXC/Kubernetes grant `AF_ALG` access → compromise a container → host takeover.
- **Active exploitation confirmed** by CISA on May 6, 2026; 163+ unique samples identified.

---

## Mitigation

**Patch priority:**
- Multi‑tenant K8s, shared CI/CD runners – **highest** (patch within 24h or apply workaround)
- Shared hosting / multi‑user servers – high
- Dedicated hosts – standard

**Temporary workaround (disable the module):**
```bash
echo "install algif_aead /bin/false" > /etc/modprobe.d/disable-algif.conf
rmmod algif_aead 2>/dev/null || true
```

Does not affect dm‑crypt, kTLS, IPsec, OpenSSL, GnuTLS, NSS, or SSH.
If compiled into the kernel (not a module), add to boot params:

```
initcall_blacklist=algif_aead_init
```

**Container hardening**: Block AF_ALG socket creation via seccomp.

**Verification tools**: copyfail-guard (Python), copy-fail-checker (Bash), Copy‑Fail reachability checker.

**Discovery via AI** (Key Takeaway)
Theori’s AI‑based SAST tool, Xint Code, found the vulnerability after ~1 hour of scanning the kernel’s crypto subsystem – with a single operator prompt.

Historically, such a reliable universal LPE would cost hundreds of thousands of dollars on the gray market. AI found it in one hour. The era of AI‑assisted vulnerability discovery is operational.

| Source | Link |
|------------|----------------|
| CVE‑2026‑31431 | cve.mitre.org |
| Official disclosure | copy.fail |
| CERT‑EU Advisory 2026‑005 | cert.europa.eu |
| CERT/CC VU#260001 | kb.cert.org |
| Securelist analysis | securelist.com |
| Bugcrowd analysis | bugcrowd.com |
	

Analysis based on public disclosure materials, vendor advisories, and technical write‑ups from CERT‑EU, CERT/CC, Securelist, and Theori.

