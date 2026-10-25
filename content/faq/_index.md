---
title: "Dapr FAQ: Durable Execution, Workflows, and AI Agents"
# meta description
description: "Answers to common questions about Dapr: durable execution, workflows, AI agents, the MCP server, hosting, SDK languages, licensing, and support."
meta_keywords: "dapr faq, what is dapr, durable execution, dapr workflow, dapr agents, dapr mcp server, dapr kubernetes, dapr sdk, dapr open source"
draft: false

intro: "Short answers to common questions about Dapr, with links to the Dapr docs for the details."

# Each entry: `answer` is plain text (no Markdown), 2 to 4 sentences.
# `source` is the page that backs every fact in the answer. It is never
# rendered; it is there so the answer can be checked. Use docs.dapr.io pages
# taken from https://docs.dapr.io/en/sitemap.xml. tests/specs/faq.spec.js
# allows only the three non-docs sources used below (enterprise, license and
# CNCF status), each pinned to its question.
# `link` is optional and is rendered as a "Learn more" style link.
faq:

  - question: "What is Dapr?"
    answer: "Dapr is the durable execution engine for workflows and AI agents. It provides APIs for building event-driven architectures. Each Dapr building block, such as workflows, service invocation, publish and subscribe, or state management, is an HTTP or gRPC API that your code calls and that uses one or more Dapr components."
    source: "https://docs.dapr.io/concepts/building-blocks-concept/"
    link:
      label: "Learn about the building blocks"
      url: "https://docs.dapr.io/concepts/building-blocks-concept/"

  - question: "What is durable execution?"
    answer: "Durable execution is the guarantee that your code runs to completion despite crashes, restarts, and outages. Dapr is built around durable execution: at its core is a workflow engine that orchestrates long-running business processes and powers durable AI agents."
    source: "https://docs.dapr.io/concepts/"
    link:
      label: "Read the Dapr concepts"
      url: "https://docs.dapr.io/concepts/"

  - question: "Is Dapr a workflow engine?"
    answer: "Dapr includes one: Dapr Workflow is a durable execution engine, and you write workflow logic as ordinary code with a Dapr SDK. Dapr persists the result of each completed step and resumes the workflow from the last completed step after a crash, a restart, or a redeployment. Workflows can also orchestrate other Dapr building blocks, such as service invocation, pub/sub, state management, and bindings."
    source: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/"
    link:
      label: "Read the workflow overview"
      url: "https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/"

  - question: "How does Dapr help build AI agents?"
    answer: "Dapr Agents is a Python framework for building AI agents powered by large language models (LLMs) using Dapr's distributed systems capabilities. Its agents can execute durable tasks, make decisions, and collaborate through workflows, while using Dapr's state management, messaging, and observability features. Dapr Agents v1.0 is generally available and production ready."
    source: "https://docs.dapr.io/developing-ai/dapr-agents/"
    link:
      label: "Explore Dapr Agents"
      url: "https://docs.dapr.io/developing-ai/dapr-agents/"

  - question: "What is the Dapr MCP server?"
    answer: "The Dapr MCP server is a standalone Model Context Protocol (MCP) server that runs next to a Dapr sidecar and turns the sidecar's building blocks, such as state, pub/sub, bindings, secrets, and service invocation, into tools that any MCP client can call. It is a separate binary with its own release cycle, not a feature of the Dapr sidecar itself. The Dapr MCP server is in alpha, so tool names, inputs, and configuration may change in a future release."
    source: "https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/"
    link:
      label: "Read about the Dapr MCP server"
      url: "https://docs.dapr.io/developing-ai/mcp/dapr-mcp-server/"

  - question: "Does Dapr require Kubernetes?"
    answer: "No, but most organizations do run Dapr on Kubernetes in production. Dapr can run in self-hosted mode on your local developer machine or on production virtual machines, where each running service has a Dapr sidecar process. Self-hosted mode can be initialized with Docker, which is the default, or in slim-init mode, and it can also run in offline or airgapped environments."
    source: "https://docs.dapr.io/operations/hosting/self-hosted/self-hosted-overview/"
    link:
      label: "See the hosting options"
      url: "https://docs.dapr.io/operations/hosting/"

  - question: "Which programming languages does Dapr support?"
    answer: "Dapr has stable SDKs for .NET, Python, Java, Go, PHP, and JavaScript, and SDKs for C++ and Rust are in development. Depending on the language, an SDK provides client, server extension, actor, and workflow packages for working with the Dapr APIs. From any language, your code can also call the Dapr HTTP or gRPC APIs directly."
    source: "https://docs.dapr.io/developing-applications/sdks/"
    link:
      label: "Browse the Dapr SDKs"
      url: "https://docs.dapr.io/developing-applications/sdks/"

  - question: "How do I add Dapr to an existing application?"
    answer: "Dapr runs as a separate process, the Dapr sidecar, alongside your application, and your application calls the Dapr APIs over local HTTP or gRPC endpoints. When you develop locally, the Dapr CLI run command launches the sidecar together with your application. On Kubernetes, the Dapr sidecar injector adds the sidecar to pods that have the dapr.io/enabled annotation."
    source: "https://docs.dapr.io/concepts/dapr-services/sidecar/"
    link:
      label: "Read about the Dapr sidecar"
      url: "https://docs.dapr.io/concepts/dapr-services/sidecar/"

  - question: "Is Dapr production ready, and who uses it?"
    answer: "Yes, Dapr has been production ready for years. Dapr is a graduated project of the Cloud Native Computing Foundation (CNCF). Organizations describe how they use Dapr on the CNCF case studies page."
    source: "https://www.cncf.io/projects/dapr/"
    link:
      label: "Read the case studies"
      url: "https://www.cncf.io/projects/dapr/"

  - question: "Is Dapr free and open source?"
    answer: "Yes. Dapr is open source software licensed under the Apache License, Version 2.0, and its source code is on GitHub."
    source: "https://github.com/dapr/dapr/blob/master/LICENSE"
    link:
      label: "View Dapr on GitHub"
      url: "https://github.com/dapr/dapr"

  - question: "Where can I get commercial support?"
    answer: "Companies in the Dapr ecosystem offer commercial support, managed services, and enterprise distributions for running Dapr in production. The Dapr enterprise page lists these offerings."
    source: "https://dapr.io/enterprise/"
    link:
      label: "See enterprise solutions"
      url: "/enterprise/"
---
