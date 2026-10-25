# {{ .Title }}

{{ with .Params.subtitle }}{{ . | plainify }}{{ else }}{{ .Description }}{{ end }}
{{ range .Params.learn }}
### {{ .title }}

{{ .summary }}

[{{ .cta.label }}]({{ .cta.link | absURL }})
{{ end }}
{{ partial "markdown/panel-cta.md" . }}
