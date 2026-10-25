// Dapr 1.19 content on the homepage: the three new alpha building blocks in
// the APIs list ("The APIs behind it"), the alpha label on the existing APIs
// that the 1.19 docs mark alpha, in both the HTML and the homepage markdown,
// and a guard that adding them does not change the grid layout.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DIR, builtFiles, preparePage } from './helpers.js';

// The new items, in order, directly after Cryptography (alpha). "(alpha)" is part of
// the name, so the label shows wherever the name does.
const NEW_APIS = ['Binary Store (alpha)', 'Search (alpha)', 'Vector (alpha)'];

// Existing APIs that the 1.19 docs mark alpha (docs.dapr.io
// /operations/support/alpha-beta-apis/ and each API's overview page).
const LABELED_APIS = ['LLM Conversation (alpha)', 'Distributed lock (alpha)', 'Cryptography (alpha)'];

// State management stays unlabeled (key/value state is stable), but its query
// API is alpha, so the card copy labels that API.
const STATE_QUERY_ALPHA = 'a key/value-based state API and an alpha query API';

// API cards in the first row of the grid at the default 1366px viewport,
// measured on the site before the 1.19 items were added.
const FIRST_ROW_CARDS = 3;

// The APIs grid: the flex container that holds the "Service invocation" card.
// Selected through a card rather than the section, because apis.html has an
// unclosed <section> (a known pre-existing issue).
const API_GRID = 'div.flex:has(> .feature-card h3:text-is("Service invocation"))';

test('homepage lists the 1.19 alpha building blocks', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const names = await page.locator(`${API_GRID} > .feature-card h3`).allTextContents();
  const at = names.indexOf('Cryptography (alpha)');
  expect(at, 'Cryptography (alpha) card').toBeGreaterThanOrEqual(0);
  expect(names.slice(at + 1, at + 1 + NEW_APIS.length)).toEqual(NEW_APIS);

  // Each new card links to a docs.dapr.io page.
  for (const name of NEW_APIS) {
    const card = page.locator(`${API_GRID} > .feature-card`, { has: page.locator(`h3:text-is("${name}")`) });
    await expect(card.locator('a')).toHaveAttribute('href', /^https:\/\/docs\.dapr\.io\/developing-applications\/building-blocks\//);
  }

  // The homepage markdown has them as ### headings in the APIs section.
  const md = readFileSync(join(SITE_DIR, 'index.md'), 'utf8');
  const section = md.split(/^## /m).find((s) => s.startsWith('The APIs behind it'));
  expect(section, 'APIs section in index.md').toBeTruthy();
  const headings = [...section.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
  const mdAt = headings.indexOf('Cryptography (alpha)');
  expect(headings.slice(mdAt + 1, mdAt + 1 + NEW_APIS.length)).toEqual(NEW_APIS);
});

test('existing alpha APIs carry the alpha label', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const names = await page.locator(`${API_GRID} > .feature-card h3`).allTextContents();
  for (const name of LABELED_APIS) expect(names, 'homepage HTML').toContain(name);
  const state = page.locator(`${API_GRID} > .feature-card`, { has: page.locator('h3:text-is("State management")') });
  await expect(state.locator('p')).toContainText(STATE_QUERY_ALPHA);

  const md = readFileSync(join(SITE_DIR, 'index.md'), 'utf8');
  const section = md.split(/^## /m).find((s) => s.startsWith('The APIs behind it'));
  const headings = [...section.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
  for (const name of LABELED_APIS) expect(headings, 'index.md').toContain(name);
  expect(section).toContain(STATE_QUERY_ALPHA);
});

test('API grid keeps its layout', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const firstRow = await page.locator(`${API_GRID} > .feature-card`).evaluateAll((cards) => {
    const top = cards[0].offsetTop;
    return cards.filter((c) => c.offsetTop === top).length;
  });
  expect(firstRow).toBe(FIRST_ROW_CARDS);
});

// Dapr 1.19 content on /workflow and /ai (Task 13).

// h3 card titles from task-13-brief.md, used verbatim.
const WORKFLOW_119_CARDS = ['Workflows across apps', 'Detached workflows'];
const AI_119_CARDS = ['Dapr MCP server (alpha)', 'Search and vector APIs (alpha)'];

// Alpha features whose every mention must carry the label nearby.
const ALPHA_TERMS = ['MCP server', 'Binary Store', 'Search API', 'Vector API'];
const ALPHA_WINDOW = 60;

// Built files for a page URL: its HTML and its markdown rendering.
function pageOutputs(url) {
  const dir = join(SITE_DIR, url);
  return [
    { file: `${url}index.html`, text: readFileSync(join(dir, 'index.html'), 'utf8') },
    { file: `${url}index.md`, text: readFileSync(join(dir, 'index.md'), 'utf8') },
  ];
}

test('workflow page covers 1.19', async ({ page }) => {
  await preparePage(page);
  await page.goto('/workflow/');
  const titles = (await page.locator('h3').allTextContents()).map((t) => t.trim());
  for (const name of WORKFLOW_119_CARDS) expect(titles, '/workflow/ h3 titles').toContain(name);
  await expect(page.locator('body')).toContainText('nightly performance tests');
});

test('ai page covers 1.19', async ({ page }) => {
  await preparePage(page);
  await page.goto('/ai/');
  const titles = (await page.locator('h3').allTextContents()).map((t) => t.trim());
  for (const name of AI_119_CARDS) expect(titles, '/ai/ h3 titles').toContain(name);
});

test('alpha features are labeled everywhere', () => {
  const misses = [];
  const outputs = ['/', '/ai/', '/workflow/'].flatMap(pageOutputs);
  for (const file of ['llms.txt', 'llms-full.txt']) {
    outputs.push({ file: `/${file}`, text: readFileSync(join(SITE_DIR, file), 'utf8') });
  }
  {
    for (const { file, text } of outputs) {
      // Case-insensitive. The keywords meta tag is left out: its "mcp servers"
      // is a search term for MCP servers in general, not the Dapr MCP server.
      const flat = text.replace(/<meta\s+name="keywords"[^>]*>/gi, '').replace(/\s+/g, ' ');
      const lower = flat.toLowerCase();
      // llms files carry third-party event titles and generic "MCP servers"
      // copy, so they are scanned for the product name only.
      const terms = file.startsWith('/llms') ? ['Dapr MCP server'] : ALPHA_TERMS;
      for (const term of terms.map((t) => t.toLowerCase())) {
        let at = lower.indexOf(term);
        while (at !== -1) {
          const around = flat.slice(Math.max(0, at - ALPHA_WINDOW), at + term.length + ALPHA_WINDOW);
          if (!/alpha/i.test(around)) misses.push(`${file}: "${around}"`);
          at = lower.indexOf(term, at + term.length);
        }
      }
    }
  }
  expect(misses, `mentions without "alpha" within ${ALPHA_WINDOW} characters`).toEqual([]);
});

test('signing claim guard', () => {
  const hits = [...builtFiles('.html'), ...builtFiles('.md')]
    .filter(({ text }) => text.includes('are cryptographically signed'))
    .map(({ url }) => url);
  expect(hits).toEqual([]);
});
