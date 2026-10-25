# {{ .Title }}

{{ with .Params.intro }}{{ . }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.subtitle }}
{{ . | plainify }}
{{ end }}
{{ range .Params.adopters }}
![{{ with .alt }}{{ . | plainify | htmlUnescape }}{{ else }}{{ .summary | plainify | truncate 80 }} logo{{ end }}]({{ partial "markdown/image-url.html" .logo }})

{{ .summary }}

"{{ .quote }}"
{{ with .person }}
{{ . }}
{{ end }}
[{{ .cta.label }}]({{ .cta.link | absURL }})
{{ end }}
{{ partial "markdown/panel-cta.md" . }}
