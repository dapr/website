# LinkedIn

Page: [Dapr](https://www.linkedin.com/company/daprdev/)

URL as linked from `config.toml` and `content/community/_index.md`.

## Cover image

`images/linkedin-cover.png` (1536x256, exactly 6:1).

**Size.** LinkedIn's own [Page image specifications](https://www.linkedin.com/help/linkedin/answer/a563309)
give 1512x256 as both the minimum and the recommended cover size, PNG or JPEG,
3 MB maximum. Measured on the live Dapr Page, though, the cover renders into a
box that is exactly 6:1 with `object-fit: cover`, so a 1512x256 image (5.906:1)
loses about two pixels off the top and bottom. 1536x256 is exactly 6:1 and
still clears the 1512 minimum, so nothing gets cropped. Either size works;
1536 is just the one that survives the crop untouched.

**Safe zone.** The page logo is painted over the cover's lower left. Measured
on the live Page, it covers the leftmost 22.8% of the cover and rises 61% of
its height, which is 350px at this width. The artwork starts at 380px to clear
it, which is why the left third is empty.

**Crop.** Because the crop is centered, content near the left and right edges
is the first thing lost on a narrower render, so the diagram keeps a real right
margin instead of bleeding off the edge.

## Tagline

Limit 120 characters. This one is 57.

```
The durable execution runtime for workflows and AI agents
```

## About

Limit 2000 characters. This one is 1226.

```
Dapr is the durable execution runtime for workflows and AI agents.

Dapr provides durable, verifiable execution so your workflows and AI agents survive crashes, restarts, and outages, resuming exactly where they left off. It is built on infrastructure-agnostic APIs with production-grade security, resiliency, and observability, so your teams can focus on their code instead of the plumbing underneath it.

What teams build with Dapr:

Durable workflows that run for seconds or for months, with retries, compensation, and a full execution history.
AI agents with durable memory and tool calls that pick up exactly where they stopped.
Service invocation, pub/sub messaging, state management, secrets, and jobs through one consistent set of APIs.

Dapr runs anywhere your code runs: on Kubernetes, on virtual machines, on your laptop, across clouds, and on the edge. It works with the languages your teams already use, including .NET, Java, Python, Go, JavaScript, and Rust.

Dapr is a graduated project of the Cloud Native Computing Foundation, used in production by many large scale organizations .

Get started at https://docs.dapr.io/getting-started/
```
