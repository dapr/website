---
title: "Companies building with Dapr"
#subtitle: ""
# meta description
description: "This is meta description"
draft: false

adopters:
  - logo : "images/adoptedby/hdfcbank.png"
    icon: "ti-quote-right"
    summary: "Throttling incoming traffic requests without changing the core banking system"
    quote : "HDFC Bank handles close to 750 million transactions/month however the UPI transaction rate varies throughout the day. Dapr metrics along with KEDA have been leveraged to scale out horizontally based on the incoming HTTP traffic allowing the number of replicas of Governor to scale up and down without any issues."
    cta :
      enable : true
      label : "Read the article"
      link : "https://www.cncf.io/case-studies/hdfc-bank/"

  - logo : "images/adoptedby/defacto.png"
    icon: "ti-quote-right"
    summary: "How DeFacto migrated to an event-driven architecture"
    quote : "In a short time, as a result of adopting Dapr, DeFacto’s developers rapidly deployed a significant number of services into all environments. With multiple development teams working on different scopes and solution areas, interdependencies between services under the control of different teams added further complexity to the development process. However, Dapr’s service invocation API building block streamlined the development process by simplifying the discoverability and calling between multiple services."
    cta :
      enable : true
      label : "Read the article"
      link : "https://www.cncf.io/case-studies/defacto/"

  - logo : "images/adoptedby/atbay.png"
    icon: "ti-quote-right"
    summary: "How At-Bay improved operations with Dapr"
    quote : "At-Bay uses Dapr to better analyze its processes by offering increased visibility and traceability because of the built-in support of Dapr for the OpenTelemetry standard."
    cta :
      enable : true
      label : "Read the article"
      link : "https://www.cncf.io/case-studies/at-bay/"

  - logo : "images/adoptedby/wortell.png"
    icon: "ti-quote-right"
    summary: "Wortell reduced infrastructure complexity with Dapr."
    quote : "The team were able to remove several software packages and a considerable amount of code from all of their microservices. Plus adopting Dapr APIs from the .NET SDK allowed them to offload dealing with the infrastructure integration and async inter-process communication to the Dapr runtime."
    cta :
      enable : true
      label : "Read the article"
      link : "https://www.cncf.io/case-studies/wortell/"

  - logo : "images/adoptedby/alibaba.png"
    icon: "ti-quote-right"
    summary : "See how at Alibaba Cloud, Dapr is used to solve challenges of multi-language systems, integration with legacy systems, and cloud-to-cloud migration."
    quote : "At Alibaba Cloud, we believe Dapr will lead the evolution of microservices. By adopting Dapr, our customers now enjoy increased velocity for building portable and robust distributed systems."
    person : "-- Xiang Li, Senior Staff Engineer, Alibaba Cloud"        
    cta : 
      enable : true
      label : "Read the article"
      link : "https://blog.dapr.io/posts/2021/03/19/how-alibaba-is-using-dapr/"

  - logo : "images/adoptedby/bosch.png"
    icon: "ti-quote-right"
    summary : "Bosch's Residential IoT Services GmbH (RIoT) uses Dapr actors and Java SDK to build a large scale smart home IoT solution."
    quote : "We used the Dapr SDK to publish events, which gave us the time to focus on what we wanted to communicate, instead of, ‘How do I get this communication implemented?’ We could focus on the real things that matter."
    person : "-- Jasper Mang, Lead Developer, RIoT"        
    cta : 
      enable : true
      label : "Read the article"
      link : "https://customers.microsoft.com/en-us/story/1435725395247777374-bosch-builds-smart-homes-using-dapr-azure"

  - logo : "images/adoptedby/zeiss.png"
    icon: "ti-quote-right"
    summary : "ZEISS uses Dapr's actor framework to manage the life-cycle of orders in a global scale production system running on Microsoft Azure."
    quote : "Dapr really simplifies the case of distributed application architectures. With Dapr, any developer can do it."
    person : "-- Kai Walter, Lead Architect, ZEISS"
    cta :
      enable : true
      label : "Read the article"
      link : "https://customers.microsoft.com/en-us/story/1336089737047375040-zeiss-accelerates-cloud-first-development-on-azure-and-streamlines-order-processing"
      
  - logo : "images/adoptedby/ignition-group.png"
    icon: "ti-quote-right"
    summary : "See how Ignition Group sped up the development of an order processing and payment system with Dapr."
    quote : "Using Dapr with Azure makes it very easy to bolt in new pieces of infrastructure without changing anything else. It changed our business."
    person : "-- Russell Stather, Chief Digital Transformation Officer, Ignition Group"
    cta :
      enable : true
      label : "Read the article"
      link : "https://customers.microsoft.com/en-us/story/1335733425802443016-ignition-group-speeds-development-and-payment-processing-using-dapr-and-azure"

  - logo : "images/adoptedby/legentic.png"
    icon: "ti-quote-right"
    summary : "Legentic leverages Dapr in it's solution with Python and FastAPI running on AWS."
    quote : "The fact that we could focus on the core logic and let Dapr deal with the underlying messaging systems allowed us to iterate much faster than we expected."
    person : "-- Trond Hindenes, Cloud Architect, Legentic"
    cta :
      enable : true
      label : "Watch the video"
      link : "https://www.youtube.com/watch?v=Mn0vjMMktGA"

  - logo : "images/adoptedby/autonavi.png"
    icon: "ti-quote-right"
    summary : "See how AutoNavi built a new serverless solution for car navigation with Dapr running on Alibaba Cloud."
    quote : "Dapr is really a perfect solution for invoking backend services in our multi-language serverless runtime."
    person : "-- Xuexiang Deng, Staff Engineer, AutoNavi"
    cta :
      enable : true
      label : "Read the article"
      link : "https://blog.dapr.io/posts/2021/09/02/how-dapr-helped-autonavi-build-a-new-serverless-solution/"

  - logo : "images/adoptedby/roadwork.png"
    icon: "ti-quote-right"
    summary : "Roadwork uses Dapr with KEDA to build a portabnle, cloud-agnostic, web automation solution."
    quote : "Without Dapr, we would need multiple weeks to integrate the different services together as well as create our own scaling infrastructure and service discovery tooling."
    person : "-- Xavier Geerinck, Founder, Roadwork"
    cta :
      enable : true
      label : "Read the article"
      link : "https://blog.dapr.io/posts/2021/02/09/running-dapr-in-production-at-roadwork/"

  - logo : "images/adoptedby/man-group.png"
    icon: "ti-quote-right"
    summary: "Man Group used Dapr to modernize its trading platform which runs on VMs deployed on-prem."
    quote : "With Dapr we can introduce platform-wide capabilities across a broad spectrum of technologies and deployment models with minimal effort, allowing us to more effectively evolve our core trading system."
    person : "-- Simon Jones, Head of Platform Engineering, Man Group"
    cta :
      enable : true
      label : "Watch the video"
      link : "https://www.youtube.com/watch?v=hEKlsyRFtzI"

panel:
  enable : true
  title : "Watch this DaprCon panel and learn from Dapr adopters"
  video : "https://www.youtube.com/embed/Jyug0wnfsug"

cta:
  enable : true
  title : "Ready to get started?"
  image : "images/app.png"
  content : "Get Dapr on your local machine and get started in minutes"
  button:
    enable : true
    label : "Get started"
    link : "https://docs.dapr.io/getting-started/"



---