# {{ .Title }}

{{ with .Params.subtitle }}{{ . | plainify }}{{ else }}{{ .Description }}{{ end }}
{{ range .Params.community }}
### {{ .title }}

![{{ .alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" .logo }})

{{ .summary }}

[{{ .cta.label }}]({{ .cta.link | absURL }})
{{ end }}
{{ range .Params.playlists }}
### {{ .title }}

[Watch the playlist]({{ partial "markdown/youtube-url.html" .link }})
{{ end }}
{{ with .Params.program }}
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
{{ with $.Params.sponsor }}
The Dapr Meteors program is sponsored by [{{ .alt | plainify | htmlUnescape }}]({{ .link | absURL }}).
{{ end }}
{{ with $.Params.meteors }}
## Meet the Meteors 🌠
{{ range . }}
### {{ .name }}

![{{ .alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" .image }})

{{ .bio }}

[LinkedIn]({{ .linkedin | absURL }})
{{ end }}
{{ end }}
{{ with $.Params.alumni_meteors }}
## Alumni Meteors
{{ range . }}
### {{ .name }}

![{{ .alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" .image }})
{{ end }}
{{ end }}
{{ end }}
{{ partial "markdown/panel-cta.md" . }}
