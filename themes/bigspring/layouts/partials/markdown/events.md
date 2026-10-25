# {{ .Title }}

{{ with .Params.intro }}{{ . }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.subtitle }}
{{ . | plainify }}
{{ end }}
{{- if and (eq .Section "events") .Parent.IsHome -}}
{{- $split := partialCached "events/split.html" . .RelPermalink -}}
{{ with .Params.recurring }}
## Recurring
{{ range . }}
### {{ .title }}

{{ .cadence }}

{{ .summary }}
{{ range .links }}
[{{ .label }}]({{ .url }})
{{ end }}
{{ end }}
{{ end }}
## Upcoming events
{{ if $split.upcoming }}
{{ range $split.upcoming }}
### {{ .page.Title }}

{{ .t.Format "January 2, 2006" }}

{{ .page.Params.description }}

[View event]({{ .page.Permalink }})
{{ end }}
{{ else }}
No upcoming events are scheduled. Join the Dapr Community Call{{ with .Params.recurring }}{{ with (index . 0).cadence }}, which streams {{ lower . }}{{ end }}{{ end }}.
{{ end }}
{{ with $split.past }}
## Past events
{{ range . }}
### {{ .page.Title }}

{{ .t.Format "January 2, 2006" }}

{{ .page.Params.description }}

[View event]({{ .page.Permalink }})
{{ end }}
{{ end }}
{{- else -}}
{{ with .Params.event }}
{{ with $.Params.image }}
![{{ $.Params.alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" . }})
{{ end }}
{{ range . }}
## {{ .title }}

{{ .summary }}
{{ if .cta.enable }}
[{{ .cta.label }}]({{ .cta.link | absURL }})
{{ end }}
{{ with .image }}
![{{ $.Params.alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" . }})
{{ end }}
{{ end }}
{{ if partial "events/is-past.html" $ }}
{{ with $.Params.recordings }}
## Recordings

[Watch the recordings]({{ . }})
{{ else }}
## Recordings coming soon

Watch for the sessions on the [Dapr YouTube channel](https://www.youtube.com/@daprdev).
{{ end }}
{{- else }}
{{ with $.Params.registration_link }}
[Register]({{ . }})
{{ end }}
{{- end }}
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
{{- end -}}
