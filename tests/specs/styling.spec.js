// Styling rules that are easy to regress and invisible in the markup: how body
// copy is set, how links are underlined, how wide a button is, and later the
// typeface and the design tokens. Everything here is measured in a real browser
// rather than asserted against the SCSS source.
import { test, expect } from '@playwright/test';
import { PAGES, preparePage } from './helpers.js';

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
  // Only this comparison discriminates: the old .btn-md was a fixed 120x50, so
  // both buttons were the same width and the height assertion below passed then
  // too. The height check is kept to catch a label wrapping inside the button.
  expect(wide.width).toBeGreaterThan(narrow.width);
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
// The anti-goal from the design doc: the inline .highlight-* backgrounds paint
// the full font em box, so too tight a line-height lets a highlight on one line
// cover the descenders of the plain text on the line above. Compare each
// highlight against the text rects on the line above it, not against the other
// highlight: two highlights sitting on different lines never touch each other
// no matter how badly the line-height is set.
const highlightsDoNotCoverTheLineAbove = async (page) => {
  await preparePage(page);
  await page.goto('/');
  const worst = await page.locator('.text-size-large').first().evaluate((h1) => {
    // Every line box of the plain text, via a Range over the text nodes.
    const lines = [];
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.parentElement.className.startsWith('highlight-')) continue;
      if (!n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width > 0) lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
    }
    let overlap = 0;
    for (const h of h1.querySelectorAll('[class^="highlight-"]')) {
      const b = h.getBoundingClientRect();
      for (const l of lines) {
        // Only lines strictly above this highlight.
        if (l.bottom <= b.top + 1) continue;
        if (l.top >= b.top - 1) continue;
        if (l.left >= b.right || l.right <= b.left) continue;
        overlap = Math.max(overlap, l.bottom - b.top);
      }
    }
    return Math.round(overlap);
  });
  expect(worst, 'a highlight is painting over the line above it').toBe(0);
};

test('a hero highlight does not paint over the line above it', async ({ page }) => {
  await highlightsDoNotCoverTheLineAbove(page);
});

test.describe('phone hero', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a hero highlight does not paint over the line above it on a phone', async ({ page }) => {
    await highlightsDoNotCoverTheLineAbove(page);
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

// --- prose link treatment ---

test('prose links use the brand link color, not the browser default', async ({ page }) => {
  await preparePage(page);
  for (const path of ['/faq/', '/community/program/']) {
    await page.goto(path);
    const colors = await page.locator('a:not(.btn)').evaluateAll((els) => [...new Set(
      els
        .filter((a) => !a.closest('nav, footer, .banner, .cookie-banner'))
        .map((a) => getComputedStyle(a).color),
    )]);
    expect(colors, `on ${path}`).toEqual(['rgb(13, 33, 146)']);
  }
});

// Review Focus 1: `a { color }` is unscoped, so it also reaches the chrome,
// which sits on dark grounds and sets its own colors.
test('nav, footer and banner links keep their own colors', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await expect(page.locator('footer a').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('keyboard focus gets at least the affordance a mouse hover gets', async ({ page }) => {
  await preparePage(page);
  await page.goto('/faq/');
  const link = page.locator('.faq-entry a').first();
  const alpha = (css) => {
    const m = css.match(/rgba?\(([^)]+)\)/);
    const parts = m ? m[1].split(',') : [];
    return parts.length === 4 ? Number(parts[3]) : 1;
  };
  // `a` carries a 0.2s transition, so read after it settles or the alpha comes
  // back mid-flight.
  const read = async () => {
    await page.waitForTimeout(350);
    return link.evaluate((e) => getComputedStyle(e).textDecorationColor);
  };

  await link.hover();
  const hovered = alpha(await read());
  await page.mouse.move(0, 0);
  await link.focus();
  const focused = alpha(await read());

  expect(hovered).toBeGreaterThan(0.9); // hover is the strong state today
  expect(focused).toBeGreaterThanOrEqual(hovered);
});

// --- icon chip and heading gutter ---

// Review Focus 5
test('the icon chip centers its glyph and stays square', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const chips = await page.locator('.icon-container').evaluateAll((els) => els.map((el) => {
    const c = el.getBoundingClientRect();
    const g = el.firstElementChild.getBoundingClientRect();
    return {
      w: Math.round(c.width),
      h: Math.round(c.height),
      above: Math.round(g.top - c.top),
      below: Math.round(c.bottom - g.bottom),
    };
  }));
  expect(chips.length).toBeGreaterThan(0);
  for (const c of chips) {
    expect(c.w, 'chip width').toBe(40);
    expect(c.h, 'chip height').toBe(40);
    expect(Math.abs(c.above - c.below), `glyph off center by ${c.above - c.below}px`)
      .toBeLessThanOrEqual(1);
  }
});

test('a section heading rule keeps the page gutter', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  const bleeding = await page.locator('section h2').evaluateAll((els) => els
    .map((e) => ({ t: e.textContent.trim().slice(0, 30), r: e.getBoundingClientRect() }))
    .filter((o) => o.r.left <= 0 || o.r.right >= window.innerWidth)
    .map((o) => o.t));
  expect(bleeding).toEqual([]);
});

// --- the navbar box model ---

// The page-level version of the assertion the previous change had to narrow to
// the hero buttons, because .navbar was already overflowing before it.
for (const width of [320, 375, 390]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });

    test('no page scrolls sideways', async ({ page }) => {
      await preparePage(page);
      for (const path of PAGES) {
        await page.goto(path);
        const over = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(over, `${path} overflows by ${over}px`).toBeLessThanOrEqual(0);
      }
    });
  });
}

// --- proof that the deletions below are inert ---
// Both of these pass before and after the classes come out. They are the
// evidence, not a new requirement.

// Review Focus 4
test('every section keeps its background through the class collapse', async ({ page }) => {
  await preparePage(page);
  for (const path of PAGES) {
    await page.goto(path);
    const bgs = await page.locator('section').evaluateAll(
      (els) => [...new Set(els.map((e) => getComputedStyle(e).backgroundColor))],
    );
    const allowed = ['rgba(0, 0, 0, 0)', 'rgb(246, 247, 249)'];
    expect(bgs.filter((b) => !allowed.includes(b)), `unexpected section background on ${path}`)
      .toEqual([]);
  }
});

// Review Focus 3: .text-justify sets text-align: left, which only matches the
// inherited value if nothing above it centers the text.
test('no element relies on a no-op class for its alignment or weight', async ({ page }) => {
  await preparePage(page);
  for (const path of ['/', '/community/', '/learn/', '/enterprise/']) {
    await page.goto(path);
    const leaning = await page.locator('.text-justify, .font-weight-300').evaluateAll((els) => {
      // `start` and `left` are the same thing in a left-to-right document, and
      // the computed value differs between a parent and a child that set it
      // explicitly. Normalize or every element looks like a false positive.
      const norm = (a) => (a === 'start' ? 'left' : a === 'end' ? 'right' : a);
      return els
        .map((e) => {
          const own = getComputedStyle(e);
          const parent = e.parentElement ? getComputedStyle(e.parentElement) : null;
          return {
            t: (e.textContent || '').trim().slice(0, 24),
            align: norm(own.textAlign),
            parentAlign: parent ? norm(parent.textAlign) : null,
            weight: own.fontWeight,
          };
        })
        .filter((o) => (o.parentAlign && o.parentAlign !== o.align) || o.weight !== '400');
    });
    expect(leaning, `a no-op class is load bearing on ${path}`).toEqual([]);
  }
});

// Replaces a test that ran only on the hero button row at 390px, where those
// buttons are width: 100% and stacked and so were never the ones at risk.
for (const width of [375, 1366]) {
  test.describe(`buttons at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('no button extends past the element containing it', async ({ page }) => {
      await preparePage(page);
      for (const path of ['/', '/community/program/', '/events/', '/learn/']) {
        await page.goto(path);
        const escaped = await page.locator('.btn').evaluateAll((btns) => btns
          .filter((b) => b.offsetParent !== null)
          .map((b) => {
            const br = b.getBoundingClientRect();
            const pr = b.parentElement.getBoundingClientRect();
            return { t: b.textContent.trim().slice(0, 32), over: Math.round(br.right - pr.right) };
          })
          .filter((o) => o.over > 1));
        expect(escaped, `button escaping its container on ${path}`).toEqual([]);
      }
    });
  });
}
