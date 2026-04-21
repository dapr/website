---
title: "Durable Workflows for Distributed Applications"
description: "Dapr Workflow gives you durable execution for long-running processes: retries, timers, human approvals, and sagas — without a workflow engine to operate."
draft: false

workflow:
  enable: true
  content: "Dapr Workflow brings durable execution to distributed applications. Long-running processes — multi-step orchestrations, sagas, approval flows, data pipelines, and agent plans — survive crashes, restarts, and network failures because every step is checkpointed to state storage. Write workflows as ordinary code in Go, Python, .NET, Java, or JavaScript, and let Dapr handle the hard parts: retries, timers, fan-out/fan-in, and compensation."
  feature_item:
    - name: "Write workflows as code"
      content: "Define workflows as regular functions in your language of choice. Dapr turns them into durable executions automatically — no DSL, no state machine editor, no separate workflow engine to learn. Your existing testing tools and IDE work unchanged."
    - name: "Automatic retries and compensation"
      content: "Declare retry policies, timeouts, and compensation steps in code. Dapr handles transient failures, exponential backoff, and saga rollback. When a workflow can't recover, you get a clear failure path, not a hung job."
    - name: "Human-in-the-loop and external events"
      content: "Pause workflows waiting for approvals, webhook callbacks, or events from other services. Dapr parks the execution in state storage and resumes instantly when the signal arrives — even weeks later, even after the host restarts."
    - name: "Scale without operating a workflow engine"
      content: "There's no separate workflow server to deploy, patch, or scale. Dapr Workflow runs inside the same sidecar as the rest of your Dapr APIs, using your existing state store (Redis, Postgres, Cosmos DB, and more) as the durable backend."
    - name: "Composable with every Dapr API"
      content: "Call service invocation, pub/sub, state, bindings, actors, and AI agents directly from workflow activities. The entire Dapr building-block surface is compatible with Dapr workflow, with the same security and observability guarantees."
    - name: "Production-grade observability"
      content: "Every workflow instance, activity, and retry is traced with OpenTelemetry. Inspect running workflows, replay history, and debug failures using standard tracing backends — Jaeger, Zipkin, Grafana Tempo, Application Insights, and more."
  cta:
    primary:
      label: "Get started"
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/"
    secondary:
      label: "Quickstart"
      link: "https://docs.dapr.io/getting-started/quickstarts/workflow-quickstart/"
---
