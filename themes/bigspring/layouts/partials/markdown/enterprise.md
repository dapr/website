# {{ .Title }}

{{ with .Params.intro }}{{ . }}{{ else }}{{ .Description }}{{ end }}
{{ with .Params.subtitle }}
{{ . | plainify }}
{{ end }}
{{ range .Params.companies }}
{{- $company := . }}
### {{ $company.title }}

![{{ $company.alt | plainify | htmlUnescape }}]({{ partial "markdown/image-url.html" $company.logo }})

{{ $company.summary }}
{{ with $company.title2 }}
### {{ . }}
{{ with $company.summary2 }}
{{ . }}
{{ end }}{{ end }}
{{- with $company.title3 }}
### {{ . }}
{{ with $company.summary3 }}
{{ . }}
{{ end }}{{ end }}
{{- if $company.cta.enable }}
[{{ $company.cta.label }}]({{ $company.cta.link | absURL }})
{{ end }}
{{ end }}
{{ partial "markdown/panel-cta.md" . }}
