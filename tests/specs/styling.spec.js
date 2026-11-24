// Styling rules that are easy to regress and invisible in the markup: how body
// copy is set, how links are underlined, how wide a button is, and later the
// typeface and the design tokens. Everything here is measured in a real browser
// rather than asserted against the SCSS source.
import { test, expect } from '@playwright/test';
import { preparePage } from './helpers.js';

test('body copy in a card is not justified', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await expect(page.locator('.feature-card p').first()).toHaveCSS('text-align', 'left');
});

test('links are underlined solid, not dashed', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  // A prose link, not a .btn: those set text-decoration: none.
  await expect(page.locator('.feature-card p a').first()).toHaveCSS('text-decoration-style', 'solid');
});

test('a button is as wide as its label, not a fixed 120px box', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const wide = await page.locator('.btn-md', { hasText: 'Durable Workflows' }).first().boundingBox();
  const narrow = await page.locator('.btn-md', { hasText: 'Get Started' }).first().boundingBox();
  expect(wide.width).toBeGreaterThan(narrow.width);
  // A 120px box forces "Durable Workflows" onto two lines, which makes it tall.
  expect(wide.height).toBeLessThan(70);
});

// Review Focus 5: three hero buttons that grow to fit their labels must still
// share a row at desktop width.
test('the three hero buttons sit on one row at desktop width', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const tops = await page.locator('.btn-container .btn-md').evaluateAll(
    (els) => els.map((e) => Math.round(e.getBoundingClientRect().top)),
  );
  expect(tops).toHaveLength(3);
  expect(new Set(tops).size).toBe(1);
});

test('running prose is capped at a readable measure', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const box = await page.locator('.value-prop-text > p').first().boundingBox();
  // ~68ch at the body size. The container is 80% of 1366px without the cap.
  expect(box.width).toBeLessThan(820);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('card copy is not justified on a phone either', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
    await expect(page.locator('.feature-card p').first()).toHaveCSS('text-align', 'left');
  });

  // Review Focus 5 on a phone. Scoped to the button container rather than the
  // whole page: .navbar already overflows by 31px on master, because it sets
  // width:90% and padding:20px 9% under content-box. That is a real bug but it
  // predates this change and is not what these buttons can affect.
  test('the hero buttons stay inside the viewport', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
    const rights = await page.locator('.btn-container .btn-md').evaluateAll(
      (els) => els.map((e) => Math.ceil(e.getBoundingClientRect().right)),
    );
    expect(rights).toHaveLength(3);
    for (const right of rights) expect(right).toBeLessThanOrEqual(390);
  });
});
