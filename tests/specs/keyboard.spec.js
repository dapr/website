import { test, expect } from '@playwright/test';
import { preparePage, tabTo } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
});

test.describe('visible keyboard focus', () => {
  for (const [label, selector] of [
    ['nav link', 'nav a.navLink'],
    ['dropdown toggle', '.navbar-dropdown-toggle'],
    ['hero CTA', '.btn-container a.btn'],
    ['carousel toggle', '.carousel-toggle'],
    ['video toggle', '.video-toggle'],
    ['hero diagram toggle', '.diagram-toggle'],
  ]) {
    test(`${label} shows a focus ring`, async ({ page }) => {
      await tabTo(page, selector);
      const focused = page.locator(`${selector}:focus`);
      // links and buttons transition for 0.2s, so let the outline settle
      await expect(focused).toHaveCSS('outline-style', 'solid');
      await expect(focused).toHaveCSS('outline-width', '2px');
    });
  }

  test('clicking with the mouse does not show a focus ring', async ({ page }) => {
    const cta = page.locator('.btn-container a.btn').first();
    await cta.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await cta.click();
    await expect(cta).toBeFocused();
    await expect(cta).toHaveCSS('outline-style', 'none');
  });
});

test.describe('desktop nav dropdown', () => {
  const toggle = (page) => page.locator('.navbar-dropdown-toggle').first();
  const menu = (page) => page.locator('.navbar-dropdown').first();

  test('is closed until opened', async ({ page }) => {
    await tabTo(page, '.navbar-dropdown-toggle');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page)).toBeHidden();
  });

  test('Enter opens it and Tab moves into its links', async ({ page }) => {
    await tabTo(page, '.navbar-dropdown-toggle');
    await page.keyboard.press('Enter');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(menu(page).locator('a').first()).toBeFocused();
  });

  test('Space toggles it', async ({ page }) => {
    await tabTo(page, '.navbar-dropdown-toggle');
    await page.keyboard.press('Space');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape closes it and returns focus to the toggle', async ({ page }) => {
    await tabTo(page, '.navbar-dropdown-toggle');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page)).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });

  test('tabbing out of it closes it', async ({ page }) => {
    await tabTo(page, '.navbar-dropdown-toggle');
    await page.keyboard.press('Enter');
    const linkCount = await menu(page).locator('a').count();
    for (let i = 0; i <= linkCount; i++) await page.keyboard.press('Tab');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page)).toBeHidden();
  });

  test('Tab skips its links while closed', async ({ page }) => {
    await tabTo(page, '.navbar-dropdown-toggle');
    await page.keyboard.press('Tab');
    await expect(menu(page).locator('a:focus')).toHaveCount(0);
  });
});

test.describe('mobile nav dropdown', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('the submenu is always expanded and says so', async ({ page }) => {
    await page.locator('#mobile-menu').click();
    const toggle = page.locator('.navbar-dropdown-toggle').first();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.navbar-dropdown').first()).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
