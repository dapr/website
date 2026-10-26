// The homepage value-prop diagrams (assets/js/value-props.js) draw what they
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
    const scenes = await page.locator('.value-prop-diagram').evaluateAll((els) => els.map((e) => e.dataset.scene));
    expect(scenes.sort()).toEqual(Object.keys(SCENES).sort());
  });

  for (const [scene, labels] of Object.entries(SCENES)) {
    test.describe(scene, () => {
      const svg = (page) => page.locator(`.value-prop-diagram[data-scene="${scene}"]`);

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
        const res = await page.request.get(`/images/value-props/${scene}.svg`);
        expect(res.ok()).toBe(true);
        expect(res.headers()['content-type']).toContain('image/svg+xml');
        expect(await res.text()).toContain('<svg');
      });
    });
  }
});
