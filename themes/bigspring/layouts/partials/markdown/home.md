# The durable execution runtime for workflows and AI agents
{{- /* This H1 and the paragraph below are literals in partials/home/hero.html, not data. Keep them identical. */}}

Dapr provides durable, verifiable execution so your workflows and AI agents survive crashes, restarts, and outages, resuming exactly where they left off. Built on infrastructure-agnostic APIs with production-grade security, resiliency, and observability, so you can focus on your code.

![Dapr architecture diagram: Dapr in the center, connected to a workflow app, an agent, and an app, and to a message broker and a state store]({{ partial "markdown/image-url.html" "images/dapr_hero_diagram.svg" }})

- [Get Started](https://docs.dapr.io/getting-started/)
- [Durable Workflows]({{ "workflow/" | absURL }})
- [Dapr Agents]({{ "ai/" | absURL }})
{{ with site.Data.homepage.banner }}{{ if .enable }}
{{- $messages := .messages | default (slice (dict "prefix" .prefix "text" .text "link" .link)) }}
{{ range $messages }}
- {{ with .prefix }}{{ . }}{{ end }}[{{ .text }}]({{ .link }})
{{- end }}
{{ end }}{{ end }}
{{- with site.Data.homepage.useCases }}{{ if .enable }}
## {{ .title }}
{{ with .content }}
{{ . }}
{{ end }}
{{- range .feature_item }}
### {{ .name }}

{{ .content }}

[Learn more about {{ .name }}]({{ .link }})
{{ end }}
{{ end }}{{ end }}
{{- with site.Data.homepage.caseStudy }}{{ if .enable }}
## Case studies
{{ range .stories }}
### {{ .name }}

![{{ .name }}]({{ partial "markdown/image-url.html" .image }})

{{ .title }}
{{ with .content }}
"{{ . }}"
{{ end }}
[Read the article]({{ .link | absURL }})
{{ end }}
{{ end }}{{ end }}
{{- with site.Data.homepage.values }}{{ if .enable }}
## {{ .title }}

{{ .content }}
{{ range .feature_item }}
### {{ .name }}

{{ .content }}
{{ with .content2 }}
{{ . }}
{{ end }}
{{ end }}
{{ end }}{{ end }}
{{- with site.Data.homepage.buildingBlock }}{{ if .enable }}
## {{ .title }}

![{{ .imagealt }}]({{ partial "markdown/image-url.html" .image }})
{{ with .content }}
{{ . }}
{{ end }}
{{ range .feature_item }}
### {{ .name }}

{{ .content }}

[Read more about {{ .name }}]({{ .link }})
{{ end }}
{{ end }}{{ end }}
{{- with site.Data.homepage.concerns }}{{ if .enable }}
## {{ .title }}
{{ with .content }}
{{ . }}
{{ end }}
{{ range .feature_item }}
### {{ .name }}

{{ .content }}

[Read more about {{ .name }}]({{ .link }})
{{ end }}
{{ end }}{{ end }}
{{- with site.Data.homepage.adopters }}{{ if .enable }}
## Trusted and Adopted by

{{ range $i, $logo := .logos }}{{ if $i }}, {{ end }}{{ $logo.name }}{{ end }}
{{ end }}{{ end }}

## Dapr in the AI Era: Orchestrating Complex Multi-agent Workflows With Automatic Recovery

[Watch the video](https://www.youtube.com/watch?v=9gejXxl5JzE)

Dapr is a [Cloud Native Computing Foundation Graduated project](https://www.cncf.io/projects)
