# {{ .Title }}

{{ with .Params.intro }}{{ . }}{{ else }}{{ .Description }}{{ end }}
{{ range .Params.faq }}
## {{ .question }}

{{ .answer }}
{{ with .link }}
[{{ .label }}]({{ .url | absURL }})
{{ end }}
{{ end }}
