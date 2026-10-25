# {{ .Title }}

{{ with .Params.subtitle }}{{ . | plainify }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.platform }}
![{{ .imagealt }}]({{ partial "markdown/image-url.html" .image }})

{{ .content }}
{{ range .feature_item }}
### {{ .name }}

{{ .content }}
{{ with .link }}
[Read the docs]({{ . }})
{{ end }}
{{ end }}
{{ end }}
