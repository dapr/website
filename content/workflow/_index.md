---
title: "Durable Workflows for Distributed Applications"
description: "Dapr Workflow: durable, verifiable execution for long-running processes with retries, timers, human approvals, and sagas, without operating a workflow engine."
meta_keywords: "dapr workflow, durable workflows, durable execution, verifiable execution, workflow history signing, saga pattern, workflow engine, workflow orchestration, long-running processes, human-in-the-loop"
draft: false

workflow:
  enable: true
  content: "Dapr Workflow brings durable, verifiable execution to distributed applications. Long-running processes such as multi-step orchestrations, sagas, approval flows, data pipelines, and agent plans survive crashes, restarts, and network failures because every step is checkpointed to state storage. Write workflows as ordinary code in Go, Python, .NET, Java, or JavaScript, and let Dapr handle the hard parts: retries, timers, fan-out/fan-in, and compensation."
  feature_item:
    - name: "Write workflows as code"
      content: "Define workflows as regular functions in your language of choice. Dapr turns them into durable executions automatically, with no DSL, state machine editor, or separate workflow engine to learn. Your existing testing tools and IDE work unchanged."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/howto-author-workflow/"
    - name: "Automatic retries and compensation"
      content: "Declare retry policies, timeouts, and compensation steps in code. Dapr handles transient failures, exponential backoff, and saga rollback. When a workflow can't recover, you get a clear failure path instead of a hung job."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-features-concepts/#retry-policies"
    - name: "Human-in-the-loop and external events"
      content: "Pause workflows waiting for approvals, webhook callbacks, or events from other services. Dapr parks the execution in state storage and resumes instantly when the signal arrives, even weeks later or after the host restarts."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-patterns/#external-system-interaction"
    - name: "Scale without operating a workflow engine"
      content: "There's no separate workflow server to deploy, patch, or scale. Dapr Workflow runs inside the same sidecar as the rest of your Dapr APIs, using your existing state store (Redis, Postgres, Cosmos DB, and more) as the durable backend."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-architecture/"
    - name: "Composable with every Dapr API"
      content: "Call service invocation, pub/sub, state, bindings, actors, and AI agents directly from workflow activities. The entire Dapr building-block surface is compatible with Dapr workflow, with the same security and observability guarantees."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/"
    - name: "Production-grade observability"
      content: "Every workflow instance, activity, and retry is traced with OpenTelemetry. Inspect running workflows, replay history, and debug failures using standard tracing backends such as Jaeger, Zipkin, Grafana Tempo, and Application Insights."
      link: "https://docs.dapr.io/operations/observability/tracing/tracing-overview/"
    - name: "Verifiable execution"
      content: "Workflow execution histories can be cryptographically signed, making what ran tamper-evident and auditable. Every history event is signed using the sidecar's mTLS identity, creating a chain of signatures that is verified each time workflow state is loaded."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-history-signing/"
    - name: "Inspect workflows while you build"
      content: "Watch instances, activities, retries, and history as workflows run locally, without adding instrumentation. The Dapr Dev Dashboard, maintained by Diagrid, gives you a live view of Dapr on your machine while you develop."
      link: "https://docs.diagrid.io/dapr-open-source/dapr-dev-dashboard/"
  cta:
    primary:
      label: "Get started"
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/"
    secondary:
      label: "Quickstart"
      link: "https://docs.dapr.io/getting-started/quickstarts/workflow-quickstart/"
---
