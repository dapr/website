---
title: "Build Production-Ready AI Agents with Dapr"
description: "Dapr Agents is an open source framework for building stateful, durable, observable AI agents. Run multi-agent workflows reliably in production."
intro: "Dapr Agents is an open source Python framework for building durable, observable AI agents and multi-agent systems on Dapr."
meta_keywords: "dapr agents, ai agents framework, agentic ai, multi-agent systems, durable ai agents, llm orchestration, model context protocol, mcp servers"
draft: false

ai:
  enable: true
  content: "Dapr Agents is an open source framework for building AI agents that are durable, observable, and production-ready from day one. Built on Dapr's proven runtime, agents get state persistence, workflow durability, secure tool invocation, and multi-agent coordination out of the box, without writing infrastructure code. Run any LLM, on any cloud, with the reliability teams already trust for microservices."
  feature_item:
    - name: "Durable by default"
      content: "Agents built on Dapr Workflow survive crashes, restarts, and infrastructure failures. Every step of an agent's reasoning is checkpointed to state storage, so long-running plans resume exactly where they left off, with no lost context or half-finished actions."
      link: "https://docs.dapr.io/developing-ai/dapr-agents/dapr-agents-core-concepts/"
    - name: "Model and tool agnostic"
      content: "Switch between OpenAI, Anthropic, Google, Azure OpenAI, open source models on Hugging Face, and local models without changing your agent code. Tools are invoked through the Dapr component model, so you can swap implementations in config instead of code."
      link: "https://docs.dapr.io/developing-ai/dapr-agents/dapr-agents-integrations/"
    - name: "Multi-agent orchestration"
      content: "Compose specialist agents into teams using Dapr's pub/sub, workflow, and actor APIs. Message passing, routing, and state sharing between agents are handled by the runtime. You define the roles and tasks, and Dapr handles coordination at scale."
      link: "https://docs.dapr.io/developing-ai/dapr-agents/dapr-agents-patterns/"
    - name: "Secure tool invocation and MCP support"
      content: "Tool calls routed through Dapr service invocation can get mTLS identity, configurable access control, and tracing. Native support for the Model Context Protocol (MCP) lets agents call external tools and data sources through those same controls."
      link: "https://docs.dapr.io/developing-ai/mcp/"
    - name: "Dapr MCP server (alpha)"
      content: "The Dapr MCP server, in alpha, is a standalone binary with its own release cycle. It runs next to a Dapr sidecar and exposes the sidecar's building blocks, such as state, pub/sub, bindings, secrets, service invocation, and actors, as Model Context Protocol tools that any MCP client can call. Authentication is off until you configure it, so turn it on whenever you serve over HTTP to anything other than localhost."
      link: "https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/"
      source: "https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/"
    - name: "Search and vector APIs (alpha)"
      content: "The alpha search and vector APIs store and query data through one portable API each, so agents and other applications can retrieve context without learning a different SDK for every engine. The search building block indexes and queries JSON documents in full-text search engines. The vector building block stores embeddings that your application generates and runs similarity queries over them, the storage and retrieval layer for patterns such as retrieval-augmented generation (RAG). Dapr 1.19 ships Meilisearch components for both, and you swap engines by changing the component."
      link: "https://docs.dapr.io/developing-applications/building-blocks/vector/vector-overview/"
      source:
        - "https://docs.dapr.io/developing-applications/building-blocks/search/search-overview/"
        - "https://docs.dapr.io/developing-applications/building-blocks/vector/vector-overview/"
    - name: "Observability from the first request"
      content: "Agents are instrumented with OpenTelemetry tracing, metrics, and logs automatically. Every prompt, tool call, and state transition is visible in the same dashboards your platform team already uses for microservices."
      link: "https://docs.dapr.io/operations/observability/tracing/tracing-overview/"
    - name: "Kubernetes-native, runs anywhere"
      content: "Deploy agents the same way you deploy Dapr apps: as sidecars in Kubernetes, standalone processes on VMs, or locally on a laptop. Agents carry the same portability guarantees as every other Dapr workload."
      link: "https://docs.dapr.io/operations/hosting/"
  cta:
    primary:
      label: "Get started"
      link: "https://docs.dapr.io/developing-ai/dapr-agents/"
    secondary:
      label: "View on GitHub"
      link: "https://github.com/dapr/dapr-agents"
---
