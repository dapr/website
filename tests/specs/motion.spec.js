// Auto-moving content must be pausable (WCAG 2.2.2) and must respect
// prefers-reduced-motion.
import { test, expect } from '@playwright/test';
import { preparePage } from './helpers.js';

const currentSlide = (page) =>
  page.locator('.banner-carousel .slick-current').getAttribute('data-slick-index');

// Every slide index seen while advancing the fake clock in 1s steps. Comparing
// only start and end is not enough: with 4 slides, rotation can wrap around
// and land back on the slide it started from.
async function slidesSeenOver(page, ms) {
  const seen = new Set([await currentSlide(page)]);
  for (let t = 0; t < ms; t += 1000) {
    await page.clock.runFor(1000);
    seen.add(await currentSlide(page));
  }
  return seen;
}

test.describe('announcement carousel', () => {
  test.beforeEach(async ({ page }) => {
    // Fake timers, so the 6s autoplay interval runs instantly and deterministically.
    await page.clock.install();
    await preparePage(page);
    await page.goto('/');
    await expect(page.locator('.banner-carousel.slick-initialized')).toBeVisible();
    // pause the hero diagram: under the fake clock it draws a frame every 16ms of
    // the ~30s these tests skip through, which is slow enough to time out
    await page.locator('.diagram-toggle').click();
    // keep the mouse off the banner: hovering pauses Slick on its own
    await page.mouse.move(5, 800);
  });

  test('rotates on its own', async ({ page }) => {
    expect((await slidesSeenOver(page, 7000)).size).toBeGreaterThan(1);
  });

  test('pause stops rotation and play resumes it', async ({ page }) => {
    const toggle = page.locator('.carousel-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-label', 'Pause announcements');

    await toggle.click();
    await page.mouse.move(5, 800);
    await expect(toggle).toHaveAttribute('aria-label', 'Play announcements');
    expect((await slidesSeenOver(page, 20_000)).size).toBe(1);

    await toggle.click();
    await page.mouse.move(5, 800);
    await expect(toggle).toHaveAttribute('aria-label', 'Pause announcements');
    expect((await slidesSeenOver(page, 7000)).size).toBeGreaterThan(1);
  });

  test('is not an aria-live region', async ({ page }) => {
    await expect(page.locator('.banner-carousel')).not.toHaveAttribute('aria-live', /.*/);
  });
});

test.describe('value-prop videos', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
  });

  test('autoplay, and each toggle pauses and resumes its video', async ({ page }) => {
    const frames = page.locator('.value-prop-video-frame');
    const count = await frames.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const frame = frames.nth(i);
      const video = frame.locator('video');
      const toggle = frame.locator('.video-toggle');
      const isPaused = () => video.evaluate((v) => v.paused);

      await frame.scrollIntoViewIfNeeded();
      await expect.poll(isPaused).toBe(false);
      await expect(toggle).toHaveAttribute('aria-label', /^Pause animation: .+/);

      await toggle.click();
      await expect.poll(isPaused).toBe(true);
      await expect(toggle).toHaveAttribute('aria-label', /^Play animation: .+/);

      await toggle.click();
      await expect.poll(isPaused).toBe(false);
      await expect(toggle).toHaveAttribute('aria-label', /^Pause animation: .+/);
    }
  });

  test('the toggle reports "Play" when the video is paused some other way', async ({ page }) => {
    // e.g. the browser blocking autoplay: the label must follow the real state
    const frame = page.locator('.value-prop-video-frame').first();
    await frame.scrollIntoViewIfNeeded();
    await frame.locator('video').evaluate((v) => v.pause());
    await expect(frame.locator('.video-toggle')).toHaveAttribute('aria-label', /^Play animation: .+/);
  });
});

// Positions of the diagram's pulses; any change means the animation advanced.
const diagramFrame = (page) =>
  page.locator('.hero-diagram-svg circle').evaluateAll((cs) => cs.map((c) => c.getAttribute('cx')).join());

test.describe('hero diagram', () => {
  test.beforeEach(async ({ page }) => {
    // Fake clock: d3-timer runs on requestAnimationFrame and performance.now.
    await page.clock.install();
    await preparePage(page);
    await page.goto('/');
    await expect(page.locator('.diagram-toggle')).toBeVisible();
  });

  test('replaces the static fallback once it draws', async ({ page }) => {
    await expect(page.locator('.hero-diagram-fallback')).toHaveCount(0);
  });

  test('animates on its own', async ({ page }) => {
    const before = await diagramFrame(page);
    await page.clock.runFor(500);
    expect(await diagramFrame(page)).not.toBe(before);
  });

  test('pause stops the animation and play resumes it', async ({ page }) => {
    const toggle = page.locator('.diagram-toggle');
    await expect(toggle).toHaveAttribute('aria-label', /^Pause animation: .+/);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', /^Play animation: .+/);
    const paused = await diagramFrame(page);
    await page.clock.runFor(2000);
    expect(await diagramFrame(page)).toBe(paused);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', /^Pause animation: .+/);
    await page.clock.runFor(500);
    expect(await diagramFrame(page)).not.toBe(paused);
  });
});

test.describe('hero diagram without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the static fallback and no pause control', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
    const fallback = page.locator('.hero-diagram-fallback');
    await expect(fallback).toBeAttached();
    const src = await fallback.getAttribute('href');
    expect((await page.request.get(src)).ok()).toBe(true);
    await expect(page.locator('.diagram-toggle')).toBeHidden();
  });
});

test.describe('with prefers-reduced-motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await preparePage(page);
    await page.goto('/');
  });

  test('the carousel starts paused', async ({ page }) => {
    await expect(page.locator('.carousel-toggle')).toHaveAttribute('aria-label', 'Play announcements');
  });

  test('the hero diagram shows a still frame and starts paused', async ({ page }) => {
    const toggle = page.locator('.diagram-toggle');
    await expect(toggle).toHaveAttribute('aria-label', /^Play animation: .+/);
    const still = await diagramFrame(page);
    expect(still).not.toBe('');
    await page.waitForTimeout(500);
    expect(await diagramFrame(page)).toBe(still);
  });

  test('the videos start paused', async ({ page }) => {
    const videos = page.locator('.value-prop-video-frame video');
    for (let i = 0; i < (await videos.count()); i++) {
      await videos.nth(i).scrollIntoViewIfNeeded();
      expect(await videos.nth(i).evaluate((v) => v.paused)).toBe(true);
    }
    const labels = await page.locator('.video-toggle').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    for (const label of labels) expect(label).toMatch(/^Play animation: .+/);
  });
});
