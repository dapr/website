// Visual regression guard for page-weight work (fonts, images). Skipped unless
// VISUAL=1, so the normal suite and CI are unaffected.
//   VISUAL=1 npx playwright test visual --update-snapshots   record baseline
//   VISUAL=1 npx playwright test visual                      compare
// Snapshots live in tests/.visual/ (gitignored).
import { test, expect } from '@playwright/test';
import { preparePage } from './helpers.js';

test.skip(!process.env.VISUAL, 'set VISUAL=1 to run the visual comparison');

const PAGES = ['/', '/community/', '/events/'];
const VIEWPORTS = [
  { name: 'desktop', width: 1366, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

test.use({ reducedMotion: 'reduce' });
test.describe.configure({ mode: 'parallel' });

for (const vp of VIEWPORTS) {
  for (const path of PAGES) {
    test(`${path} at ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await preparePage(page);
      await page.goto(path, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      // Scroll through the page so lazy content loads, then return to the top.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      // Videos: frame 0, paused.
      await page.evaluate(async () => {
        await Promise.all([...document.querySelectorAll('video')].map((v) => new Promise((res) => {
          const freeze = () => { v.pause(); v.currentTime = 0; v.addEventListener('seeked', res, { once: true }); setTimeout(res, 1500); };
          if (v.readyState >= 2) freeze();
          else { v.addEventListener('loadeddata', freeze, { once: true }); v.load(); setTimeout(res, 3000); }
        })));
        document.querySelectorAll('video').forEach((v) => { v.pause(); v.currentTime = 0; });
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      const name = `${path.replace(/\//g, '_') || '_'}-${vp.name}.png`;
      await expect(page).toHaveScreenshot(name, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.001,
      });
    });
  }
}
