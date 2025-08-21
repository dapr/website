---
title: "Solving Platform Engineering Challenges with Dapr"
description: "Solving Platform Engineering Challenges"
draft: false

platform:
  enable : true
  content : "With Dapr, a graduated CNCF project, platform teams can configure complex setups while exposing simple interfaces to application development teams, making it easier for them to build highly scalable distributed applications. Many platform teams have adopted Dapr to provide governance and golden paths for API-based infrastructure interaction. Dapr helps to solve these platform engineering challenges:"
  image: "images/platform-engineering/dapr-platform.png"
  imagealt: "Dapr Platform Engineering Overview"
  feature_item:
    - name : "Infrastructure complexity & coupling"
      content : "The Dapr building block APIs, provide an abstraction over the underlying infrastructure. Development teams don’t require product-specific SDKs when using the Dapr APIs, making it easy to switch from one product to another and support multiple different products of the same type. For example; developers use the Dapr Pub/Sub API in their code, and during development, they use Redis Streams as the message broker that runs locally in a container, while the production environment uses Kafka that runs in the cloud. Equally, platform teams can provide multiple messaging products such as Kafka, Pulsar, and RabbitMQ, and development teams can use either of them using the same Pub/Sub API."
    - name : "Observability to resolve production issues"
      content : "Dapr improves observability in distributed applications since all communication between applications and infrastructure passes through the Dapr process. Dapr natively integrates with OpenTelemetry, and by automatically generating and propagating tracing contexts using the W3C tracing specification across all its APIs, Dapr removes the need for manual instrumentation, saving development time. This  allows for easier telemetry data collection that includes metrics, logs, and traces and faster time to resolution of issues, given the critical need for observability in production environments. "
    - name : "Managing security & compliance"
      content : "Dapr has several built-in features to manage secure communication, access control and authentication. Dapr uses mutual Transport Layer Security (mTLS) to encrypt communication between services, ensuring data integrity and confidentiality. Access Policies can be defined by the platform team to control access to services, infrastructure resources (components) and secrets for governance. Additionally, Dapr supports middleware components, such as OAuth 2.0, which can handle authentication and authorization for web APIs."
    - name : "High reliability and resiliency"
      content : "Dapr improves application resiliency by providing platform engineers with configurable policies for retries, circuit breakers, and timeouts. These policies can be scoped to specific applications, infrastructure resources (components), enabling fine-grained control and improved application uptime. "
    - name : "Platform integration capabilities"
      content : "Dapr provides Kubernetes-native custom resource definitions to configure applications and infrastructure resources (components), enabling platform engineers to leverage GitOps and tools like Argo CD or Flux CD. Dapr integrates with policy engines like Kyverno and OPA, simplifying the tasks related to compliance and governance, protecting product teams from misconfigurations."

---