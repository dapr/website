# Per-page SEO metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `<title>`, `<meta name="description">`, and `<meta name="keywords">` for every landing page of dapr.io and for the site-wide defaults used by the home page.

**Architecture:** Frontmatter-only changes to nine `_index.md` files plus `config.toml` for the home page defaults. No template logic changes required — `themes/bigspring/layouts/partials/head.html:9` already reads `.Params.Keywords` with site-wide fallback, and OG/Twitter tags already inherit from the per-page title/description.

**Tech Stack:** Hugo static site generator, YAML frontmatter in markdown, TOML site config.

**Spec reference:** `docs/superpowers/specs/2026-04-22-per-page-seo-metadata-design.md`

---

## Notes for the implementer

- This is a content-only change. There is no code to unit-test. "Verification" means: (1) Hugo builds without errors, and (2) the rendered HTML contains the expected `<title>` / `<meta>` tags.
- Hugo's build command is `hugo` from the repo root. It writes generated HTML to `./public/`.
- Edits target YAML frontmatter. Preserve existing quote style (the files use double-quoted strings). Keep trailing newlines and surrounding fields untouched.
- When using the `Edit` tool, copy the `old_string` exactly — YAML is whitespace-sensitive and the files use 2-space indentation inside mapping blocks but flat top-level fields.
- Each task edits one or more files and ends with a single commit. Do **not** bundle multiple tasks into a single commit.

---

### Task 1: Capture the baseline

**Files:**
- No edits. Build the site and snapshot the current metadata so later tasks have something to diff against.

- [ ] **Step 1: Build the site**

Run:
```bash
hugo --cleanDestinationDir
```

Expected: Hugo prints a summary table (pages, static files, etc.) with no errors. `public/` is regenerated.

- [ ] **Step 2: Capture current `<meta>` tags for each target page**

Run:
```bash
for p in index ai/index workflow/index learn/index platform-engineering/index enterprise/index community/index community/program/index events/dapr-day-2025/index testimonials/index; do
  echo "=== $p ==="
  grep -E '<title>|<meta name="description"|<meta name="keywords"' "public/$p.html" | head -3
done
```

Expected: every page prints 3 lines (title, description, keywords). The keywords line is identical across every page (the site-wide fallback). Confirm this — if any page already has a custom keywords value, stop and reconcile with the spec before continuing.

- [ ] **Step 3: No commit**

Baseline capture is read-only.

---

### Task 2: Update site-wide defaults (home page)

**Files:**
- Modify: `config.toml` (lines 180–184)

- [ ] **Step 1: Read the current values**

Run:
```bash
sed -n '180,185p' config.toml
```

Expected output:
```
# Meta data
description = "APIs for building secure and reliable microservices, durable workflows, and agentic AI"
twitter_handle = "@daprdev"
og_image_default = "images/dapr-og-default.png"
keywords = "dapr, microservices, distributed applications, runtime, kubernetes, agentic ai"
author = "Dapr Maintainers"
```

- [ ] **Step 2: Replace the `description` line**

Use the `Edit` tool on `config.toml`.

`old_string`:
```
description = "APIs for building secure and reliable microservices, durable workflows, and agentic AI"
```

`new_string`:
```
description = "Dapr is a graduated CNCF project providing APIs for building secure, reliable microservices, durable workflows, and agentic AI on Kubernetes and beyond."
```

- [ ] **Step 3: Replace the `keywords` line**

Use the `Edit` tool on `config.toml`.

`old_string`:
```
keywords = "dapr, microservices, distributed applications, runtime, kubernetes, agentic ai"
```

`new_string`:
```
keywords = "dapr, distributed application runtime, microservices, durable workflows, agentic ai, cncf, kubernetes, sidecar pattern, pub/sub, service invocation"
```

- [ ] **Step 4: Rebuild and verify the home page**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<meta name="description"|<meta name="keywords"' public/index.html
```

Expected:
```
<meta name="description" content="Dapr is a graduated CNCF project providing APIs for building secure, reliable microservices, durable workflows, and agentic AI on Kubernetes and beyond.">
<meta name="keywords" content="dapr, distributed application runtime, microservices, durable workflows, agentic ai, cncf, kubernetes, sidecar pattern, pub/sub, service invocation">
```

- [ ] **Step 5: Commit**

```bash
git add config.toml
git commit -m "seo: update site-wide description and keywords in config.toml"
```

---

### Task 3: Update `/ai/` frontmatter

**Files:**
- Modify: `content/ai/_index.md` (frontmatter, lines 1–6)

Title and description are already strong; only add `keywords`.

- [ ] **Step 1: Add the `keywords` field**

Use the `Edit` tool on `content/ai/_index.md`.

`old_string`:
```
description: "Dapr Agents is an open source framework for building stateful, durable, observable AI agents. Run multi-agent workflows reliably in production."
draft: false
```

`new_string`:
```
description: "Dapr Agents is an open source framework for building stateful, durable, observable AI agents. Run multi-agent workflows reliably in production."
keywords: "dapr agents, ai agents framework, agentic ai, multi-agent systems, durable ai agents, llm orchestration, model context protocol, mcp servers"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/ai/index.html | head -3
```

Expected (title includes the `" | Dapr"` suffix from the template):
```
<title>Build Production-Ready AI Agents with Dapr | Dapr</title>
<meta name="description" content="Dapr Agents is an open source framework for building stateful, durable, observable AI agents. Run multi-agent workflows reliably in production.">
<meta name="keywords" content="dapr agents, ai agents framework, agentic ai, multi-agent systems, durable ai agents, llm orchestration, model context protocol, mcp servers">
```

- [ ] **Step 3: Commit**

```bash
git add content/ai/_index.md
git commit -m "seo: add keywords to /ai/ landing page"
```

---

### Task 4: Update `/workflow/` frontmatter

**Files:**
- Modify: `content/workflow/_index.md` (frontmatter, lines 1–6)

Title stays. Description is trimmed under 160 chars. Keywords added.

- [ ] **Step 1: Replace description and add keywords**

Use the `Edit` tool on `content/workflow/_index.md`.

`old_string`:
```
description: "Dapr Workflow gives you durable execution for long-running processes: retries, timers, human approvals, and sagas — without a workflow engine to operate."
draft: false
```

`new_string`:
```
description: "Dapr Workflow: durable execution for long-running processes — retries, timers, human approvals, and sagas, without operating a workflow engine."
keywords: "dapr workflow, durable workflows, durable execution, saga pattern, workflow engine, workflow orchestration, long-running processes, human-in-the-loop"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/workflow/index.html | head -3
```

Expected:
```
<title>Durable Workflows for Distributed Applications | Dapr</title>
<meta name="description" content="Dapr Workflow: durable execution for long-running processes — retries, timers, human approvals, and sagas, without operating a workflow engine.">
<meta name="keywords" content="dapr workflow, durable workflows, durable execution, saga pattern, workflow engine, workflow orchestration, long-running processes, human-in-the-loop">
```

- [ ] **Step 3: Commit**

```bash
git add content/workflow/_index.md
git commit -m "seo: trim description and add keywords on /workflow/"
```

---

### Task 5: Update `/learn/` frontmatter

**Files:**
- Modify: `content/learn/_index.md` (frontmatter, lines 1–5)

Title expanded, description expanded, keywords added.

- [ ] **Step 1: Replace title, description, and add keywords**

Use the `Edit` tool on `content/learn/_index.md`.

`old_string`:
```
title: "Learn Dapr"
description: "Learn to build and run distributed applications with Dapr."
draft: false
```

`new_string`:
```
title: "Learn Dapr: Docs, Quickstarts, and Dapr University"
description: "Learn Dapr through official docs, quickstarts in .NET, Java, Python, Go, and JavaScript, Dapr University courses, and the Dapr YouTube channel."
keywords: "learn dapr, dapr tutorial, dapr university, dapr quickstarts, dapr documentation, dapr getting started, dapr for beginners, dapr courses"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/learn/index.html | head -3
```

Expected:
```
<title>Learn Dapr: Docs, Quickstarts, and Dapr University | Dapr</title>
<meta name="description" content="Learn Dapr through official docs, quickstarts in .NET, Java, Python, Go, and JavaScript, Dapr University courses, and the Dapr YouTube channel.">
<meta name="keywords" content="learn dapr, dapr tutorial, dapr university, dapr quickstarts, dapr documentation, dapr getting started, dapr for beginners, dapr courses">
```

- [ ] **Step 3: Commit**

```bash
git add content/learn/_index.md
git commit -m "seo: expand title/description and add keywords on /learn/"
```

---

### Task 6: Update `/platform-engineering/` frontmatter

**Files:**
- Modify: `content/platform-engineering/_index.md` (frontmatter, lines 1–6)

Title stays. Description trimmed. Keywords added.

- [ ] **Step 1: Replace description and add keywords**

Use the `Edit` tool on `content/platform-engineering/_index.md`.

`old_string`:
```
description: "How platform teams use Dapr to tame infrastructure complexity, observability, security, resiliency, and Kubernetes-native integration with GitOps tools like Argo CD and Flux."
draft: false
```

`new_string`:
```
description: "How platform teams use Dapr to tame infrastructure complexity, observability, security, and Kubernetes-native GitOps with Argo CD and Flux."
keywords: "platform engineering, internal developer platform, dapr kubernetes, gitops, argo cd, flux cd, dapr components, opentelemetry, mtls, kyverno"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/platform-engineering/index.html | head -3
```

Expected:
```
<title>Solving Platform Engineering Challenges with Dapr | Dapr</title>
<meta name="description" content="How platform teams use Dapr to tame infrastructure complexity, observability, security, and Kubernetes-native GitOps with Argo CD and Flux.">
<meta name="keywords" content="platform engineering, internal developer platform, dapr kubernetes, gitops, argo cd, flux cd, dapr components, opentelemetry, mtls, kyverno">
```

- [ ] **Step 3: Commit**

```bash
git add content/platform-engineering/_index.md
git commit -m "seo: trim description and add keywords on /platform-engineering/"
```

---

### Task 7: Update `/enterprise/` frontmatter

**Files:**
- Modify: `content/enterprise/_index.md` (frontmatter, lines 1–7)

Title stays. Description trimmed. Keywords added.

- [ ] **Step 1: Replace description and add keywords**

Use the `Edit` tool on `content/enterprise/_index.md`.

`old_string`:
```
# meta description
description: "Enterprise-grade Dapr offerings: Diagrid Dapr Support, Conductor, Catalyst, plus Azure Container Apps and Intent Architect. 24/7 support, FIPS compliance, and managed Dapr at scale."
draft: false
```

`new_string`:
```
# meta description
description: "Enterprise-grade Dapr: Diagrid support, Conductor, Catalyst Enterprise, Azure Container Apps, and Intent Architect. 24/7 support and managed Dapr."
keywords: "dapr enterprise, dapr support, diagrid, dapr conductor, dapr catalyst, azure container apps, managed dapr, fips compliance, enterprise microservices"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/enterprise/index.html | head -3
```

Expected:
```
<title>Enterprise solutions in the Dapr ecosystem | Dapr</title>
<meta name="description" content="Enterprise-grade Dapr: Diagrid support, Conductor, Catalyst Enterprise, Azure Container Apps, and Intent Architect. 24/7 support and managed Dapr.">
<meta name="keywords" content="dapr enterprise, dapr support, diagrid, dapr conductor, dapr catalyst, azure container apps, managed dapr, fips compliance, enterprise microservices">
```

- [ ] **Step 3: Commit**

```bash
git add content/enterprise/_index.md
git commit -m "seo: trim description and add keywords on /enterprise/"
```

---

### Task 8: Update `/community/` frontmatter

**Files:**
- Modify: `content/community/_index.md` (frontmatter, lines 1–5)

Title expanded. Description trimmed. Keywords added.

- [ ] **Step 1: Replace title, description, add keywords**

Use the `Edit` tool on `content/community/_index.md`.

`old_string`:
```
title: "Join the Dapr community!"
description: "Join the Dapr community: Discord, community calls, the Dapr Meteors program, and the GitHub org. Connect with maintainers and other Dapr users building distributed applications."
draft: false
```

`new_string`:
```
title: "Join the Dapr Community: Discord, Calls, Meteors"
description: "Join the Dapr community: Discord, bi-weekly community calls, the Dapr Meteors program, and the GitHub org. Connect with maintainers and Dapr users."
keywords: "dapr community, dapr discord, dapr meteors, dapr contributor, dapr open source, cncf community, dapr maintainers, dapr github"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/community/index.html | head -3
```

Expected:
```
<title>Join the Dapr Community: Discord, Calls, Meteors | Dapr</title>
<meta name="description" content="Join the Dapr community: Discord, bi-weekly community calls, the Dapr Meteors program, and the GitHub org. Connect with maintainers and Dapr users.">
<meta name="keywords" content="dapr community, dapr discord, dapr meteors, dapr contributor, dapr open source, cncf community, dapr maintainers, dapr github">
```

- [ ] **Step 3: Commit**

```bash
git add content/community/_index.md
git commit -m "seo: rewrite title/description and add keywords on /community/"
```

---

### Task 9: Update `/community/program/` frontmatter

**Files:**
- Modify: `content/community/program/_index.md` (frontmatter, lines 1–5)

Title expanded. Description replaced (was a duplicate of the title). Keywords added.

- [ ] **Step 1: Replace title, description, add keywords**

Use the `Edit` tool on `content/community/program/_index.md`.

`old_string`:
```
title: "Dapr Meteors Program"
description: "Dapr Meteors Program"
draft: false
```

`new_string`:
```
title: "Dapr Meteors Program: Recognizing Community Experts"
description: "The Dapr Meteors program recognizes community experts who contribute to Dapr through blogs, videos, talks, and code. Learn how to become a Dapr Meteor."
keywords: "dapr meteors, dapr community experts, dapr champions, dapr recognition program, dapr contributor program, open source recognition"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/community/program/index.html | head -3
```

Expected:
```
<title>Dapr Meteors Program: Recognizing Community Experts | Dapr</title>
<meta name="description" content="The Dapr Meteors program recognizes community experts who contribute to Dapr through blogs, videos, talks, and code. Learn how to become a Dapr Meteor.">
<meta name="keywords" content="dapr meteors, dapr community experts, dapr champions, dapr recognition program, dapr contributor program, open source recognition">
```

- [ ] **Step 3: Commit**

```bash
git add content/community/program/_index.md
git commit -m "seo: rewrite title/description and add keywords on /community/program/"
```

---

### Task 10: Update `/events/dapr-day-2025/` frontmatter

**Files:**
- Modify: `content/events/dapr-day-2025/_index.md` (frontmatter, lines 1–7)

Title and description replaced (event has passed; reframe as archive). Keywords added.

- [ ] **Step 1: Replace title, description, add keywords**

Use the `Edit` tool on `content/events/dapr-day-2025/_index.md`.

`old_string`:
```
title: "Dapr Day 2025"
description: "Dapr Day 2025"
draft: false
```

`new_string`:
```
title: "Dapr Day 2025: Watch Free Virtual Event Sessions"
description: "Dapr Day 2025 featured Dapr maintainers, adopters, and community experts on microservices and agentic AI. Watch the recorded sessions on YouTube."
keywords: "dapr day 2025, dapr virtual event, dapr conference, cncf event, microservices conference, agentic ai event, dapr roadmap, dapr community call"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/events/dapr-day-2025/index.html | head -3
```

Expected:
```
<title>Dapr Day 2025: Watch Free Virtual Event Sessions | Dapr</title>
<meta name="description" content="Dapr Day 2025 featured Dapr maintainers, adopters, and community experts on microservices and agentic AI. Watch the recorded sessions on YouTube.">
<meta name="keywords" content="dapr day 2025, dapr virtual event, dapr conference, cncf event, microservices conference, agentic ai event, dapr roadmap, dapr community call">
```

- [ ] **Step 3: Commit**

```bash
git add content/events/dapr-day-2025/_index.md
git commit -m "seo: reframe Dapr Day 2025 page as archive with proper metadata"
```

---

### Task 11: Update `/testimonials/` frontmatter

**Files:**
- Modify: `content/testimonials/_index.md` (frontmatter, lines 1–7)

Title stays. Description trimmed. Keywords added.

- [ ] **Step 1: Replace description and add keywords**

Use the `Edit` tool on `content/testimonials/_index.md`.

`old_string`:
```
# meta description
description: "Real-world case studies of enterprises using Dapr: Alibaba, Grafana, HDFC Bank, Vonage, and more. See how teams build reliable distributed applications with Dapr."
draft: false
```

`new_string`:
```
# meta description
description: "Real-world case studies of enterprises using Dapr: Alibaba, Grafana, HDFC Bank, Vonage, ZEISS, and more — how teams build reliable distributed apps."
keywords: "dapr case studies, dapr adopters, dapr customer stories, dapr alibaba, dapr grafana, dapr zeiss, dapr in production, dapr enterprise use cases"
draft: false
```

- [ ] **Step 2: Rebuild and verify**

Run:
```bash
hugo --cleanDestinationDir && grep -E '<title>|<meta name="description"|<meta name="keywords"' public/testimonials/index.html | head -3
```

Expected:
```
<title>Companies building with Dapr | Dapr</title>
<meta name="description" content="Real-world case studies of enterprises using Dapr: Alibaba, Grafana, HDFC Bank, Vonage, ZEISS, and more — how teams build reliable distributed apps.">
<meta name="keywords" content="dapr case studies, dapr adopters, dapr customer stories, dapr alibaba, dapr grafana, dapr zeiss, dapr in production, dapr enterprise use cases">
```

- [ ] **Step 3: Commit**

```bash
git add content/testimonials/_index.md
git commit -m "seo: trim description and add keywords on /testimonials/"
```

---

### Task 12: Final end-to-end verification

**Files:** None modified. Read-only validation.

- [ ] **Step 1: Clean build**

Run:
```bash
hugo --cleanDestinationDir
```

Expected: no warnings or errors. Page count matches previous builds.

- [ ] **Step 2: Verify all 10 pages render unique keywords**

Run:
```bash
for p in index ai/index workflow/index learn/index platform-engineering/index enterprise/index community/index community/program/index events/dapr-day-2025/index testimonials/index; do
  echo "=== $p ==="
  grep -E '<title>|<meta name="description"|<meta name="keywords"' "public/$p.html" | head -3
done
```

Expected: every page shows a distinct `<meta name="keywords">` value that matches the corresponding task's "Expected" block above. No page falls back to the old site-wide `dapr, microservices, distributed applications, runtime, kubernetes, agentic ai` string — except the home page, which now has the new expanded defaults.

- [ ] **Step 3: Sanity-check title and description lengths**

Run:
```bash
for p in index ai/index workflow/index learn/index platform-engineering/index enterprise/index community/index community/program/index events/dapr-day-2025/index testimonials/index; do
  title=$(grep -oE '<title>[^<]+</title>' "public/$p.html" | sed 's/<[^>]*>//g')
  desc=$(grep -oE '<meta name="description" content="[^"]+"' "public/$p.html" | sed 's/.*content="//;s/"$//')
  printf "%-40s title=%d desc=%d\n" "$p" "${#title}" "${#desc}"
done
```

Expected: every `title` length ≤ 60, every `desc` length between 80 and 165. Flag any outliers.

- [ ] **Step 4: No commit**

Verification is read-only. If anything in steps 2–3 is unexpected, stop and fix the responsible task rather than patching over it here.
