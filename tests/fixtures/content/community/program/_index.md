---
title: "Fixture Meteors Program"
description: "Fixture copy of the Meteors program page, with every combination of a present and absent portrait and LinkedIn URL."
intro: "Fixture page. Not published."
draft: false
image: "images/community/dapr-meteors-logo.png"
alt: "Dapr Meteors Logo"

# Mirrors the real page, whose sponsor block is rendered unguarded. Without it
# the fixture would emit a site-root sponsor image that the real page cannot.
sponsor:
  image: "images/community/diagrid.png"
  alt: "Diagrid Sponsor Logo"
  link: "https://www.diagrid.io/"

# Both layouts wrap the Meteors and Alumni sections in `with .Params.program`,
# so the page needs at least one program entry for them to render at all.
program:
  - title: "Fixture section"
    summary: "Fixture section body."
    cta:
      enable: false
      label: ""
      link: ""

meteors:
  - name: "Fixture Both"
    image: "images/community/meteors/alex-mang.jpg"
    alt: "Fixture Both"
    linkedin: "https://www.linkedin.com/in/fixture-both/"
    bio: "Has a portrait and a LinkedIn URL."

  - name: "Fixture Photo Only"
    image: "images/community/meteors/alex-mang.jpg"
    alt: "Fixture Photo Only"
    bio: "Has a portrait but no LinkedIn URL."

  - name: "Fixture Link Only"
    alt: "Fixture Link Only"
    linkedin: "https://www.linkedin.com/in/fixture-link-only/"
    bio: "Has a LinkedIn URL but no portrait."

  - name: "Fixture Neither"
    alt: "Fixture Neither"
    bio: "Has neither a portrait nor a LinkedIn URL."

alumni_meteors:
  - name: "Fixture Alumni With Photo"
    image: "images/community/meteors/alex-mang.jpg"
    alt: "Fixture Alumni With Photo"

  - name: "Fixture Alumni No Photo"
    alt: "Fixture Alumni No Photo"
---
