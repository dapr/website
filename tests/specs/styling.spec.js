// Styling rules that are easy to regress and invisible in the markup: how body
// copy is set, how links are underlined, how wide a button is, and later the
// typeface and the design tokens. Everything here is measured in a real browser
// rather than asserted against the SCSS source.
import { test, expect } from '@playwright/test';
import { preparePage } from './helpers.js';

test('body copy in a card is not justified', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await expect(page.locator('.feature-card p').first()).toHaveCSS('text-align', 'left');
});

test('prose links are underlined solid, not dashed', async ({ page }) => {
  await preparePage(page);
  await page.goto('/community/program/');
  // A real prose link, not a .btn: buttons set text-decoration: none, and the
  // card CTAs are buttons now.
  const link = page.locator('.feature-card p a:not(.btn)', { hasText: 'this form' }).first();
  await expect(link).toHaveCSS('text-decoration-style', 'solid');
});

test('a button is as wide as its label, not a fixed 120px box', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const wide = await page.locator('.btn-md', { hasText: 'Durable Workflows' }).first().boundingBox();
  const narrow = await page.locator('.btn-md', { hasText: 'Get Started' }).first().boundingBox();
  expect(wide.width).toBeGreaterThan(narrow.width);
  // A 120px box forces "Durable Workflows" onto two lines, which makes it tall.
  expect(wide.height).toBeLessThan(70);
});

// Review Focus 5: three hero buttons that grow to fit their labels must still
// share a row at desktop width.
test('the three hero buttons sit on one row at desktop width', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const tops = await page.locator('.btn-container .btn-md').evaluateAll(
    (els) => els.map((e) => Math.round(e.getBoundingClientRect().top)),
  );
  expect(tops).toHaveLength(3);
  expect(new Set(tops).size).toBe(1);
});

test('running prose is capped at a readable measure', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const box = await page.locator('.value-prop-text > p').first().boundingBox();
  // ~68ch at the body size. The container is 80% of 1366px without the cap.
  expect(box.width).toBeLessThan(820);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('card copy is not justified on a phone either', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
    await expect(page.locator('.feature-card p').first()).toHaveCSS('text-align', 'left');
  });

  // Review Focus 5 on a phone. Scoped to the button container rather than the
  // whole page: .navbar already overflows by 31px on master, because it sets
  // width:90% and padding:20px 9% under content-box. That is a real bug but it
  // predates this change and is not what these buttons can affect.
  test('the hero buttons stay inside the viewport', async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
    const rights = await page.locator('.btn-container .btn-md').evaluateAll(
      (els) => els.map((e) => Math.ceil(e.getBoundingClientRect().right)),
    );
    expect(rights).toHaveLength(3);
    for (const right of rights) expect(right).toBeLessThanOrEqual(390);
  });
});

test('headings render in Geist and body text in Inter', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await expect(page.locator('h1').first()).toHaveCSS('font-family', /Geist/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Inter/);
});

// Review Focus 2: self-hosting is only a win if the Google request actually goes.
test('no page requests Google Fonts', async ({ page }) => {
  const google = [];
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) google.push(r.url());
  });
  await preparePage(page);
  for (const path of ['/', '/community/', '/learn/']) {
    await page.goto(path);
  }
  expect(google).toEqual([]);
});

// Review Focus 1: .text-size-large carries a line-height chosen for Noto Sans's
// em box. Geist's differs, so the inline highlight backgrounds can bleed over
// the line above. This passes before the font swap and must keep passing after.
const highlightsDoNotOverlap = async (page) => {
  await preparePage(page);
  await page.goto('/');
  const boxes = await page
    .locator('.text-size-large [class^="highlight-"]')
    .evaluateAll((els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left };
    }));
  expect(boxes.length).toBeGreaterThan(1);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const overlaps =
        a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      expect(overlaps, `hero highlight ${i} overlaps highlight ${j}`).toBe(false);
    }
  }
};

test('the hero highlight boxes do not bleed into each other', async ({ page }) => {
  await highlightsDoNotOverlap(page);
});

test.describe('phone hero', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the hero highlight boxes do not bleed on a phone', async ({ page }) => {
    await highlightsDoNotOverlap(page);
  });
});

test('the brand tokens are defined and still match dapr/docs', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const want = ['--d-blue', '--d-sky', '--d-orange', '--d-gold', '--d-radius'];
    return Object.fromEntries(want.map((n) => [n, s.getPropertyValue(n).trim()]));
  });
  expect(tokens).toEqual({
    '--d-blue': '#0D2192',
    '--d-sky': '#3ea9f5',
    '--d-orange': '#ff4e00',
    '--d-gold': '#efca08',
    '--d-radius': '9px',
  });
});

test('every section heading is the same color', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const colors = await page.locator('section h2').evaluateAll(
    (els) => [...new Set(els.map((e) => getComputedStyle(e).color))],
  );
  expect(colors.length).toBeGreaterThan(0);
  expect(colors).toHaveLength(1);
});

test('a feature card has the docs accent top edge', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const card = page.locator('.grid .feature-card').first();
  await expect(card).toHaveCSS('border-top-width', '2px');
  await expect(card).toHaveCSS('border-top-color', 'rgb(13, 33, 146)');
  await expect(card).toHaveCSS('border-left-width', '1px');
  await expect(card).toHaveCSS('border-radius', '9px');
});

// Every card carries the same brand accent. The per-card rotation docs does
// with c-blue / c-sky / c-orange / c-gold classes is not reproducible from CSS
// here: :nth-child counts non-card siblings, and the `of S` form that would not
// is stripped by Hugo 0.147.9's CSS minifier.
test('every card carries the same brand accent, on pages with mixed grids', async ({ page }) => {
  await preparePage(page);
  for (const path of ['/', '/community/program/', '/events/']) {
    await page.goto(path);
    const colors = await page.locator('.feature-card').evaluateAll(
      (els) => [...new Set(els.map((e) => getComputedStyle(e).borderTopColor))],
    );
    expect(colors, `mixed accents on ${path}`).toEqual(['rgb(13, 33, 146)']);
  }
});

// Review Focus 4: the tab is positioned from the left edge, so a centered
// heading needs it recentered or it sits under empty space.
test('the gold tab is centered under a centered heading', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const h2 = page.locator('section h2.text-center').first();
  const tab = await h2.evaluate((el) => {
    const r = getComputedStyle(el, '::after');
    return { width: r.width, background: r.backgroundColor, transform: r.transform };
  });
  expect(tab.width).toBe('42px');
  expect(tab.background).toBe('rgb(239, 202, 8)');
  expect(tab.transform).not.toBe('none');
});

// Task 1 set this; Task 4 rewrites the whole .feature-card rule, so prove it
// survived rather than assuming.
test('the card rewrite kept the ragged-right body copy', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await expect(page.locator('.feature-card p').first()).toHaveCSS('text-align', 'left');
});

// The community layout centers a heading by wrapping it in a .text-center div
// rather than putting the class on the h2, so the tab needs both spellings.
test('the gold tab is centered when the wrapper carries text-center', async ({ page }) => {
  await preparePage(page);
  await page.goto('/community/program/');
  const h2 = page.locator('.text-center > h2', { hasText: 'Meet the Meteors' }).first();
  const tab = await h2.evaluate((el) => getComputedStyle(el, '::after').transform);
  expect(tab).not.toBe('none');
});

// WCAG 2.2 SC 1.4.11 wants 3:1 between a UI component's boundary and the
// surface behind it. Computed here rather than asserted as a hex, so the test
// says what it is actually protecting.
const contrast = (a, b) => {
  const lum = (css) => {
    const [r, g, b2] = css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const ch = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b2);
  };
  const [x, y] = [lum(a), lum(b)].sort((p2, q) => q - p2);
  return (x + 0.05) / (y + 0.05);
};

test('the secondary button border reads against the page behind it', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const btn = page.locator('.btn-secondary').first();
  const { border, behind } = await btn.evaluate((el) => {
    const cs = getComputedStyle(el);
    let node = el.parentElement;
    let bg = 'rgb(255, 255, 255)';
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; }
      node = node.parentElement;
    }
    return { border: cs.borderTopColor, behind: bg };
  });
  expect(contrast(border, behind)).toBeGreaterThanOrEqual(3);
});

test('feature card links are secondary buttons, not bare text links', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const cards = page.locator('.feature-card');
  const n = await cards.count();
  expect(n).toBeGreaterThan(3);
  for (let i = 0; i < n; i++) {
    const links = cards.nth(i).locator('a');
    const count = await links.count();
    for (let j = 0; j < count; j++) {
      const cls = await links.nth(j).getAttribute('class');
      expect(cls, `card ${i} link ${j} is not a button`).toContain('btn-secondary');
    }
  }
});

test('no card CTA still renders a literal > as an arrow', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const texts = await page.locator('.feature-card a').allTextContents();
  expect(texts.length).toBeGreaterThan(0);
  for (const t of texts) expect(t.trim().startsWith('>')).toBe(false);
});

test.describe('phone cards', () => {
  // 375px, not 390: an iPhone SE or 13 mini is the narrowest common phone, and
  // the long CTA labels overflow there first.
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of ['/', '/community/program/', '/events/']) {
  test(`a card CTA button stays inside its card on ${path}`, async ({ page }) => {
    await preparePage(page);
    await page.goto(path);
    const over = await page.locator('.feature-card').evaluateAll((cards) => {
      const bad = [];
      for (const c of cards) {
        const cr = c.getBoundingClientRect();
        for (const a of c.querySelectorAll('a')) {
          const ar = a.getBoundingClientRect();
          if (ar.right > cr.right + 1 || ar.left < cr.left - 1) {
            bad.push(a.textContent.trim().slice(0, 40));
          }
        }
      }
      return bad;
    });
    expect(over).toEqual([]);
  });
  }
});

// A row of cards stretches to the tallest card, so a CTA that sits right after
// the copy lands at a different height in every card. It belongs on the card's
// bottom edge instead, so the CTAs in a row line up.
const ctaRows = async (page, path) => {
  await preparePage(page);
  await page.goto(path);
  return page.locator('.feature-card').evaluateAll((cards) => {
    const rows = new Map();
    for (const card of cards) {
      const cta = card.querySelector(':scope > a.btn, :scope > .flex-left');
      if (!cta) continue;
      const cr = card.getBoundingClientRect();
      const tr = cta.getBoundingClientRect();
      const row = Math.round(cr.top);
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push({
        cardBottom: Math.round(cr.bottom),
        ctaBottom: Math.round(tr.bottom),
        gap: Math.round(cr.bottom - tr.bottom),
      });
    }
    return [...rows.values()].filter((r) => r.length > 1);
  });
};

for (const path of ['/', '/community/', '/learn/', '/events/']) {
  test(`card CTAs sit on the card's bottom edge on ${path}`, async ({ page }) => {
    const rows = await ctaRows(page, path);
    expect(rows.length, `no multi-card row with a CTA found on ${path}`).toBeGreaterThan(0);
    for (const row of rows) {
      const gaps = [...new Set(row.map((c) => c.gap))];
      // Every CTA in a row sits the same distance above its card's bottom.
      expect(gaps).toHaveLength(1);
    }
  });
}

// A section that paints a background has to contain its children's margins. If
// the last child's bottom margin collapses through the section's edge it lands
// outside the painted area, and two same-colored sections end up separated by a
// strip of the body's white.
for (const path of ['/', '/community/', '/community/program/', '/learn/', '/enterprise/', '/events/']) {
  test(`no unpainted strip between same-colored sections on ${path}`, async ({ page }) => {
    await preparePage(page);
    await page.goto(path);
    const gaps = await page.evaluate(() => {
      const secs = [...document.querySelectorAll('section')];
      const bad = [];
      for (let i = 0; i < secs.length - 1; i++) {
        const a = secs[i];
        const b = secs[i + 1];
        const abg = getComputedStyle(a).backgroundColor;
        const bbg = getComputedStyle(b).backgroundColor;
        const transparent = (c) => !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
        if (transparent(abg) || abg !== bbg) continue;
        const gap = Math.round(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom);
        if (gap > 0) bad.push({ i, gap, bg: abg, cls: a.className.slice(0, 50) });
      }
      return bad;
    });
    expect(gaps).toEqual([]);
  });
}

// --- Review findings 2, 4, 5 and 6 ---

test('a lead paragraph is centered under its own heading', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const offsets = await page.locator('.value-prop-text').evaluateAll((sections) => {
    const out = [];
    for (const sec of sections) {
      const h = sec.querySelector(':scope > h2');
      const p2 = sec.querySelector(':scope > p');
      if (!h || !p2) continue;
      const hr = h.getBoundingClientRect();
      const pr = p2.getBoundingClientRect();
      out.push(Math.round(Math.abs((hr.left + hr.right) / 2 - (pr.left + pr.right) / 2)));
    }
    return out;
  });
  expect(offsets.length).toBeGreaterThan(0);
  for (const off of offsets) expect(off).toBeLessThanOrEqual(2);
});

test('the heading signature stays out of cards', async ({ page }) => {
  await preparePage(page);
  for (const path of ['/events/', '/testimonials/', '/faq/']) {
    const res = await page.goto(path).catch(() => null);
    if (!res || !res.ok()) continue;
    const tagged = await page.locator('.feature-card h2, .faq-entry h2').evaluateAll(
      (els) => els
        .filter((e) => getComputedStyle(e, '::after').content !== 'none')
        .map((e) => `${location.pathname} ${e.textContent.trim().slice(0, 30)}`),
    );
    expect(tagged, `repeated-item heading carrying the section tab on ${path}`).toEqual([]);
  }
});

test('a page-level section heading still carries the signature', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const h2 = page.locator('section h2', { hasText: 'What you can build' }).first();
  const after = await h2.evaluate((el) => getComputedStyle(el, '::after').width);
  expect(after).toBe('42px');
});

test('every font weight the pages ask for has a face declared for it', async ({ page }) => {
  await preparePage(page);
  const missing = [];
  for (const path of ['/', '/community/', '/learn/']) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    // document.fonts.check() is no use here: it answers "can the browser render
    // this", which is true even when it has to substitute or synthesize. Compare
    // against the weights actually declared by @font-face instead.
    const gaps = await page.evaluate(() => {
      // document.fonts reports the family lowercased ("inter"); getComputedStyle
      // returns it as written ("Inter"). Compare case-insensitively or this
      // matches nothing and passes without testing anything.
      const declared = new Map();
      for (const f of document.fonts) {
        const fam = f.family.toLowerCase().replace(/["']/g, '');
        if (!declared.has(fam)) declared.set(fam, new Set());
        declared.get(fam).add(String(parseInt(f.weight, 10)));
      }
      const used = new Map();
      for (const el of document.querySelectorAll('body *, body svg text')) {
        if (!el.textContent || !el.textContent.trim()) continue;
        const cs = getComputedStyle(el);
        const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        if (!declared.has(fam)) continue;
        const w = String(parseInt(cs.fontWeight, 10));
        if (declared.get(fam).has(w)) continue;
        const key = `${fam} ${w}`;
        used.set(key, (used.get(key) || 0) + 1);
      }
      return [...used].map(([k, n]) => `${k} (${n} elements)`);
    });
    for (const g of gaps) missing.push(`${path}: ${g}`);
  }
  expect(missing).toEqual([]);
});
