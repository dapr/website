# {{ .Title }}

{{ with .Params.intro }}{{ . }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.subtitle }}
{{ . | plainify }}
{{ end }}
{{ with .Params.ai }}
{{ .content }}
{{ range .feature_item }}
### {{ .name }}

{{ .content }}
{{ with .link }}
[Read the docs]({{ . }})
{{ end }}
{{ end }}
{{ with .cta }}{{ with .primary }}
[{{ .label }}]({{ .link }})
{{ end }}{{ with .secondary }}
[{{ .label }}]({{ .link }})
{{ end }}{{ end }}
{{ end }}
