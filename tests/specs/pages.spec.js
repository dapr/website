// Titles and meta descriptions, read from the static build.
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DIR, preparePage } from './helpers.js';

const HOME_TITLE = 'Dapr: Durable Execution for Workflows and AI Agents';
const ENTERPRISE_DESCRIPTION =
  'Commercial support, managed services, and enterprise distributions for running Dapr in production, from vendors in the Dapr ecosystem.';

const read = (rel) => readFileSync(join(SITE_DIR, rel, 'index.html'), 'utf8');
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (html, attr, name) => {
  const tags = [...html.matchAll(/<meta\s[^>]*>/g)].map((m) => m[0]);
  return tags
    .filter((t) => new RegExp(`${attr}=["']?${name}["' >]`).test(t))
    .map((t) => decode((t.match(/content="([^"]*)"/) || [])[1] ?? ''));
};

test('homepage title', () => {
  const html = read('/');
  expect(decode(html.match(/<title>([^<]*)<\/title>/)[1])).toBe(HOME_TITLE);
  expect(meta(html, 'property', 'og:title')).toEqual([HOME_TITLE]);
  expect(meta(html, 'name', 'twitter:title')).toEqual([HOME_TITLE]);
});

test('subpage titles unchanged', () => {
  expect(decode(read('/workflow/').match(/<title>([^<]*)<\/title>/)[1])).toBe(
    'Durable Workflows for Distributed Applications | Dapr',
  );
});

test('enterprise description', () => {
  const d = meta(read('/enterprise/'), 'name', 'description');
  expect(d).toEqual([ENTERPRISE_DESCRIPTION]);
  expect(d[0].length).toBeLessThanOrEqual(160);
});

test('meta descriptions are 50 to 160 characters', () => {
  const sitemap = readFileSync(join(SITE_DIR, 'sitemap.xml'), 'utf8');
  const bad = [];
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const rel = new URL(m[1]).pathname;
    const d = meta(read(rel), 'name', 'description')[0] ?? '';
    if (d.length < 50 || d.length > 160) bad.push(`${rel}: ${d.length}`);
  }
  expect(bad).toEqual([]);
});

// Answer-first intros: one plain sentence under each subpage's H1 that defines
// the page's subject. The homepage keeps its hero paragraph instead.
const subpages = () => {
  const sitemap = readFileSync(join(SITE_DIR, 'sitemap.xml'), 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .filter((rel) => rel !== '/' && !/404/.test(rel));
};
// The intro of a built page: the p.page-intro that directly follows the h1,
// with tags stripped and whitespace collapsed. '' when there is none.
const intro = (html) => {
  const m = html.match(/<\/h1>\s*<p class="page-intro">([\s\S]*?)<\/p>/);
  return m ? decode(m[1].replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim() : '';
};

test('every subpage has an intro', () => {
  const missing = subpages().filter((rel) => intro(read(rel)) === '');
  expect(missing).toEqual([]);
});

test('intros are single sentences', () => {
  const bad = [];
  for (const rel of subpages()) {
    const text = intro(read(rel));
    const enders = text.match(/[.!?](\s|$)/g) ?? [];
    if (enders.length !== 1 || !text.endsWith('.')) bad.push(`${rel}: ${enders.length} sentence endings: "${text}"`);
    if (text.length > 200) bad.push(`${rel}: ${text.length} characters`);
    if (/[–—]/.test(text)) bad.push(`${rel}: contains an en or em dash`);
  }
  expect(bad).toEqual([]);
});

test('intro appears in the markdown', () => {
  const bad = [];
  for (const rel of subpages()) {
    const text = intro(read(rel));
    const md = readFileSync(join(SITE_DIR, rel, 'index.md'), 'utf8');
    // The H1 line, a blank line, then the first paragraph.
    const first = (md.split(/\n\s*\n/)[1] ?? '').replace(/\s+/g, ' ').trim();
    if (!text || first !== text) bad.push(`${rel}: expected "${text}", got "${first}"`);
  }
  expect(bad).toEqual([]);
});

test('no page shows its intro twice', () => {
  const bad = [];
  for (const rel of subpages()) {
    const html = read(rel);
    const text = intro(html);
    if (!text) continue;
    const count = decode(html.replace(/<script[\s\S]*?<\/script>/g, '')).split(text).length - 1;
    if (count !== 1) bad.push(`${rel}: ${count} copies`);
  }
  expect(bad).toEqual([]);
});

test('unknown URL returns the custom 404', async ({ request }) => {
  const res = await request.get('/no-such-page/');
  expect(res.status()).toBe(404);
  const body = await res.text();
  expect(body).toContain('Page not found');
  expect(body).toMatch(/href="[^"]*\/learn\/"/);
  expect(body).toMatch(/href="[^"]*\/faq\/"/);
});

test('404 is not in the sitemap and has no markdown', () => {
  const sitemap = readFileSync(join(SITE_DIR, 'sitemap.xml'), 'utf8');
  expect(sitemap).not.toContain('/404');
  expect(existsSync(join(SITE_DIR, '404.md'))).toBe(false);
});

test('404 page is noindex and carries no WebPage JSON-LD', () => {
  const html = readFileSync(join(SITE_DIR, '404.html'), 'utf8');
  expect(html).toMatch(/<meta name="?robots"? content="?noindex"?/);
  expect(html).not.toContain('"@type":"WebPage"');
  expect(html).not.toMatch(/"@type":\s*"WebPage"/);
  expect(html).not.toContain('application/ld+json');
});

test('404 page has the site nav and footer', async ({ page }) => {
  await preparePage(page);
  await page.goto('/no-such-page/');
  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();
  const list = page.locator('section ul', { has: page.locator('a[href$="/faq/"]') });
  expect(await list.evaluate((el) => getComputedStyle(el).listStyleType)).toBe('none');
});
