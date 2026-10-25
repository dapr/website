{{- /* The "panel" (video) and "cta" blocks that several section pages share. */ -}}
{{ with .Params.panel }}
## {{ .title | title }}
{{ with .video }}
[Watch the video]({{ partial "markdown/youtube-url.html" . }})
{{ end }}
{{ end }}
{{ with .Params.cta }}
## {{ .title | markdownify | plainify | htmlUnescape }}
{{ with .content }}
{{ . | markdownify | plainify | htmlUnescape }}
{{ end }}
{{ if .button.enable }}{{ with .button }}
[{{ .label }}]({{ .link | absURL }})
{{ end }}{{ end }}
{{ end }}
