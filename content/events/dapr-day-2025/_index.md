---
title: "Dapr Day 2025"
description: "Dapr Day 2025"
draft: false
image: "images/events/dapr-day-2025-banner.png"
alt: "Dapr Day 2025 Logo"


event:
  - title: "Join us for Dapr Day 2025!"
    summary: "Dapr Day is a virtual event for developers and platform engineers to learn about Dapr, the distributed application runtime, a graduated CNCF project used by many organizations to build secure and reliable microservices and agentic AI systems.


    During Dapr Day, you'll hear from users how they use Dapr in production and learn from subject matter experts and maintainers how to use the latest Dapr features.


    Dapr Day will be held on November 5th, 2025, 17:00 - 22:00 CET / 8am - 1pm PST."

  - title: "Topics"
    summary: "Topics that will be covered during Dapr Day include:

    - Case studies

    - Tips for running Dapr in production

    - Dapr and agentic AI

    - Dapr and workflows based on durable execution

    - Dapr API deep dives
    
    
    Scroll down to see the agenda and speakers."

  - title: "Registration"
    summary: "Dapr Day is a free community event that is open for everyone. Register using the form below."

playlists:
  - title: "Dapr Day Oct 2024 Sessions"
    link: "https://www.youtube.com/embed/videoseries?si=Y99c5aXc2J41juVo&amp;list=PLcip_LgkYwzsFZ65fIzeOmJBQHwcPQ_gE"

sessions:
  - title: "Building and running applications using Dapr since 2020"
    speaker: "Fabian Steinbach"
    role: "Software architect at ZEISS Group"
    abstract: "ZEISS Vision uses Dapr since 2020 to build and run a new cloud native order fulfillment system. 5 years later it is time to reflect on the journey. What kind of challenges have we faced and what are the learnings? What building blocks are we using and what have we learned using them.
    
    
    As we look ahead to the future of Dapr, we need to identify the key building blocks we want to use to support our continued journey."

  - title: "Simplifying Local Development for Dapr in the Java Ecosystem"
    speaker: "Mauricio (Salaboy) Salatino"
    role: "OSS Software and Ecosystem Engineer @Diagrid / Java Champion / Cloud Native Ambassador" 
    abstract: "In this session, we will dig deep into the Dapr Spring Boot and Quarkus integration, highlighting the importance of simplifying the developer experience when targeting specific communities that are tied to a particular set of tools and frameworks.
    

    We will be looking at practical examples on the Java SDK including the gaps and missing bits that are still on the roadmap.
    

    With a practical example on how Dapr Workflow integrates with Spring AI, this session is designed to give Java developers an overview about how they can start using Dapr with their Spring Boot and Quarkus applications."
  
  - title: "Electronic Prior Authorization with Dapr: Microservices & Agentic AI PoC for the Healthcare Industry"
    speaker: "Vishwasrao Salunkhe"
    role: "Healthcare Enthusiast, Technical Geek, Loves programming."
    abstract: "This presentation demonstrates a real-world proof-of-concept for an electronic prior authorization (e-PA) workflow, built with the dapr. The solution uses microservices for different e-PA stages, leveraging dapr's Pub/Sub and State Management building blocks for orchestration and state persistence. 
    

    A key highlight is Dapr's seamless integration with Da Vinci Project standards—specifically, the Coverage Requirements Discovery (CRD), Documentation Templates and Rules (DTR), and Prior Authorization Support (PAS) implementation guides via CDS Hooks technology. This approach directly aligns with the CMS HTI-4 Rule (CMS-0057-F) to improve e-PA processes.
    

    The talk also features an advanced Agentic AI use case, where dapr agents automate decision-making. Attendees will learn how to use multiple dapr building blocks to create a scalable, standards-compliant solution for complex healthcare workflows, providing a valuable blueprint for developing future-proof applications."

  - title: "Building MCP Server with Dapr to ask questions to an Industrial device with Azure IoT Operations"
    speaker: "Walter Coan"
    role: "UNIVILLE, Professor"
    abstract: "Azure IoT Operations (AIO) is the new Industrial IoT platform from Microsoft Azure, and it's using Dapr as the default way to develop new modules to publish into the AIO Kubernetes device.
    
    
    This presentation will demonstrate how to use the Dapr Runtime to build an MCP Server, publish it to a Kubernetes cluster running Azure IoT Operations, and query real-state data from an integrated industrial device over the OPC UA protocol."

  - title: "Accelerating Modernization at Elation Health with Dapr and Event-Driven Architecture"
    speaker: "Patrick"
    role: "Elation Health, Director Engineering, Platform"
    abstract: "Elation Health, a mission-driven Health Tech company, has supported independent Primary Care providers for 15 years with an All-in-One EHR solution, initially built on a monolithic architecture internally branded as \"hippo.\" As the company scaled, the growing complexity of this monolith increasingly hampered the engineering team's ability to rapidly deliver value and innovation. An initial attempt to introduce microservices resulted in a brittle \"distributed monolith\" due to a lack of standardized framework. To address this, the engineering team pivoted to an event-driven architecture (EDA), leveraging Apache Kafka (managed through Confluent) as the communication backbone. This transition, while necessary, introduced new complexity for engineers managing Pub/Sub applications, leading to inconsistent implementations and inadequate guardrails for fault tolerance (e.g., retries, Dead Letter Queues).


We adopted the Distributed Application Runtime (Dapr), focusing initially on its PubSub building block. Dapr provided excellent Kafka support and a standardized, fault-tolerant programming model, especially crucial for our Python/FastAPI ecosystem. By leveraging Dapr’s SDK, we offered engineers an abstraction that felt familiar—similar to the traditional Request/Response model—while automatically enforcing essential resiliency policies.


This success led us to generalize Dapr across our stack. We developed a comprehensive microservices template using copier and integrated it with a Helm chart that automatically provisions and configures relevant Dapr components. This standardization allows engineers to seamlessly adopt Dapr features in seconds and enables the engineering team to roll out fleet-wide component changes in minutes.


Our Dapr journey is now accelerating our path toward becoming an AI-native EHR. The immediate integration of features like Dapr Workflows is instrumental in quickly innovating and building new AI use cases. Dapr has proven to be a critical accelerator, transforming our delivery velocity and empowering our small, mighty team to focus on clinical value rather than infrastructure complexity."

  - title: "Glueing .NET Aspire Services with Container Apps and Dapr"
    speaker: "Eduard Keilholz"
    role: "Cloud Solution Architect @ 4Dotnet | Book Author | International Conference Speaker | Founder of https://spreaview.com"
    abstract: "Ready to move your .NET Aspire project from local development to a production-ready cloud environment? This session provides a practical roadmap for deploying multi-service .NET solutions using Azure Container Apps and Dapr, tackling the common challenges of scaling, inter-service communication, and resilience.


In this session, you will learn how to:

* Containerize .NET Aspire services for a seamless deployment to Azure Container Apps.

* Leverage built-in Dapr components for robust service invocation, pub/sub messaging, and state management.

* Enhance communication and reliability between services without writing complex, boilerplate code.

* Create a clear strategy for streamlining the deployment and operation of your applications on Azure.


Join us to gain the skills and confidence needed to operate modern, cloud-native .NET solutions in production. This session is essential for developers and architects looking to simplify their service landscape and accelerate their deployment pipeline."

  - title: "AI-Powered Banking with Dapr: Cloud-Native Transformation & Fraud Detection"
    speaker: "Rajender Chilukala"
    role: "Independent author"
    abstract: "The banking sector is rapidly embracing cloud-native architectures and intelligent automation to compete with agile fintech innovators. This session explores how Dapr can accelerate digital transformation across three key domains: AI-driven customer onboarding, scalable core banking systems, and real-time fraud detection.


By leveraging OCR and machine learning, digital onboarding eliminates slow, paper-based account opening, while biometric verification ensures both speed and security. Dapr’s distributed application runtime enables modular, event-driven architectures that overcome the rigidity of legacy monoliths, supporting containerized deployments, resilient service-to-service communication, and API-first integration. This shift unlocks continuous operations and seamless scaling for core banking workloads.


Fraud detection is evolving from static rule sets to adaptive machine learning models that continuously learn from transaction streams. Coupled with Dapr’s support for pub/sub messaging and event-driven pipelines, financial institutions can process high-volume, low-latency data to identify anomalies in real time.


This talk also addresses the challenges of integrating Dapr-enabled microservices with established mainframes, meeting diverse regulatory demands, and ensuring data protection. Attendees will gain practical insights into how Dapr empowers banks to deliver elastic scalability, secure customer experiences, and future-ready architectures turning compliance and innovation into complementary forces."
---
