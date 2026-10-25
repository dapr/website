---
title: "Durable Workflows for Distributed Applications"
description: "Dapr Workflow: durable, verifiable execution for long-running processes with retries, timers, human approvals, and sagas, without operating a workflow engine."
intro: "Dapr Workflow is a durable execution engine: you write workflows as ordinary code, and Dapr persists each completed step so a workflow resumes after a crash, restart, or redeployment."
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
      content: "There's no separate workflow server to deploy, patch, or scale. Dapr Workflow runs inside the same sidecar as the rest of your Dapr APIs, using your existing state store (Redis, Postgres, Cosmos DB, and more) as the durable backend. Dapr 1.19 delivers up to 40% higher workflow throughput in the project's nightly performance tests compared with 1.18."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-architecture/"
      source: "https://github.com/dapr/dapr/releases/tag/v1.19.0"
    - name: "Composable with every Dapr API"
      content: "Call service invocation, pub/sub, state, bindings, actors, and AI agents directly from workflow activities. The entire Dapr building-block surface is compatible with Dapr workflow, with the same security and observability guarantees."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/"
    - name: "Workflows across apps"
      content: "An app can start, get, raise events on, pause, resume, terminate, and purge workflows that another app in the same namespace owns, without registering those workflows itself. Supported SDK workflow clients can also rerun them. The owning app's workflow access policy decides which callers can perform which operation on which workflow."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-multi-app/"
      source: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-multi-app/"
    - name: "Detached workflows"
      content: "A workflow can start a detached workflow: an independent instance with its own history and lifecycle, no link to its parent, and no result back to it. Use it for work that should outlive the caller, such as a clean-up or report job."
      link: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-detached/"
      source: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-detached/"
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
