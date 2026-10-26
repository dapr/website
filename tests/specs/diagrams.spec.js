// The homepage's 2D diagrams (assets/js/diagrams.js) draw what they
// should: checked on each scene's still frame, the one shown under
// prefers-reduced-motion and saved as its static fallback.
import { test, expect } from '@playwright/test';
import { preparePage } from './helpers.js';

// Labels each scene's still frame must show. Keep in step with the scenes.
const SCENES = {
  automate: ['Pub/Sub', 'Workflow/ Start', 'Activity 1', 'Secrets API', 'External System', 'Wait for event',
    'Service', 'Activity 2', 'Activity 3', 'Key/Value', 'Workflow/ Complete'],
  secure: ['Secure Service', 'Communication', 'Resiliency', 'Message Broker', 'App'],
  integrate: ['Azure Service Bus', 'Azure Key Vault', 'Azure Cosmos DB', 'Microsoft Azure', 'App'],
  adopt: ['Apache Kafka', 'RabbitMQ', 'App'],
  apis: ['Use any language or runtime', 'My app', 'HTTP / gRPC API', 'Workflow', 'Conversation',
    'Binary Store', 'Search', 'Vector', 'alpha', 'Observability', 'Security', 'Resiliency', 'Host on & integrate',
    'Azure', 'Kubernetes', 'Services'],
};

test.describe('value-prop diagrams', () => {
  let errors;
  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await preparePage(page);
    await page.goto('/');
  });

  test('every scene in the page is covered by this spec', async ({ page }) => {
    const scenes = await page.locator('svg[data-scene]').evaluateAll((els) => els.map((e) => e.dataset.scene));
    expect(scenes.sort()).toEqual(Object.keys(SCENES).sort());
  });

  test('a diagram shown as a still draws its complete frame once, with no pause control', async ({ page }) => {
    // Mark the first diagram as a still the way the template does for
    // diagramstatic: true, before its script runs, so this works whichever
    // scenes the data currently shows as stills.
    await page.route('**/', async (route) => {
      const res = await route.fetch();
      let html = await res.text();
      html = html.replace(/(<div class="diagram-frame value-prop-diagram-frame">\s*<svg class="value-prop-diagram" data-scene="[^"]+")/, '$1 data-static');
      html = html.replace(/(data-static[\s\S]*?<\/svg>)\s*<button type="button" class="diagram-toggle"[\s\S]*?<\/button>/, '$1');
      await route.fulfill({ response: res, body: html });
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install();
    await page.goto('/');

    const frame = page.locator('.value-prop-diagram-frame').first();
    const svg = frame.locator('.value-prop-diagram');
    await expect(svg).toHaveAttribute('data-static', '');
    await expect(frame.locator('.diagram-toggle')).toHaveCount(0);
    await svg.scrollIntoViewIfNeeded();

    const scene = await svg.getAttribute('data-scene');
    const drawn = () => svg.evaluate((s) => [...s.querySelectorAll('[opacity], [transform]')]
      .map((e) => `${e.getAttribute('opacity')}|${e.getAttribute('transform')}`).join());
    const before = await drawn();
    await page.clock.runFor(3000);
    expect(await drawn()).toBe(before);
    // and it is the complete frame: its labels are drawn
    const text = await svg.locator(':scope > g').textContent();
    for (const label of SCENES[scene]) expect(text).toContain(label);
    expect(errors).toEqual([]);
  });

  for (const [scene, labels] of Object.entries(SCENES)) {
    test.describe(scene, () => {
      const svg = (page) => page.locator(`svg[data-scene="${scene}"]`);

      test('has a title and a description', async ({ page }) => {
        await expect(svg(page).locator('title')).not.toHaveText('');
        await expect(svg(page).locator('desc')).not.toHaveText('');
      });

      test('draws its labels without script errors', async ({ page }) => {
        await svg(page).scrollIntoViewIfNeeded();
        // text the scene drew and left visible (effective opacity above 0.5)
        const shown = await svg(page).evaluate((s) => [...s.querySelectorAll(':scope > g text')]
          .filter((t) => {
            let o = 1;
            for (let n = t; n && n !== s; n = n.parentNode) o *= +(n.getAttribute('opacity') ?? 1);
            return o > 0.5;
          })
          .map((t) => t.textContent));
        for (const label of labels) expect(shown.some((t) => t.includes(label)), `"${label}" is drawn`).toBe(true);
        expect(errors).toEqual([]);
      });

      test('uses only symbols that exist on the page', async ({ page }) => {
        const missing = await svg(page).evaluate((s) => [...s.querySelectorAll('use')]
          .map((u) => u.getAttribute('href'))
          .filter((h) => !document.querySelector(`symbol${h}`)));
        expect(missing).toEqual([]);
      });

      test('keeps everything visible inside its frame', async ({ page }) => {
        await svg(page).scrollIntoViewIfNeeded();
        const outside = await svg(page).evaluate((s) => {
          const box = s.getBoundingClientRect();
          return [...s.querySelectorAll(':scope > g *')]
            .filter((e) => {
              let o = 1;
              for (let n = e; n && n !== s; n = n.parentNode) o *= +(n.getAttribute('opacity') ?? 1);
              if (o < 0.05 || !e.getBBox) return false;
              const r = e.getBoundingClientRect();
              return r.width && (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1);
            })
            .map((e) => e.tagName + (e.textContent ? ` "${e.textContent}"` : ''));
        });
        expect(outside).toEqual([]);
      });

      test('has a static fallback image', async ({ page }) => {
        const res = await page.request.get(`/images/diagrams/${scene}.svg`);
        expect(res.ok()).toBe(true);
        expect(res.headers()['content-type']).toContain('image/svg+xml');
        expect(await res.text()).toContain('<svg');
      });
    });
  }
});
