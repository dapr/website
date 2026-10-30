// Regenerates the Open Graph / Twitter card from the homepage hero, so the image
// people see when a dapr.io link is shared matches what the page actually says.
// Run after changing the hero H1 or the hero diagram:
//   npm run export:og-card
//
//   hero H1 (partials/home/hero.html) + assets/images/dapr_hero_diagram.svg
//     -> static/images/dapr-og-default.png   (1200x630, the og_image_default param)
//
// The headline is read out of hero.html rather than repeated here, so the card
// cannot drift from the page. The diagram is the generated still fallback, so run
// export:diagram-fallbacks first if the diagram itself changed.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const WIDTH = 1200;
const HEIGHT = 630;
const repoRoot = resolve(import.meta.dirname, '..');
const out = 'static/images/dapr-og-default.png';

const read = (p) => readFileSync(resolve(repoRoot, p), 'utf8');
const dataUri = (p) => `data:image/svg+xml;base64,${Buffer.from(read(p), 'utf8').toString('base64')}`;

// The hero H1 is a literal in the partial. Take its inner markup whole, highlight
// spans included, so the card keeps the same words and the same highlighted terms.
const hero = read('themes/bigspring/layouts/partials/home/hero.html');
const headline = hero.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.trim();
if (!headline) throw new Error('no <h1> found in partials/home/hero.html');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  /* Colors are the site's: $primary-color and $highlight-color2 from
     assets/scss/_variables.scss, .highlight-hippie-blue and .bg-grey-white
     from _custom.scss. */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    font-family: "Noto Sans", Arial, Helvetica, sans-serif;
    background: #fcfcfc;
    overflow: hidden;
  }
  .card {
    position: relative;
    width: ${WIDTH}px; height: ${HEIGHT}px;
    border-bottom: 10px solid #0D2192;
  }
  .logo { position: absolute; left: 56px; top: 54px; width: 158px; }
  /* Same place and size as on the card this replaced: the lockup's ink measures
     273x44 at top 64, right 55. The svg carries about 9% padding, so the box is
     larger than the ink and offset to compensate. */
  .cncf { position: absolute; right: 50px; top: 59px; height: 54px; }
  /* The svg carries its own margin, so the box runs past the card edges while the
     drawing itself stays clear of everything around it. The width is what sets the
     gap to the headline, and the hex grid's left edge slopes further left as it goes
     down, so the second line of the H1 is the tightest point, not the first. At 590
     the measured gaps are 28px from "execution" and 13px from "workflows". Growing
     this much past 590 puts the grid under the headline. */
  .diagram { position: absolute; right: -6px; top: 105px; width: 590px; }
  h1 {
    position: absolute; left: 56px; top: 232px; width: 610px;
    color: #0D2192;
    font-size: 52px;
    font-weight: 700;
    /* A highlight span paints the font's full em box, about 1.36em in Noto Sans.
       Keep the line-height above that or a highlight covers the line above it. */
    line-height: 1.42;
    letter-spacing: -0.01em;
  }
  h1 span { padding: 0 10px; border-radius: 5px; color: #fff; }
  .highlight-hippie-blue { background: #489fb5; }
  .highlight-golden { background: #efca08; }
  .domain {
    position: absolute; left: 56px; bottom: 44px;
    color: #0D2192; font-size: 40px; font-weight: 700;
  }
</style>
</head>
<body>
  <div class="card">
    <img class="logo" src="${dataUri('static/images/dapr.svg')}" alt="">
    <img class="cncf" src="${dataUri('static/images/cncf-color.svg')}" alt="">
    <img class="diagram" src="${dataUri('assets/images/dapr_hero_diagram.svg')}" alt="">
    <h1>${headline}</h1>
    <span class="domain">dapr.io</span>
  </div>
</body>
</html>`;

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Without the webfont the card still renders, in Arial, and looks subtly wrong.
  // Fail instead, so a committed card is never the fallback font.
  const hasFont = await page.evaluate(() => document.fonts.check('700 45px "Noto Sans"'));
  if (!hasFont) throw new Error('Noto Sans did not load from Google Fonts; card not written');
  writeFileSync(resolve(repoRoot, out), await page.screenshot({ type: 'png' }));
  console.log(`${out}  ${WIDTH}x${HEIGHT}`);
} finally {
  await browser.close();
}
