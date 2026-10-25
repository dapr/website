// axe-core scan of every page against a recorded baseline of known issues.
// Fails on a rule a page did not have before, or on more violations of a
// critical/serious rule than recorded. Fixing issues never fails the run; after
// a fix, lower the baseline with `npm run test:update-a11y-baseline`.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PAGES, preparePage } from './helpers.js';

const UPDATE = !!process.env.UPDATE_A11Y_BASELINE;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const VIEWPORTS = {
  desktop: { viewport: { width: 1366, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};

for (const [name, options] of Object.entries(VIEWPORTS)) {
  test.describe(name, () => {
    test.use(options);
    // one test scans every page, so it gets a larger budget (setup included)
    test.describe.configure({ timeout: 180_000 });

    test(`no new accessibility violations (${name})`, async ({ page }) => {
      const baselineFile = resolve(import.meta.dirname, '..', `a11y-baseline.${name}.json`);
      const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : {};
      const observed = {};

      // Hold the carousel still: mid-fade, Slick briefly leaves a link focusable
      // inside an aria-hidden slide, which makes the scan timing-dependent.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await preparePage(page);
      for (const path of PAGES) {
        // not 'networkidle': YouTube embeds keep the network busy indefinitely
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        // YouTube embeds are third-party markup we cannot fix, and YouTube
        // changes it without notice, so scan only our own document.
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude('iframe').analyze();

        observed[path] = Object.fromEntries(
          violations.map((v) => [v.id, { impact: v.impact, count: v.nodes.length }]),
        );
        if (UPDATE) continue;

        const known = baseline[path] || {};
        for (const v of violations) {
          const where = v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ');
          expect.soft(known[v.id], `${path}: new "${v.id}" violation (${v.help}) at ${where}`).toBeDefined();
          if (known[v.id] && (v.impact === 'critical' || v.impact === 'serious')) {
            expect
              .soft(v.nodes.length, `${path}: more "${v.id}" violations than the baseline (${v.help}) at ${where}`)
              .toBeLessThanOrEqual(known[v.id].count);
          }
        }
      }

      if (UPDATE) writeFileSync(baselineFile, JSON.stringify(observed, null, 2) + '\n');
    });
  });
}
