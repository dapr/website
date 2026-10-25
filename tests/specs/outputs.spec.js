// Every page must have a plain markdown rendering for LLMs and agents. The page
// list comes from sitemap.xml, not PAGES, so a page added without a markdown
// template fails here instead of shipping without an index.md.
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DIR } from './helpers.js';

const sitemap = readFileSync(join(SITE_DIR, 'sitemap.xml'), 'utf8');
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
  const loc = m[1];
  const rel = new URL(loc).pathname; // e.g. /workflow/
  return { loc, rel, mdPath: join(SITE_DIR, rel, 'index.md'), htmlPath: join(SITE_DIR, rel, 'index.html') };
});

test('sitemap lists pages', () => {
  expect(pages.length).toBeGreaterThan(5);
});

test('every page in sitemap.xml has a markdown rendering', () => {
  const missing = pages.filter((p) => !existsSync(p.mdPath)).map((p) => p.rel + 'index.md');
  expect(missing).toEqual([]);
});

test('every HTML page links to its markdown rendering', () => {
  const missing = pages
    .filter((p) => !readFileSync(p.htmlPath, 'utf8').includes(`<link rel="alternate" type="text/markdown" href="${p.loc}index.md">`))
    .map((p) => p.rel);
  expect(missing).toEqual([]);
});

test('each markdown rendering starts with the page H1', () => {
  const wrong = [];
  for (const p of pages) {
    if (!existsSync(p.mdPath)) continue; // the "every page has a markdown rendering" test reports this
    const h1 = readFileSync(p.htmlPath, 'utf8').match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    if (!h1) {
      wrong.push(`${p.rel}: the HTML page has no <h1>`);
      continue;
    }
    const expected = '# ' + h1[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const first = readFileSync(p.mdPath, 'utf8').split('\n')[0];
    if (first !== expected) wrong.push(`${p.rel}: expected "${expected}", got "${first}"`);
  }
  expect(wrong).toEqual([]);
});

test('markdown is served as text/markdown', async ({ request }) => {
  const res = await request.get('/workflow/index.md');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/^text\/markdown/);
});

// Text of a tag's contents as a reader sees it: no tags, entities decoded,
// whitespace collapsed.
function visibleText(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// The page's own content: no header/nav, footer, cookie banner or scripts.
function mainHtml(html) {
  return html
    .replace(/<(script|style|nav|header|footer)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<div[^>]*class="[^"]*cookie[^"]*"[\s\S]*$/i, '');
}

const mdPages = pages.filter((p) => existsSync(p.mdPath));

test('every HTML heading appears in the markdown rendering', () => {
  const missing = [];
  for (const p of mdPages) {
    const lines = new Set(readFileSync(p.mdPath, 'utf8').split('\n').map((l) => l.trim()));
    const main = mainHtml(readFileSync(p.htmlPath, 'utf8'));
    for (const m of main.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/g)) {
      const text = visibleText(m[2]);
      if (!text) continue;
      const line = '#'.repeat(Number(m[1])) + ' ' + text;
      if (!lines.has(line)) missing.push(`${p.rel}: ${line}`);
    }
  }
  expect(missing).toEqual([]);
});

test('markdown contains no HTML or entities', () => {
  const bad = [];
  for (const p of mdPages) {
    const hit = readFileSync(p.mdPath, 'utf8').match(/<\/?[a-z][a-z0-9]*(\s[^>]*)?>|&amp;|&#\d+;|&quot;/i);
    if (hit) bad.push(`${p.rel}: ${hit[0]}`);
  }
  expect(bad).toEqual([]);
});

test('markdown has no run of blank lines', () => {
  const bad = mdPages.filter((p) => /\n\n\n/.test(readFileSync(p.mdPath, 'utf8'))).map((p) => p.rel);
  expect(bad).toEqual([]);
});

test('markdown links are absolute', () => {
  const bad = [];
  for (const p of mdPages) {
    for (const m of readFileSync(p.mdPath, 'utf8').matchAll(/\]\(([^)\s]*)/g)) {
      if (!m[1].startsWith('http')) bad.push(`${p.rel}: ](${m[1]}`);
    }
  }
  expect(bad).toEqual([]);
});

// llms.txt and llms-full.txt are generated from templates (llmstxt.org format).
const CORE_MESSAGE =
  'Dapr is the durable execution engine for workflows and AI agents. It provides APIs for building event-driven architectures.';
const llmsPath = join(SITE_DIR, 'llms.txt');
const llmsFullPath = join(SITE_DIR, 'llms-full.txt');
const llmsText = existsSync(llmsPath) ? readFileSync(llmsPath, 'utf8') : '';
const llmsPages = pages.filter((p) => !p.rel.startsWith('/404'));

test('llms.txt states the core message', () => {
  expect(llmsText.split('\n')).toContain('> ' + CORE_MESSAGE);
});

test('llms.txt links every page', () => {
  const missing = llmsPages.filter((p) => !llmsText.includes(`](${p.loc}index.md)`)).map((p) => p.rel);
  expect(missing).toEqual([]);
});

test('every link in llms.txt to dapr.io resolves', () => {
  const bad = [];
  const origin = new URL(pages[0].loc).origin; // the build's baseURL, https://dapr.io in production
  const own = [...llmsText.matchAll(/\]\(([^)\s]*)\)/g)].map((m) => m[1]).filter((u) => u.startsWith(origin + '/'));
  expect(own.length).toBeGreaterThan(5); // guards against checking nothing
  for (const m of own.map((u) => [null, u])) {
    const rel = new URL(m[1]).pathname;
    const file = rel.endsWith('/') ? join(SITE_DIR, rel, 'index.html') : join(SITE_DIR, rel);
    if (!existsSync(file)) bad.push(m[1]);
  }
  expect(bad).toEqual([]);
});

test('llms-full.txt contains every page, byte for byte', () => {
  expect(existsSync(llmsFullPath)).toBe(true);
  const full = existsSync(llmsFullPath) ? readFileSync(llmsFullPath, 'utf8') : '';
  const missing = [];
  for (const p of llmsPages) {
    const md = readFileSync(p.mdPath, 'utf8');
    if (!full.includes(md)) missing.push(p.rel);
  }
  expect(missing).toEqual([]);
});

test('llms.txt and llms-full.txt are served as text/plain', async ({ request }) => {
  for (const f of ['/llms.txt', '/llms-full.txt']) {
    const res = await request.get(f);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/^text\/plain/);
  }
});

test('llms.txt labels non-stable docs links', () => {
  const lines = llmsText.split('\n');
  const mcp = lines.find((l) => l.startsWith('- [Dapr MCP server'));
  const agents = lines.find((l) => l.startsWith('- [Dapr Agents](https://docs.dapr.io'));
  expect(mcp).toMatch(/alpha/i);
  expect(agents).not.toMatch(/in development/i); // docs say Dapr Agents v1.0 is generally available
});
