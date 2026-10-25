{{- /* Markdown body of any page. Takes the page as context. Used by _default/list.markdown.md and index.markdown.md (so every /<path>/index.md) and by index.llmsfull.txt, so all three stay identical. Runs of blank lines left by the section partials are collapsed to one blank line. */ -}}
{{- $md := "" -}}
{{- if .IsHome }}{{ $md = partial "markdown/home.md" . -}}
{{- else if in (slice "ai" "community" "enterprise" "events" "faq" "learn" "platform-engineering" "testimonials" "workflow") .Section }}{{ $md = partial (printf "markdown/%s.md" .Section) . -}}
{{- else }}{{ $md = partial "markdown/default.md" . -}}
{{- end -}}
{{- $md | replaceRE `\n[ \t]*\n([ \t]*\n)+` "\n\n" -}}
