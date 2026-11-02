# Social profile banners and copy

Banner images and profile copy for the Dapr accounts on LinkedIn, X, Bluesky and
Reddit, so the top of each profile says what the homepage says.

Nothing here ships with the site. The folder sits outside `content/` and
`static/`, so Hugo does not publish it; it is the source of truth for whoever
updates the profiles by hand.

| Platform | Copy | Banner | Size |
| --- | --- | --- | --- |
| LinkedIn | [linkedin.md](linkedin.md) | `images/linkedin-cover.png` | 1536x256 |
| X | [x.md](x.md) | `images/x-header.png` | 1500x500 |
| Bluesky | [bluesky.md](bluesky.md) | `images/bluesky-banner.png` | 1500x500 |
| Reddit | [reddit.md](reddit.md) | `images/reddit-banner.png` | 1920x384 |

The avatar stays the Dapr logo on all four. Only the banners and the text
change.

## The design

All four carry the homepage hero: the H1, with the same highlighted terms, the
hero diagram still, and the site's colors. None of them carry a separate Dapr
wordmark; the mark inside the diagram's center node is the logo, and a second
one competed with the headline for the same corner.

Every banner leaves its lower left corner empty, because that is where each
platform paints the profile avatar over the artwork. On LinkedIn that shadow is
large: measured on the live Page, the logo covers the leftmost 22.8% of the
cover and rises 61% of its height, which is why the LinkedIn artwork starts
much further right than the rest.

LinkedIn's cover is 1536x256 rather than the 1512x256 its help page recommends.
The cover renders into a box that is exactly 6:1 with `object-fit: cover`, and
1536x256 is exactly 6:1, so nothing is cropped. See [linkedin.md](linkedin.md).

## Regenerating

```bash
cd tests && npm install && npm run export:social-banners
```

`tests/export-social-banners.js` reads the H1 straight out of
`themes/bigspring/layouts/partials/home/hero.html`, so a banner cannot drift
from the page. It fails rather than writes if Noto Sans did not load, if a
headline overflows its box, or if one overlaps the diagram.

Rerun it after changing the hero H1. If the diagram itself changed, run
`npm run export:diagram-fallbacks` first, since the banners use the generated
still.

## Character limits

Each file states the limit for the field and the length of the copy. The
limits are enforced when the copy is written, so these are measured, not
estimated.

| Field | Limit |
| --- | --- |
| X bio | 160 |
| Bluesky description | 256 |
| LinkedIn tagline | 120 |
| LinkedIn about | 2000 |
| Reddit public description | 500 |
