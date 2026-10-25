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
