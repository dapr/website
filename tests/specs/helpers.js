import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

// Absolute path to the static build the tests run against.
export const SITE_DIR = resolve(import.meta.dirname, '..', '.site');

// Built files whose path ends in `suffix`, e.g. builtFiles('index.html').
// `url` is the site-relative URL, e.g. '/workflow/index.md'.
export function builtFiles(suffix) {
  return readdirSync(SITE_DIR, { recursive: true })
    .filter((f) => f.endsWith(suffix))
    .map((f) => ({
      path: join(SITE_DIR, f),
      url: '/' + f.split('\\').join('/'),
      text: readFileSync(join(SITE_DIR, f), 'utf8'),
    }));
}

// Builds a second copy of the site with an extra Hugo config from
// tests/fixtures/ (fixed "now", extra fixture content), using the `hugo` on
// PATH. Tests read the output statically; no server is needed.
//
// Returns `{ dir, stderr }`:
//   dir    absolute path of the output directory
//   stderr Hugo's warnings and errors as one string, so tests can assert on a
//          build warning (for example the one for an event with no dates)
// Throws, with Hugo's stderr in the message, if the build fails.
//
// Safe under fullyParallel: results are memoized per fixture `name` within the
// worker process (each fixture is built at most once per worker, so call it
// freely from many tests), and the output directory is
// tests/.site-<name>-<pid>, unique per worker, so concurrent
// `hugo --cleanDestinationDir` runs never touch the same directory. The
// directory is removed when the worker exits. Reuse this helper for new
// fixture builds; do not build into a shared directory.
//
// Runs at log level "warn" rather than --quiet: --quiet hides warnings too.
const fixtureBuilds = new Map();
export function buildFixtureSite(name, fixtureConfig) {
  if (fixtureBuilds.has(name)) return fixtureBuilds.get(name);
  const repoRoot = resolve(import.meta.dirname, '..', '..');
  const rel = `tests/.site-${name}-${process.pid}`;
  const dir = join(repoRoot, rel);
  const res = spawnSync(
    'hugo',
    [
      '--logLevel', 'warn',
      '--cleanDestinationDir',
      '--baseURL', 'http://localhost:8181/',
      '--config', `config.toml,tests/fixtures/${fixtureConfig}`,
      '--destination', rel,
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  const stderr = (res.stderr || '') + (res.stdout || '');
  if (res.error || res.status !== 0) {
    throw new Error(`hugo failed for fixture ${name} (status ${res.status}): ${res.error ?? ''}\n${stderr}`);
  }
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  const result = { dir, stderr };
  fixtureBuilds.set(name, result);
  return result;
}

// Pages under test. Keep in step with the directories under content/.
export const PAGES = [
  '/',
  '/workflow/',
  '/ai/',
  '/learn/',
  '/community/',
  '/community/program/',
  '/enterprise/',
  '/platform-engineering/',
  '/testimonials/',
  '/events/',
  '/events/dapr-day-2025/',
  '/events/dapr-day-2026/',
  '/faq/',
];

// Third-party embeds and scripts that none of the tests exercise. Loading them
// makes runs slow and dependent on outside services (YouTube iframes alone can
// push a page past the test timeout), so they are blocked. Fonts and the
// Font Awesome/Iconify CDNs stay, since they affect layout.
const BLOCKED = /(youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com|buttons\.github\.io|api\.github\.com|reo\.dev|scarf\.sh)/;

// Call before page.goto in every test.
//  - blocks the third-party requests above
//  - dismisses the cookie banner the way a returning visitor would; it is fixed
//    to the bottom of the viewport and can cover elements under test
export async function preparePage(page) {
  await page.route(BLOCKED, (route) => route.abort());
  await page.context().addCookies([
    { name: 'dapr_cookie_consent', value: 'rejected', url: 'http://localhost:8181' },
  ]);
}

// Press Tab until the focused element matches `selector`. Using real Tab
// presses (not element.focus()) is what makes the browser apply :focus-visible.
export async function tabTo(page, selector, maxPresses = 60) {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate((sel) => document.activeElement?.matches(sel), selector)) return;
  }
  throw new Error(`Tabbed ${maxPresses} times without reaching ${selector}`);
}

// Parsed JSON-LD blocks of a built HTML page, with `@graph` flattened.
// Throws, naming the page, if a block is not valid JSON.
export function jsonLd(html, name = 'page') {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const out = [];
  for (const [, body] of blocks) {
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      throw new Error(`${name}: invalid JSON-LD: ${e.message}`);
    }
    for (const item of Array.isArray(data) ? data : [data]) {
      if (Array.isArray(item['@graph'])) out.push(...item['@graph']);
      else out.push(item);
    }
  }
  return out;
}
