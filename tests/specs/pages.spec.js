// Titles and meta descriptions, read from the static build.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DIR } from './helpers.js';

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
