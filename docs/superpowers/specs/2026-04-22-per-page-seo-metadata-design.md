# Per-page SEO metadata design

**Date:** 2026-04-22
**Scope:** Per-page metadata (title, description, keywords) for all 10 landing pages of dapr.io, plus the site-wide defaults used by the home page.

## Goal

Today every page on dapr.io ships the same site-wide `<meta name="keywords">` value and many pages inherit weak or duplicated titles/descriptions. This change gives each page its own metadata tuned to the content and search intent of that page.

Scope is limited to what search engines actually reward: `<title>`, `<meta name="description">`, and `<meta name="keywords">` (kept for minor engines and internal search), with OpenGraph and Twitter meta inheriting from those via the existing template. Body copy, headings, structured data per page, and per-page OG images are out of scope.

## Mechanics

No template changes required. `themes/bigspring/layouts/partials/head.html:9` already reads `.Params.Keywords` with fallback to `site.Params.keywords`. OG and Twitter tags already fall back to each page's `title` / `description`.

The entire change is frontmatter in the `_index.md` files, plus `config.toml` for the home page's site-wide defaults.

## Style rules

- **Title:** ≤ 60 chars total; since `head.html:3` appends `" | Dapr"` (7 chars) to non-home pages, frontmatter `title` caps at ~53 chars. Lead with the strongest keyword.
- **Description:** 140–160 chars. Must stand alone as a SERP snippet. Include the primary keyword once, naturally.
- **Keywords:** 6–10 lowercased comma-separated phrases. Mix head terms and long-tail. No stuffing — avoid repeating the same word across five entries.
- **OG / Twitter:** inherited from title/description via the existing template. No new fields.

## Per-page metadata

Legend: fields marked → change; fields marked "keep" are unchanged.

### Home (`config.toml`)

- **title:** keep — `Dapr - Distributed Application Runtime`
- **description →:** `Dapr is a graduated CNCF project providing APIs for building secure, reliable microservices, durable workflows, and agentic AI on Kubernetes and beyond.`
- **keywords →:** `dapr, distributed application runtime, microservices, durable workflows, agentic ai, cncf, kubernetes, sidecar pattern, pub/sub, service invocation`

### `/ai/` (`content/ai/_index.md`)

- **title:** keep — `Build Production-Ready AI Agents with Dapr`
- **description:** keep — `Dapr Agents is an open source framework for building stateful, durable, observable AI agents. Run multi-agent workflows reliably in production.`
- **keywords →:** `dapr agents, ai agents framework, agentic ai, multi-agent systems, durable ai agents, llm orchestration, model context protocol, mcp servers`

### `/workflow/` (`content/workflow/_index.md`)

- **title:** keep — `Durable Workflows for Distributed Applications`
- **description →:** `Dapr Workflow: durable execution for long-running processes — retries, timers, human approvals, and sagas, without operating a workflow engine.`
- **keywords →:** `dapr workflow, durable workflows, durable execution, saga pattern, workflow engine, workflow orchestration, long-running processes, human-in-the-loop`

### `/learn/` (`content/learn/_index.md`)

- **title →:** `Learn Dapr: Docs, Quickstarts, and Dapr University`
- **description →:** `Learn Dapr through official docs, quickstarts in .NET, Java, Python, Go, and JavaScript, Dapr University courses, and the Dapr YouTube channel.`
- **keywords →:** `learn dapr, dapr tutorial, dapr university, dapr quickstarts, dapr documentation, dapr getting started, dapr for beginners, dapr courses`

### `/platform-engineering/` (`content/platform-engineering/_index.md`)

- **title:** keep — `Solving Platform Engineering Challenges with Dapr`
- **description →:** `How platform teams use Dapr to tame infrastructure complexity, observability, security, and Kubernetes-native GitOps with Argo CD and Flux.`
- **keywords →:** `platform engineering, internal developer platform, dapr kubernetes, gitops, argo cd, flux cd, dapr components, opentelemetry, mtls, kyverno`

### `/enterprise/` (`content/enterprise/_index.md`)

- **title:** keep — `Enterprise solutions in the Dapr ecosystem`
- **description →:** `Enterprise-grade Dapr: Diagrid support, Conductor, Catalyst Enterprise, Azure Container Apps, and Intent Architect. 24/7 support and managed Dapr.`
- **keywords →:** `dapr enterprise, dapr support, diagrid, dapr conductor, dapr catalyst, azure container apps, managed dapr, fips compliance, enterprise microservices`

### `/community/` (`content/community/_index.md`)

- **title →:** `Join the Dapr Community: Discord, Calls, Meteors`
- **description →:** `Join the Dapr community: Discord, bi-weekly community calls, the Dapr Meteors program, and the GitHub org. Connect with maintainers and Dapr users.`
- **keywords →:** `dapr community, dapr discord, dapr meteors, dapr contributor, dapr open source, cncf community, dapr maintainers, dapr github`

### `/community/program/` (`content/community/program/_index.md`)

- **title →:** `Dapr Meteors Program: Recognizing Community Experts`
- **description →:** `The Dapr Meteors program recognizes community experts who contribute to Dapr through blogs, videos, talks, and code. Learn how to become a Dapr Meteor.`
- **keywords →:** `dapr meteors, dapr community experts, dapr champions, dapr recognition program, dapr contributor program, open source recognition`

### `/events/dapr-day-2025/` (`content/events/dapr-day-2025/_index.md`)

The event ran 2025-11-05, so the page is now an archive. Metadata reframes it as "watch recorded sessions" rather than as an upcoming event.

- **title →:** `Dapr Day 2025: Watch Free Virtual Event Sessions`
- **description →:** `Dapr Day 2025 featured Dapr maintainers, adopters, and community experts on microservices and agentic AI. Watch the recorded sessions on YouTube.`
- **keywords →:** `dapr day 2025, dapr virtual event, dapr conference, cncf event, microservices conference, agentic ai event, dapr roadmap, dapr community call`

### `/testimonials/` (`content/testimonials/_index.md`)

- **title:** keep — `Companies building with Dapr`
- **description →:** `Real-world case studies of enterprises using Dapr: Alibaba, Grafana, HDFC Bank, Vonage, ZEISS, and more — how teams build reliable distributed apps.`
- **keywords →:** `dapr case studies, dapr adopters, dapr customer stories, dapr alibaba, dapr grafana, dapr zeiss, dapr in production, dapr enterprise use cases`

## Out of scope

- Template changes to `head.html` (no logic changes needed).
- Per-page OG images (only `dapr-og-default.png` exists; creating per-page images requires design work).
- JSON-LD structured data per page (e.g., `Event` schema on Dapr Day). Worth considering later but not part of this change.
- Body copy, headings, and internal linking.
- Blog posts (`blog.dapr.io`) and docs (`docs.dapr.io`) — both are separate sites.

## Rollout

Single PR changing 10 files (9 `_index.md` files + `config.toml`). No runtime risk — metadata changes are content-only and render-time. Verification is a local Hugo build plus a spot check of `view-source` on a couple of pages to confirm the `<meta>` tags resolve as expected.
