// The /events/ listing: recurring, upcoming and past events. "Now" is pinned
// with fixture builds (tests/fixtures/*.toml), so results do not drift as the
// calendar moves.
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DIR, builtFiles, buildFixtureSite, jsonLd } from './helpers.js';

const read = (dir, rel) => readFileSync(join(dir, rel), 'utf8');

// The part of the listing HTML under the h2 whose text is `heading`, up to the next h2.
function section(html, heading) {
  const m = html.match(new RegExp(`<h2[^>]*>\\s*${heading}\\s*</h2>([\\s\\S]*?)(?=<h2|</main>|<footer|$)`));
  expect(m, `section "${heading}"`).not.toBeNull();
  return m[1];
}
// Event card titles (h3) in a section's HTML.
const cardTitles = (sectionHtml) =>
  [...sectionHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => m[1].replace(/<[^>]*>/g, '').trim());

const real = read(SITE_DIR, 'events/index.html');

test('real build: Dapr Day 2025 is past, none upcoming', () => {
  expect(cardTitles(section(real, 'Upcoming events'))).toEqual([]);
  const past = cardTitles(section(real, 'Past events'));
  expect(past.some((t) => t.includes('Dapr Day 2025'))).toBe(true);
});

test('real build: Dapr Day 2026 is listed before Dapr Day 2025 under Past events', () => {
  const past = cardTitles(section(real, 'Past events'));
  const i26 = past.findIndex((t) => t.includes('Dapr Day 2026'));
  const i25 = past.findIndex((t) => t.includes('Dapr Day 2025'));
  expect(i26).toBeGreaterThanOrEqual(0);
  expect(i26).toBeLessThan(i25);
});

test('real build: the community call is listed under Recurring', () => {
  const rec = section(real, 'Recurring');
  expect(cardTitles(rec)).toContain('Dapr Community Call');
  expect(rec).toContain('Every month');
  expect(rec).toContain('href="https://www.youtube.com/@daprdev/streams"');
});

test('no built page mentions the old community call cadence', () => {
  const bad = [];
  for (const f of [...builtFiles('.html'), ...builtFiles('.md'), ...builtFiles('.txt')]) {
    if (/every other week|bi-weekly/i.test(f.text)) bad.push(f.url);
  }
  expect(bad).toEqual([]);
});

test('upcoming section says so when empty and points to the community call', () => {
  expect(section(real, 'Upcoming events')).toMatch(/Community Call<\/a>, which streams every month/);
  expect(read(SITE_DIR, 'events/index.md')).toContain('Dapr Community Call, which streams every month.');
});

test('fixture 2026-01-01: start-only and Dapr Day 2026 are upcoming, Dapr Day 2025 is past, no-dates is absent', () => {
  const { dir } = buildFixtureSite('events-2026-01-01', 'events-2026-01-01.toml');
  const html = read(dir, 'events/index.html');
  const upcoming = cardTitles(section(html, 'Upcoming events'));
  expect(upcoming).toContain('Fixture Start Only');
  expect(upcoming.some((t) => t.includes('Dapr Day 2026'))).toBe(true);
  expect(upcoming.some((t) => t.includes('Dapr Day 2025'))).toBe(false);
  const past = cardTitles(section(html, 'Past events'));
  expect(past.some((t) => t.includes('Dapr Day 2025'))).toBe(true);
  expect(html).not.toContain('Fixture No Dates');
  expect(html).toContain('March 1, 2026');
});

test('fixture 2026-01-01: Dapr Day 2026 is upcoming', () => {
  const { dir } = buildFixtureSite('events-2026-01-01', 'events-2026-01-01.toml');
  const html = read(dir, 'events/index.html');
  expect(cardTitles(section(html, 'Upcoming events')).some((t) => t.includes('Dapr Day 2026'))).toBe(true);
});

test('fixture build succeeds and warns about the no-dates event', () => {
  const { stderr } = buildFixtureSite('events-2026-01-01', 'events-2026-01-01.toml');
  expect(stderr).toContain('has no start_date or end_date');
  expect(stderr).toContain('fixture-no-dates');
});

test('boundary: Dapr Day 2026 is upcoming one minute before end_date and past one minute after', () => {
  // Dapr Day 2026 ends 2026-10-08T18:30:00Z.
  const before = buildFixtureSite('events-boundary-before', 'events-boundary-before.toml');
  const after = buildFixtureSite('events-boundary-after', 'events-boundary-after.toml');
  const b = read(before.dir, 'events/index.html');
  const a = read(after.dir, 'events/index.html');
  expect(cardTitles(section(b, 'Upcoming events')).some((t) => t.includes('Dapr Day 2026'))).toBe(true);
  expect(cardTitles(section(a, 'Past events')).some((t) => t.includes('Dapr Day 2026'))).toBe(true);
  expect(cardTitles(section(a, 'Upcoming events')).some((t) => t.includes('Dapr Day 2026'))).toBe(false);
});

test('boundary: a start-only event is classified by start_date (past in the boundary build)', () => {
  // fixture-start-only starts 2026-03-01, so it is past in the boundary builds. This pins that the
  // partial classifies by start_date when end_date is absent, independent of Dapr Day 2026.
  const { dir } = buildFixtureSite('events-boundary-after', 'events-boundary-after.toml');
  expect(cardTitles(section(read(dir, 'events/index.html'), 'Past events'))).toContain('Fixture Start Only');
});

test('nav: Events is the first item under News & Media', async () => {
  const home = read(SITE_DIR, 'index.html');
  const m = home.match(/<div class="navbar-dropdown" id="nav-dropdown-news-media">([\s\S]*?)<\/div>\s*<\/div>/);
  expect(m).not.toBeNull();
  const first = m[1].match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
  expect(first[2].replace(/<[^>]*>/g, '').trim()).toBe('Events');
  expect(first[1]).toMatch(/\/events\/$/);
});

test('ItemList: the listing JSON-LD lists Events; the community call is not in it', () => {
  const nodes = jsonLd(real, '/events/');
  const list = nodes.find((n) => n['@type'] === 'ItemList');
  expect(list).toBeTruthy();
  expect(list.itemListElement.length).toBeGreaterThan(0);
  for (const el of list.itemListElement) {
    const ev = el.item;
    expect(ev['@type']).toBe('Event');
    expect(ev.startDate).toBeTruthy();
    expect(ev.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
    expect(ev.location['@type']).toBe('VirtualLocation');
    expect(ev.organizer['@id']).toMatch(/#organization$/);
    expect(ev.description).toBeTruthy();
    expect(ev.image).toMatch(/^https?:\/\//);
  }
  expect(JSON.stringify(list)).not.toContain(':null');
  // The call has no start date we can state accurately, so it is not an Event node.
  for (const el of list.itemListElement) expect(el.item.name).not.toMatch(/Community Call/);
  expect(JSON.stringify(list.itemListElement)).not.toContain('eventSchedule');
});

test('events listing has a markdown rendering with the three section headings', () => {
  expect(existsSync(join(SITE_DIR, 'events/index.md'))).toBe(true);
  const md = read(SITE_DIR, 'events/index.md');
  const lines = md.split('\n');
  for (const h of ['## Recurring', '## Upcoming events', '## Past events']) expect(lines).toContain(h);
  expect(lines).toContain('### Dapr Community Call');
});

// ---- Individual event pages ----
const CNCF_PAGE = 'https://community2.cncf.io/events/details/cncf-virtual-project-events-hosted-by-cncf-presents-dapr-day/';
const FORM_ID = '37002a48-7eda-41b5-97b8-70fec7fe7782';
const DD25 = 'events/dapr-day-2025/index.html';
const DD26 = 'events/dapr-day-2026/index.html';
const SESSIONS_2026 = [
  'Opening',
  'Dapr in 2027',
  'Crash-Proof AI Applications: Durable Spring AI 2.x with Dapr Workflows',
  'Sidecars on a Laptop: A Local Dapr Inner Loop Measured in Seconds',
  'Ship with Confidence: 5 Production-Ready Dapr Practices',
  'Distributed Event Processing with Dapr',
  'Dapr Agents: a maintainers perspective on building LLM powered autonomous agentic applications',
  'Closing remarks',
];

test('real build: past event pages have no registration', () => {
  for (const f of [DD25, DD26]) {
    const html = read(SITE_DIR, f);
    expect(html, f).not.toContain('hsforms.net');
    expect(html, f).not.toContain(CNCF_PAGE);
    expect(html, f).not.toContain(FORM_ID);
  }
});

test('real build: Dapr Day 2025 embeds the 2025 playlist', () => {
  const html = read(SITE_DIR, DD25);
  expect(html).toContain('videoseries?list=PLcip_LgkYwzsOa3eXZwAKv6hp-DinXpjx');
  expect(html).not.toContain('PLcip_LgkYwzsFZ65fIzeOmJBQHwcPQ_gE');
  expect(html).not.toContain('Recordings coming soon');
  expect(html).not.toContain('the distributed application runtime');
});

test('real build: Dapr Day 2026 shows recordings coming soon', () => {
  const html = read(SITE_DIR, DD26);
  expect(html).toContain('Recordings coming soon');
  expect(html).toContain('href="https://www.youtube.com/@daprdev"');
  expect(html).not.toContain('videoseries');
});

test('real build: Dapr Day 2026 meta description is 50 to 160 characters and promises no recordings', () => {
  const html = read(SITE_DIR, DD26);
  const d = html.match(/<meta name="description" content="([^"]*)"/)[1];
  expect(d.length).toBeGreaterThanOrEqual(50);
  expect(d.length).toBeLessThanOrEqual(160);
  expect(d).not.toMatch(/record|watch/i);
});

test('real build: event JSON-LD has no nulls, an endDate, and an image fallback', () => {
  for (const f of [DD25, DD26]) {
    const html = read(SITE_DIR, f);
    const ev = jsonLd(html, f).find((n) => n['@type'] === 'Event');
    expect(ev, f).toBeTruthy();
    expect(JSON.stringify(ev)).not.toContain(':null');
    expect(ev.endDate).toBeTruthy();
    expect(ev.image).toMatch(/^https?:\/\//);
    expect(ev.eventStatus).toBe('https://schema.org/EventScheduled');
  }
});

test('fixture 2025-06-01: Dapr Day 2025 shows the HubSpot form and no recordings', () => {
  const { dir } = buildFixtureSite('events-2025-06-01', 'events-2025-06-01.toml');
  const html = read(dir, DD25);
  expect(html).toContain('hsforms.net');
  // html/template quotes a string in JS context; a pre-jsonified value is escaped again
  // and renders as "\"id\"", so the form never loads.
  expect(html).toContain(`formId: "${FORM_ID}",`);
  expect(html).toContain('portalId: "22146261",');
  expect(html).toContain('region: "na1"');
  expect(html).not.toContain('formId: "\\"');
  expect(html).not.toContain('videoseries');
  expect(html).not.toContain('Recordings coming soon');
});

test('fixture 2026-01-01: Dapr Day 2026 shows a register link to the CNCF page', () => {
  const { dir } = buildFixtureSite('events-2026-01-01', 'events-2026-01-01.toml');
  const html = read(dir, DD26);
  expect(html).toContain(`href="${CNCF_PAGE}"`);
  expect(html).not.toContain('hsforms.net');
  expect(html).not.toContain('Recordings coming soon');
});

test('Dapr Day 2026 markdown lists every session title', () => {
  const md = read(SITE_DIR, 'events/dapr-day-2026/index.md');
  for (const t of SESSIONS_2026) expect(md).toContain(`### ${t}`);
  expect(md).toContain('## Agenda');
  expect(md).toContain('Recordings coming soon');
  expect(md).not.toContain('automonous');
});

test('event markdown puts Recordings before Agenda', () => {
  const md = read(SITE_DIR, 'events/dapr-day-2026/index.md');
  expect(md.indexOf('## Recordings coming soon')).toBeGreaterThan(-1);
  expect(md.indexOf('## Recordings coming soon')).toBeLessThan(md.indexOf('## Agenda'));
});

test('Dapr Day 2025 markdown links the 2025 playlist', () => {
  const md = read(SITE_DIR, 'events/dapr-day-2025/index.md');
  expect(md).toContain('list=PLcip_LgkYwzsOa3eXZwAKv6hp-DinXpjx');
});
