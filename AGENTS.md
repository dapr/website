# AGENTS.md

Guidance for AI agents working in this repository. Human contributors should start with [README.md](README.md); this file covers the things that are easy to get wrong here.

## What this is

The source for [dapr.io](https://dapr.io), a static marketing site built with Hugo and deployed on Netlify. It is not the documentation site. Documentation lives in a separate repository and is published at docs.dapr.io.

This is a CNCF graduated project's website. Copy is public-facing and is read as an official statement by the project, so accuracy matters more than polish.

## Build and run

Hugo **extended** version **0.147.9**, exactly. The version is pinned in two places and both should stay in step:

- `netlify.toml` -> `HUGO_VERSION`
- `.devcontainer/devcontainer.json` -> the `hugo` feature

The extended build is mandatory. The theme compiles SCSS, and a non-extended binary fails outright.

```bash
hugo                          # build into public/
hugo server --disableFastRender   # local preview on :1313
```

### Do not add `--bind` to `hugo server`

With `--bind`, Hugo stops rewriting `baseURL` away from the configured `https://dapr.io/`. The preview then loads **CSS and assets from the production site**, so local SCSS and template edits are invisible and you end up verifying the live site by accident. Symptoms are a page that ignores your changes, or computed styles that do not match the SCSS you just edited. Use the command exactly as the README gives it.

### Do not run `rm -rf resources`

`resources` is listed in `.gitignore`, but two SCSS cache files under `resources/_gen/` were committed before that rule existed and are still tracked. Deleting the directory shows up as tracked-file deletions, and current Hugo caches to `~/.cache/hugo_cache`, so a rebuild does not restore them. `rm -rf public` on its own is safe.

## Where things live

Homepage copy is data, not markup. Everything else is front matter.

| What | Where |
| --- | --- |
| Homepage copy and section data | `data/homepage.yml` |
| Homepage section order | `themes/bigspring/layouts/index.html` |
| Homepage section markup | `themes/bigspring/layouts/partials/home/*.html` |
| Homepage hero diagram (animated D3 wireframe) | `themes/bigspring/assets/js/hero-diagram.js`; markup and logo symbol in `partials/home/hero.html`; D3 modules vendored in `themes/bigspring/static/plugins/d3/`; static fallback `assets/images/dapr_hero_diagram.svg` is generated, rerun `npm run export:diagram-fallbacks` in `tests/` after changing the diagram |
| Homepage value-prop diagrams (2D D3 animations replacing the MP4s) | `themes/bigspring/assets/js/value-props.js` (engine and one scene per diagram); a feature item in `data/homepage.yml` with `diagram: <scene>` and `diagramdesc` renders one instead of a video; brand marks in `assets/images/icons/` (Simple Icons, CC0); fallbacks in `assets/images/value-props/`, regenerated with `npm run export:diagram-fallbacks` in `tests/` |
| Other page copy | `content/<page>/_index.md` front matter |
| Other page markup | `themes/bigspring/layouts/<page>/list.html` |
| Markdown renderings of pages (`index.md`, for LLMs and agents) | `themes/bigspring/layouts/<page>/list.markdown.md`, falling back to `_default/list.markdown.md`; home is `index.markdown.md` |
| `llms.txt` (generated page list, docs links) | `themes/bigspring/layouts/index.llms.txt` |
| `llms-full.txt` (every page's markdown in one file) | `themes/bigspring/layouts/index.llmsfull.txt` |
| Site config, menus, meta | `config.toml` |
| Styles | `themes/bigspring/assets/scss/` |
| Images | `static/images/` |
| Structured data (JSON-LD) | `layouts/partials/jsonld/*.html` (repo root, not the theme), built with `dict` and `jsonify` |

Every directory under `content/` has a matching layout directory under `themes/bigspring/layouts/`: `ai`, `community`, `enterprise`, `events`, `faq`, `learn`, `platform-engineering`, `testimonials`, `workflow`. The `_index.md` files are front matter only, with no body, so a page's copy and its rendering are always in those two files.

`static/images/dapr-logo-square.png` (the `logo_png` param, used as the schema.org logo) comes from the official CNCF artwork repo, `projects/dapr/icon/color/dapr-icon-color.png` in https://github.com/cncf/artwork (2001x1066). It was padded onto a square white canvas without distortion, then scaled to 512x512: `sips -p 2001 2001 --padColor FFFFFF in.png --out sq.png`, then `sips -z 512 512 sq.png --out static/images/dapr-logo-square.png`.

The `bigspring` theme is vendored in this repo, not a submodule. Edit it directly.

## Conventions

US spelling, matching the existing copy.

Avoid em dashes and en dashes in prose. They were removed from the site copy deliberately; use commas, colons, parentheses, or two sentences.

Templates render page copy through `{{ .content }}` in some layouts and `{{ . | markdownify }}` in others. Check before writing a Markdown link: `learn/list.html` and `enterprise/list.html` markdownify their body copy, while `workflow/list.html`, `ai/list.html`, and `platform-engineering/list.html` do not. `faq/list.html` renders answers as plain text, with no markdownify, so the same applies there. In the latter, a Markdown link renders as literal text, so add a `link` field and render it in the template instead.

`config.toml` uses CRLF line endings. Other files use LF. Preserve them.

## Copy that must not change without care

Two claims on the site are load-bearing and have been flagged before.

The homepage states that Dapr "increases your developer productivity by 30%". This comes from real user feedback. Do not remove, soften, or qualify it.

Workflow history signing is behind a feature flag and **disabled by default**. Copy must say histories "can be" cryptographically signed. It must never say they "are" signed, which would read as a default-on guarantee. A capability statement such as "durable, verifiable execution" is fine; an unconditional one is not. Guard with:

```bash
grep -rc "are cryptographically signed" public/     # must be 0
```

## Verifying a change

### Playwright tests

`tests/` holds a Playwright suite that guards the accessibility fixes: visible focus rings, the keyboard-operable nav dropdown, the carousel and video pause controls (including `prefers-reduced-motion`), markup rules such as no `<button>` inside `<a>`, and an axe-core scan of every page at desktop and mobile widths. It runs in `.github/workflows/site-tests.yml` on pull requests to `master`. Run it after any change to the theme's templates, SCSS, or JS:

```bash
cd tests && npm install && npm test
```

Things that are easy to get wrong:

- It lives in `tests/` with its own `package.json` on purpose. A `package.json` at the repo root makes Netlify run `npm install` on every deploy.
- The tests build the site into `tests/.site` with a localhost `baseURL` and serve it statically. Do not point them at `hugo server`; overriding `--baseURL` there makes pages load assets from production, so tests pass against code that is not under test. `reuseExistingServer` is `false` for the same reason: a leftover server serves a stale build.
- Date-dependent pages (the `/events/` listing) are tested with fixture builds. `buildFixtureSite(name, fixtureConfig)` in `tests/specs/helpers.js` runs `hugo` (the one on PATH) with an extra config from `tests/fixtures/` that pins `params.eventsReferenceDate` (the fixed "now") and mounts `tests/fixtures/content`, writing to `tests/.site-<name>-<pid>` (gitignored, one directory per worker, memoized per worker). It returns `{ dir, stderr }`. It logs at `warn` instead of using `--quiet`, because `--quiet` hides the build warnings the tests assert on.
- They run in system Google Chrome (`channel: 'chrome'`). Playwright's bundled Chromium cannot play the homepage MP4s.
- Third-party embeds (YouTube, GitHub buttons, analytics) are blocked in `preparePage()`. They are not under test and make runs slow and network-dependent.
- The axe test compares against `tests/a11y-baseline.*.json`. It fails on a rule a page did not have before, or on more critical/serious violations than recorded. After fixing an issue, lower the baseline with `npm run test:update-a11y-baseline` and commit the JSON. Do not regenerate the baseline to make a new violation pass.
- If you change a guarded behavior on purpose, update the matching spec in the same change.

### Build and grep

For copy and data changes, build and grep the output.

```bash
hugo 2>&1 | grep -i "error\|unmarshal\|yaml"   # YAML slips surface here
grep -c "some new string" public/index.html
```

A YAML indentation mistake in `data/homepage.yml` or a page's front matter usually blanks the affected section rather than failing the build, so check that what you added actually rendered, not just that the build passed.

Check external links before adding them. For docs.dapr.io, take URLs from `https://docs.dapr.io/en/sitemap.xml` rather than guessing paths.

```bash
curl -s -o /dev/null -w "%{http_code}\n" -L "<url>"
```

One trap when validating anchors: docs.dapr.io emits **unquoted** id attributes (`<h2 id=retry-policies>`), so `grep 'id="retry-policies"'` finds nothing even when the anchor exists.

For layout changes, measure rather than reason. The CSS notes below explain why.

## CSS gotchas

There is **no global `box-sizing: border-box`** in this theme. It is set on three things only: `.border-decoration`, `.width-half-gap`, and the cookie banner. Everything else is `content-box`, so an element with padding measures wider than its declared `width`. `.feature-card` has `padding: 1.2rem`, which is why a card given `width: 50%` will not fit two per row.

Class names do not match their values. `.width-20` is `width: 25%`, defined in `themes/bigspring/assets/scss/_custom.scss`.

Flex gaps count toward the row. Card rows use `gap-md`, which is `20px`. Four cards at `.width-20` (25%) plus three 20px gaps overflow the row and wrap to three per row, not four. To fit exactly N per row, subtract the gap share and set `box-sizing: border-box`, as `.width-half-gap` does for two per row.

Inline highlight spans in the hero (`.highlight-golden`, `.highlight-hippie-blue`) paint the font's full em box, roughly 1.36em in Noto Sans. If a heading's `line-height` drops below that, a highlight on one line covers the descenders of the line above.

## Known pre-existing issues

Do not treat these as regressions caused by your change, and do not fix them as a side effect of unrelated work.

The mobile navbar overflows horizontally at narrow widths. At a 390px viewport the page reports a 421px scroll width. This also ships on production dapr.io.

`themes/bigspring/layouts/partials/home/apis.html` has an unclosed `<section>` tag (three opened, two closed). Browsers tolerate it.

The two Azure Static Web Apps workflows in `.github/workflows/` trigger on a `main` branch. The default branch here is `master` and no `main` branch exists, so they do not run. Netlify is the live deployment.

## Event dates and builds

The `/events` listing and each event page decide between upcoming and past from the build date (`layouts/partials/events/is-past.html`). Netlify builds only when changes merge to `master`, and there is no scheduled rebuild. An event that has ended therefore stays under "Upcoming events", with its registration form or link, until the next merge. After an event, merge any change to refresh these pages; adding the event's `recordings` playlist is the natural one.

## Git

**Do not run state-changing git commands without being asked in the current conversation.** No `git add`, `git commit`, `git push`, `git reset`, or `git checkout <file>`. Read-only commands such as `git status`, `git diff`, and `git log` are fine. Make the edits, verify them, report, and let the maintainer decide when to commit.

The default branch is `master`. Netlify rebuilds automatically when changes merge there.

`docs/superpowers/` is gitignored and holds local planning notes. Nothing in it ships.
