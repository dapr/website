# {{ .Title }}

{{ with .Params.intro }}{{ . }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.subtitle }}
{{ . | plainify }}
{{ end }}
{{ range .Params.learn }}
### {{ .title }}

{{ .summary }}

[{{ .cta.label }}]({{ .cta.link | absURL }})
{{ end }}
{{ partial "markdown/panel-cta.md" . }}
