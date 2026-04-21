---
title: "Build Production-Ready AI Agents with Dapr"
description: "Dapr Agents is an open source framework for building stateful, durable, observable AI agents. Run multi-agent workflows reliably in production."
draft: false

ai:
  enable: true
  content: "Dapr Agents is an open source framework for building AI agents that are durable, observable, and production-ready from day one. Built on Dapr's proven runtime, agents get state persistence, workflow durability, secure tool invocation, and multi-agent coordination out of the box — without writing infrastructure code. Run any LLM, on any cloud, with the reliability teams already trust for microservices."
  feature_item:
    - name: "Durable by default"
      content: "Agents built on Dapr Workflow survive crashes, restarts, and infrastructure failures. Every step of an agent's reasoning is checkpointed to state storage, so long-running plans resume exactly where they left off — no lost context, no half-finished actions."
    - name: "Model and tool agnostic"
      content: "Switch between OpenAI, Anthropic, Google, Azure OpenAI, open source models on Hugging Face, and local models without changing your agent code. Tools are invoked through the Dapr component model, so you can swap implementations in config instead of code."
    - name: "Multi-agent orchestration"
      content: "Compose specialist agents into teams using Dapr's pub/sub, workflow, and actor APIs. Message passing, routing, and state sharing between agents are handled by the runtime — you define the roles and tasks, Dapr handles coordination at scale."
    - name: "Secure tool invocation and MCP support"
      content: "Every tool call passes through Dapr's policy engine: mTLS between components, access control on secrets and resources, and audit trails on every action. Native support for the Model Context Protocol (MCP) lets agents call external tools and data sources safely."
    - name: "Observability from the first request"
      content: "Agents are instrumented with OpenTelemetry tracing, metrics, and logs automatically. Every prompt, tool call, and state transition is visible in the same dashboards your platform team already uses for microservices."
    - name: "Kubernetes-native, runs anywhere"
      content: "Deploy agents the same way you deploy Dapr apps — as sidecars in Kubernetes, standalone processes on VMs, or locally on a laptop. Agents carry the same portability guarantees as every other Dapr workload."
  cta:
    primary:
      label: "Get started"
      link: "https://docs.dapr.io/developing-ai/dapr-agents/"
    secondary:
      label: "View on GitHub"
      link: "https://github.com/dapr/dapr-agents"
---
