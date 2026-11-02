// Regenerates the social profile banners for the Dapr LinkedIn page, X account,
// Bluesky account and Reddit community, so the top of each profile says the same
// thing the homepage does.
//   npm run export:social-banners
//
//   hero H1 (partials/home/hero.html) + assets/images/dapr_hero_diagram.svg
//     -> social/images/<platform>.png
//
// Like export-og-card.js, the headline is read out of hero.html rather than
// repeated here, so a banner cannot drift from the page. The diagram is the
// generated still fallback, so run export:diagram-fallbacks first if the diagram
// itself changed.
//
// Layout system, shared by all four: headline left, "dapr.io" under it, hero
// diagram right. No separate Dapr wordmark; the mark inside the diagram's center
// node is the logo. The bottom left corner is left empty on every size because
// that is where each platform paints the profile avatar over the banner.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const repoRoot = resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(resolve(repoRoot, p), 'utf8');
const dataUri = (p) => `data:image/svg+xml;base64,${Buffer.from(read(p), 'utf8').toString('base64')}`;

// The hero H1 is a literal in the partial. Take its inner markup whole, highlight
// spans included, so the banners keep the same words and the same highlighted terms.
const hero = read('themes/bigspring/layouts/partials/home/hero.html');
const headline = hero.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.trim();
if (!headline) throw new Error('no <h1> found in partials/home/hero.html');

const DIAGRAM = dataUri('assets/images/dapr_hero_diagram.svg');
const DIAGRAM_RATIO = 640 / 515; // the still's viewBox, width over height

// Per platform. The text block sits clear of the avatar the platform paints over
// the lower left, and clear of the diagram on the right; both are asserted after
// each render rather than trusted.
const PRESETS = [
  {
    name: 'x-header',
    platform: 'X',
    width: 1500, height: 500, border: 10,
    h1: { left: 64, top: 130, width: 850, size: 50 },
    domain: { left: 64, top: 298, size: 34 },
    diagram: { right: -10, top: 40, height: 430 },
  },
  {
    name: 'bluesky-banner',
    platform: 'Bluesky',
    width: 1500, height: 500, border: 10,
    h1: { left: 64, top: 130, width: 850, size: 50 },
    domain: { left: 64, top: 298, size: 34 },
    diagram: { right: -10, top: 40, height: 430 },
  },
  {
    // 1536x256 rather than the 1512x256 LinkedIn's help page recommends: measured
    // on a live Page, the cover renders into a box that is exactly 6:1 with
    // `object-fit: cover`, so a 1512-wide image (5.906:1) loses a couple of
    // pixels off the top and bottom. 1536 is exactly 6:1 and still clears
    // LinkedIn's 1512 minimum, so nothing is cropped.
    //
    // The page logo is painted over the cover's lower left. Measured on the same
    // Page, it covers the leftmost 22.8% of the cover and rises 61% of its
    // height, which is 350px at this width; everything starts at 380px to clear
    // it. The crop is centerd, so the diagram keeps a real right margin rather
    // than bleeding off the edge, which would lose it on a narrower crop.
    name: 'linkedin-cover',
    platform: 'LinkedIn',
    width: 1536, height: 256, border: 8,
    h1: { left: 380, top: 40, width: 800, size: 38 },
    domain: { left: 380, top: 162, size: 24 },
    diagram: { right: 24, top: 13, height: 230 },
  },
  {
    name: 'reddit-banner',
    platform: 'Reddit',
    width: 1920, height: 384, border: 8,
    h1: { left: 240, top: 60, width: 1150, size: 46 },
    domain: { left: 240, top: 206, size: 30 },
    diagram: { right: -8, top: 24, height: 330 },
  },
];

// Colors are the site's: $primary-color and $highlight-color2 from
// assets/scss/_variables.scss, .highlight-hippie-blue and .bg-grey-white from
// _custom.scss. Same values the OG card uses.
const page = (p) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${p.width}px; height: ${p.height}px; }
  body {
    font-family: "Noto Sans", Arial, Helvetica, sans-serif;
    background: #fcfcfc;
    overflow: hidden;
  }
  .banner {
    position: relative;
    width: ${p.width}px; height: ${p.height}px;
    border-bottom: ${p.border}px solid #0D2192;
  }
  .diagram {
    position: absolute;
    right: ${p.diagram.right}px; top: ${p.diagram.top}px;
    height: ${p.diagram.height}px; width: ${Math.round(p.diagram.height * DIAGRAM_RATIO)}px;
  }
  h1 {
    position: absolute;
    left: ${p.h1.left}px; top: ${p.h1.top}px; width: ${p.h1.width}px;
    color: #0D2192;
    font-size: ${p.h1.size}px;
    font-weight: 700;
    /* A highlight span paints the font's full em box, about 1.36em in Noto Sans.
       Keep the line-height above that or a highlight covers the line above it. */
    line-height: 1.42;
    letter-spacing: -0.01em;
  }
  /* In em so the chip grows with the headline rather than being set per size. */
  h1 span { padding: 0 0.19em; border-radius: 0.1em; color: #fff; }
  .highlight-hippie-blue { background: #489fb5; }
  .highlight-golden { background: #efca08; }
  .domain {
    position: absolute;
    left: ${p.domain.left}px; top: ${p.domain.top}px;
    color: #0D2192; font-size: ${p.domain.size}px; font-weight: 700;
  }
</style>
</head>
<body>
  <div class="banner">
    <img class="diagram" src="${DIAGRAM}" alt="">
    <h1>${headline}</h1>
    <span class="domain">dapr.io</span>
  </div>
</body>
</html>`;

const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const p of PRESETS) {
    const tab = await browser.newPage({ viewport: { width: p.width, height: p.height } });
    await tab.setContent(page(p), { waitUntil: 'networkidle' });
    await tab.evaluate(() => document.fonts.ready);
    // Without the webfont a banner still renders, in Arial, and looks subtly
    // wrong. Fail instead, so a committed banner is never the fallback font.
    const hasFont = await tab.evaluate(() => document.fonts.check('700 45px "Noto Sans"'));
    if (!hasFont) throw new Error(`Noto Sans did not load from Google Fonts; ${p.name} not written`);
    // The headline is the whole point of the banner; if it spilled out of its
    // box or pushed past the diagram, the banner is wrong and should not ship.
    const fit = await tab.evaluate(() => {
      const h = document.querySelector('h1');
      const d = document.querySelector('.diagram');
      return {
        overflows: h.scrollHeight > h.clientHeight + 1,
        bottom: h.getBoundingClientRect().bottom,
        right: h.getBoundingClientRect().right,
        diagramLeft: d.getBoundingClientRect().left,
      };
    });
    if (fit.overflows) throw new Error(`${p.name}: headline overflows its box`);
    if (fit.bottom > p.height - p.border) throw new Error(`${p.name}: headline runs past the bottom border`);
    if (fit.right > fit.diagramLeft) throw new Error(`${p.name}: headline overlaps the diagram`);
    const out = `social/images/${p.name}.png`;
    writeFileSync(resolve(repoRoot, out), await tab.screenshot({ type: 'png' }));
    console.log(`${out.padEnd(36)} ${p.width}x${p.height}  (${p.platform})`);
    await tab.close();
  }
} finally {
  await browser.close();
}
