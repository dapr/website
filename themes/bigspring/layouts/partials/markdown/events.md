# {{ .Title }}

{{ with .Params.subtitle }}{{ . | plainify }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.event }}
{{ with $.Params.image }}
![{{ $.Params.alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" . }})
{{ end }}
{{ range . }}
### {{ .title }}

{{ .summary }}
{{ if .cta.enable }}
[{{ .cta.label }}]({{ .cta.link | absURL }})
{{ end }}
{{ with .image }}
![{{ $.Params.alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" . }})
{{ end }}
{{ end }}
{{ with $.Params.sessions }}
## Agenda
{{ range . }}
### {{ .title }}

*{{ .speaker }}{{ with .role }} | {{ . }}{{ end }}*

{{ with .abstract }}
{{ . }}
{{ end }}
{{ end }}
{{ end }}
{{ end }}
{{ range .Params.playlists }}
### {{ .title }}

[Watch the playlist]({{ partial "markdown/youtube-url.html" .link }})
{{ end }}
