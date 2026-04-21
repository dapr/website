# Banner Carousel Stacking Context Fix

**Date:** 2026-04-21
**Scope:** Homepage banner carousel only
**File touched:** `themes/bigspring/assets/scss/_custom.scss`

## Problem

On the homepage, hovering the "News & Media" menu opens its dropdown below the navbar. The dropdown items (Blog, Case studies, Logos, Videos, etc.) render *behind* the banner carousel text, so the banner's anchor intercepts pointer events and the dropdown items cannot be clicked.

## Root cause

The banner carousel is initialized with Slick's `fade: true` option (`themes/bigspring/assets/js/script.js:41`). In fade mode, Slick applies inline `z-index: 999` to its slides so the active slide paints above the inactive ones during the crossfade.

No ancestor of `.banner-carousel` creates a bounded stacking context:

- `<nav>` has no `position` / `z-index`.
- `.banner-carousel` has `position: relative` with `z-index: auto` (`themes/bigspring/assets/scss/_custom.scss:379`).

Because `z-index: auto` does not establish a stacking context, Slick's inline `z-index: 999` on the slide participates in the **root** stacking context. It beats `.navbar-dropdown`'s `z-index: 20` (`themes/bigspring/assets/scss/templates/_navigation.scss:40`), so the slide paints over the dropdown.

The dropdown is rendered — it is simply covered by the banner slide that sits below it in the document but above it in paint order.

## Fix

Give `.banner-carousel` its own stacking context so Slick's inline `z-index` values stay contained.

Edit the existing `.banner-carousel` rule at `themes/bigspring/assets/scss/_custom.scss:379`:

```scss
.banner-carousel {
    position: relative;
    z-index: 0;          // new — establishes a stacking context
    isolation: isolate;  // new — declarative reinforcement
    max-width: 100%;
    margin: 0 auto;
    line-height: 1.4;
    padding: 0 120px;
}
```

### Why both `z-index: 0` and `isolation: isolate`

Either alone would fix the bug. Using both is deliberate:

- `z-index: 0` on a positioned element is the portable, long-established way to force a new stacking context. It works everywhere.
- `isolation: isolate` states the intent declaratively. A future maintainer who removes `z-index: 0` without understanding its purpose will still have an isolated stacking context. Supported in all evergreen browsers.

## Non-goals

- No change to `<nav>` or `.navbar-dropdown` z-index.
- No change to the Slick carousel config (fade stays).
- No change to banner HTML or `data/homepage.yml` data.

## Verification

Manual only — there are no CSS unit tests in the repo.

1. Run `hugo server` and open the homepage.
2. Hover "News & Media" in the navbar. All dropdown items (Blog, Case studies, Logos, Videos, Presentations, Community calls, Press kit) must be visually on top of the banner and clickable.
3. Wait for the banner to cycle through at least two slides. The dropdown must stay on top across fade transitions — fade is the failure mode.
4. Repeat at ≤768px viewport width. The mobile padding override at `themes/bigspring/assets/scss/_custom.scss:422` must still work (carousel arrows close to the edge).
5. Sanity-check the other home partials visually — no layering regressions on hero, case-study strip, or CNCF footer band.

## Rollback

Revert the two added lines. Low risk — the change is additive and local to one selector.
