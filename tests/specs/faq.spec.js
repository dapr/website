// The /faq/ page: visible questions and answers, the FAQPage JSON-LD built
// from the same front matter, and the accuracy guard that every answer names
// a docs.dapr.io source (sources are kept in front matter, never rendered).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SITE_DIR, jsonLd } from './helpers.js';

const QUESTIONS = [
  'What is Dapr?',
  'What is durable execution?',
  'Is Dapr a workflow engine?',
  'How does Dapr help build AI agents?',
  'What is the Dapr MCP server?',
  'Does Dapr require Kubernetes?',
  'Which programming languages does Dapr support?',
  'How do I add Dapr to an existing application?',
  'Is Dapr production ready, and who uses it?',
  'Is Dapr free and open source?',
  'Where can I get commercial support?',
];

const CORE_MESSAGE =
  'Dapr is the durable execution runtime for workflows and AI agents. It provides APIs for building event-driven architectures.';

// The only entries allowed a non-docs source, each pinned to its question.
// Commercial support points to /enterprise/. The license and CNCF status are
// governance facts the docs do not state, so they cite the LICENSE file and
// the CNCF project page.
const NON_DOCS_SOURCES = {
  'Where can I get commercial support?': 'https://dapr.io/enterprise/',
  'Is Dapr free and open source?': 'https://github.com/dapr/dapr/blob/master/LICENSE',
  'Is Dapr production ready, and who uses it?': 'https://www.cncf.io/projects/dapr/',
};

const FRONT_MATTER = resolve(import.meta.dirname, '..', '..', 'content', 'faq', '_index.md');

const readHtml = () => readFileSync(join(SITE_DIR, 'faq', 'index.html'), 'utf8');

// Visible text of an HTML fragment, entities decoded, whitespace normalized.
const text = (html) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Each FAQ entry rendered as <div class="faq-entry"><h2>..</h2><p class="faq-answer">..</p>..</div>.
function entries(html) {
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>\s*<p class="faq-answer"[^>]*>([\s\S]*?)<\/p>/g)].map(
    (m) => ({ question: text(m[1]), answer: text(m[2]) }),
  );
}

test('FAQ page lists all questions in order', () => {
  const html = readHtml();
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1]));
  expect(h2s).toEqual(QUESTIONS);
});

test('FAQPage JSON-LD matches the visible text', () => {
  const html = readHtml();
  const faq = jsonLd(html, '/faq/').filter((n) => n['@type'] === 'FAQPage');
  expect(faq).toHaveLength(1);
  const visible = entries(html);
  expect(visible).toHaveLength(QUESTIONS.length);
  const main = faq[0].mainEntity;
  expect(main).toHaveLength(visible.length);
  main.forEach((q, i) => {
    expect(q['@type']).toBe('Question');
    expect(norm(q.name)).toBe(visible[i].question);
    expect(q.acceptedAnswer['@type']).toBe('Answer');
    expect(norm(q.acceptedAnswer.text)).toBe(visible[i].answer);
  });
});

test('first answer states the core message', () => {
  const [first] = entries(readHtml());
  expect(first.answer.startsWith(CORE_MESSAGE)).toBe(true);
});

test('MCP server answer says it is alpha', () => {
  const mcp = entries(readHtml()).find((e) => e.question === 'What is the Dapr MCP server?');
  expect(mcp.answer).toMatch(/\balpha\b/i);
});

// Front matter entries as { question, source, link }, by text match (no YAML
// dependency in tests/).
function frontMatterEntries() {
  const fm = readFileSync(FRONT_MATTER, 'utf8');
  return fm
    .split(/^\s*-\s*question:/m)
    .slice(1)
    .map((b) => ({
      question: b.match(/^\s*"([^"]+)"/)?.[1],
      source: b.match(/^\s*source:\s*"([^"]+)"/m)?.[1],
      link: b.match(/^\s*url:\s*"([^"]+)"/m)?.[1],
    }));
}

test('every entry has a docs source', () => {
  const fm = readFileSync(FRONT_MATTER, 'utf8');
  const questions = fm.match(/^\s*-?\s*question:/gm) || [];
  const sources = fm.match(/^\s*source:/gm) || [];
  const docs = fm.match(/^\s*source:\s*"https:\/\/docs\.dapr\.io\//gm) || [];
  expect(questions.length).toBe(QUESTIONS.length);
  expect(sources.length).toBe(questions.length);
  for (const e of frontMatterEntries()) {
    if (e.source.startsWith('https://docs.dapr.io/')) continue;
    expect(NON_DOCS_SOURCES[e.question], `non-docs source for "${e.question}"`).toBe(e.source);
  }
  expect(docs.length).toBe(questions.length - Object.keys(NON_DOCS_SOURCES).length);
});

test('source is never rendered', () => {
  // Trivially true for Q11: its source is https://dapr.io/enterprise/ but the test build uses a localhost baseURL.
  const html = readHtml();
  const entries = frontMatterEntries();
  expect(entries.length).toBe(QUESTIONS.length);
  for (const { source, link } of entries) {
    if (source === link) continue;
    expect(html, `source ${source} rendered`).not.toContain(source);
  }
});

test('footer links to the FAQ', () => {
  const html = readFileSync(join(SITE_DIR, 'index.html'), 'utf8');
  const footer = html.slice(html.lastIndexOf('<footer'));
  expect(footer).toMatch(/<a href="[^"]*\/faq\/"[^>]*>FAQ<\/a>/);
});

test('answers have no Markdown, dashes, or banned claims', () => {
  for (const { answer } of entries(readHtml())) {
    expect(answer).not.toMatch(/[\u2013\u2014]/);
    expect(answer).not.toMatch(/\]\(|\*\*|`/);
    expect(answer).not.toMatch(/are cryptographically signed/);
    expect(answer).not.toMatch(/\b(best|leading|most popular)\b/i);
    expect(answer).not.toMatch(/30%/);
  }
});
