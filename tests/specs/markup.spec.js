// Static checks on the built HTML. No browser needed; these catch markup that
// was copied back in from older templates.
import { test, expect } from '@playwright/test';
import { builtFiles } from './helpers.js';

const htmlFiles = builtFiles('index.html').map(({ url, text }) => ({ name: url.slice(1), html: text }));

test('the build produced pages to check', () => {
  expect(htmlFiles.length).toBeGreaterThan(5);
});

for (const { name, html } of htmlFiles) {
  test.describe(name, () => {
    test('has no <button> nested inside a link', () => {
      // Invalid HTML and a double tab stop. Style the link with class="btn ..." instead.
      expect(html).not.toMatch(/<a\b[^>]*>\s*<button\b/);
    });

    test('does not use role="menu"', () => {
      // role="menu" promises arrow-key menu behavior the site does not implement.
      expect(html).not.toContain('role="menu"');
    });

    test('has no auto-rotating aria-live region', () => {
      expect(html).not.toMatch(/class="banner-carousel"[^>]*aria-live/);
    });

    test('every autoplaying video has a labeled pause control', () => {
      const videos = html.match(/<video\b[^>]*\bautoplay\b/g) || [];
      const toggles = html.match(/<button\b[^>]*class="video-toggle"[^>]*aria-label="Pause animation: [^"]+"/g) || [];
      expect(toggles.length).toBe(videos.length);
    });

    test('a multi-slide banner carousel has a pause control', () => {
      if (!html.includes('class="banner-carousel"')) return;
      expect(html).toMatch(/<button\b[^>]*class="carousel-toggle"[^>]*aria-label="Pause announcements"/);
    });

    test('every animated diagram has a labeled pause control', () => {
      // a still value-prop diagram (data-static) has no pause control
      const diagrams = (html.match(/<svg\b[^>]*class="(hero-diagram-svg|value-prop-diagram)"[^>]*>/g) || [])
        .filter((tag) => !/\bdata-static\b/.test(tag)).length;
      const toggles = html.match(/<button\b[^>]*class="diagram-toggle"[^>]*aria-label="Pause animation: [^"]+"/g) || [];
      expect(toggles.length).toBe(diagrams);
    });

    test('dropdown menus are opened by a real button', () => {
      const dropdowns = html.match(/class="dropdown navbar-item/g) || [];
      const toggles = html.match(/<button type="button" class="navLink navbar-dropdown-toggle" aria-expanded="false" aria-controls="[^"]+"/g) || [];
      expect(toggles.length).toBe(dropdowns.length);
    });
  });
}
