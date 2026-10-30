// JSON-LD on the home page.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DIR, builtFiles, jsonLd } from './helpers.js';

const CORE =
  'Dapr is the durable execution runtime for workflows and AI agents. It provides APIs for building event-driven architectures.';
const items = jsonLd(readFileSync(join(SITE_DIR, 'index.html'), 'utf8'), '/');
const byType = (t) => items.find((i) => i['@type'] === t);

test('Organization', () => {
  const o = byType('Organization');
  expect(o.description).toBe(CORE);
  expect(o.logo).toMatch(/dapr-logo-square\.png$/);
});

test('SoftwareApplication', () => {
  const s = byType('SoftwareApplication');
  expect(s.applicationCategory).toBe('DeveloperApplication');
  expect(s.softwareVersion).toBe('1.19');
  expect(s.description).toBe(CORE);
  expect(s.license).toBeTruthy();
  expect(s.operatingSystem).toBeTruthy();
  expect(s.sameAs).toContain('https://github.com/dapr/dapr');
});

// ---- WebPage and BreadcrumbList on every page ----
const pages = builtFiles('index.html').map((f) => ({ ...f, nodes: jsonLd(f.text, f.url) }));
const canonical = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

test('every JSON-LD block parses on every page', () => {
  expect(pages.length).toBeGreaterThan(5);
  for (const p of pages) expect(p.nodes.length, p.url).toBeGreaterThan(0);
});

test('every page has exactly one WebPage whose url is its canonical URL', () => {
  for (const p of pages) {
    const webpages = p.nodes.filter((n) => n['@type'] === 'WebPage');
    expect(webpages.length, p.url).toBe(1);
    const w = webpages[0];
    expect(w.url, p.url).toBe(canonical(p.text));
    expect(w['@id'], p.url).toBe(`${w.url}#webpage`);
    expect(w.name, p.url).toBeTruthy();
    expect(w.isPartOf, p.url).toEqual({ '@id': 'http://localhost:8181/#website' });
  }
});

test('breadcrumbs follow the URL', () => {
  const read = (u) => pages.find((p) => p.url === u);
  const crumbs = (u) => read(u).nodes.find((n) => n['@type'] === 'WebPage').breadcrumb;
  const program = crumbs('/community/program/index.html');
  expect(program['@type']).toBe('BreadcrumbList');
  expect(program.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  expect(program.itemListElement.map((i) => i.name)).toEqual([
    'Home',
    'Join the Dapr Community: Discord, Calls, Meteors',
    'Dapr Meteors Program: Recognizing Community Experts',
  ]);
  expect(program.itemListElement[2].item).toBe('http://localhost:8181/community/program/');
  const home = crumbs('/index.html');
  expect(home.itemListElement.length).toBe(1);
  expect(home.itemListElement[0].name).toBe('Home');
});

test('no HTML entities in JSON-LD strings', () => {
  for (const p of pages) {
    for (const s of strings(p.nodes)) expect(s, p.url).not.toMatch(/&amp;|&#\d+;|&quot;/);
  }
});

test('dateModified is RFC 3339 when present', () => {
  for (const p of pages) {
    const w = p.nodes.find((n) => n['@type'] === 'WebPage');
    if (w?.dateModified === undefined) continue;
    expect(w.dateModified, p.url).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d)$/);
    expect(Number.isNaN(Date.parse(w.dateModified)), p.url).toBe(false);
  }
});

// ---- One entity per thing: every reference resolves ----
const BASE = 'http://localhost:8181/';

test('Dapr is a single SoftwareApplication entity, referenced by one @id', () => {
  for (const p of pages) {
    for (const n of p.nodes.filter((n) => n['@type'] === 'SoftwareApplication')) {
      expect(n['@id'], p.url).toBe(`${BASE}#software`);
    }
  }
  const testimonials = pages.find((p) => p.url === '/testimonials/index.html');
  expect(JSON.stringify(testimonials.nodes)).toContain(`"@id":"${BASE}#software"`);
  expect(JSON.stringify(testimonials.nodes)).not.toContain('#dapr-software');
});

test('every @id reference resolves to a known entity', () => {
  const refs = (value, out = []) => {
    if (Array.isArray(value)) value.forEach((v) => refs(v, out));
    else if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 1 && keys[0] === '@id') out.push(value['@id']);
      else Object.values(value).forEach((v) => refs(v, out));
    }
    return out;
  };
  for (const p of pages) {
    const allowed = [`${BASE}#organization`, `${BASE}#website`, `${BASE}#software`, `${p.nodes.find((n) => n['@type'] === 'WebPage')['@id']}`];
    const found = refs(p.nodes);
    for (const r of found) expect(allowed, `${p.url}: ${r}`).toContain(r);
  }
  const testimonials = pages.find((p) => p.url === '/testimonials/index.html');
  expect(refs(testimonials.nodes)).toContain(`${BASE}#software`); // guards against checking nothing
});

test('the home WebPage name matches the <title>', () => {
  const home = pages.find((p) => p.url === '/index.html');
  const title = home.text.match(/<title>([^<]*)<\/title>/)[1];
  expect(home.nodes.find((n) => n['@type'] === 'WebPage').name).toBe(title);
});
