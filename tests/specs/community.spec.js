// Checks on the built community program page: the Meteor roster, and that a
// Meteor missing a photo or a LinkedIn URL degrades instead of breaking.
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildFixtureSite, builtFiles, SITE_DIR } from './helpers.js';

const programPage = builtFiles('index.html').find((f) => f.url === '/community/program/index.html');
const source = readFileSync(
  resolve(import.meta.dirname, '..', '..', 'content', 'community', 'program', '_index.md'),
  'utf8',
);

const [currentBlock, alumniBlock] = programPage.text.split('Alumni Meteors');
const meteorsBlock = currentBlock.split('Meet the Meteors')[1];
const names = (block) => [...block.matchAll(/<h3>(.*?)<\/h3>/g)].map((m) => m[1]);
// No closing quote: alumni cards carry extra classes (`feature-card width-20 ...`).
const cards = (block) => block.split('<div class="feature-card').slice(1);
const cardFor = (block, name) => cards(block).find((c) => c.includes(`<h3>${name}</h3>`));

// Only the two roster blocks. The rest of the page carries a section
// illustration under the same meteors/ path and a nomination-form CTA that
// reuses the btn-feature class, and neither is a Meteor card.
const roster = meteorsBlock + alumniBlock;

test('lists nine current Meteors', () => {
  expect(names(meteorsBlock)).toEqual([
    'Alex Mang',
    'Jose Maria Flores Zazo',
    'Manuel Zapf',
    'Naga Santhosh Reddy Vootukuri',
    'Nico Vermeir',
    'Rodrigo Díaz Concha',
    'Siri Varma Vegiraju',
    'Victor Aguayo',
    'Walter Coan',
  ]);
});

test('lists six alumni Meteors', () => {
  expect(names(alumniBlock)).toEqual([
    'Christophe Gigax',
    'Eduard Keilholz',
    'Edwin van Wijk',
    'Matheus Cruz',
    'Sander Molenkamp',
    'Will Velida',
  ]);
});

test('nobody is both a current and an alumni Meteor', () => {
  const overlap = names(meteorsBlock).filter((n) => names(alumniBlock).includes(n));
  expect(overlap).toEqual([]);
});

test('every portrait points at a real image file', () => {
  const srcs = [...roster.matchAll(/<img src="([^"]*)"/g)].map((m) => m[1]);
  expect(srcs.length).toBe(14);
  for (const src of srcs) {
    expect(src).toMatch(/\.(jpe?g|png|webp|svg)$/);
    // absURL yields an absolute URL here; the base only satisfies the parser.
    expect(existsSync(join(SITE_DIR, new URL(src, 'http://base.invalid').pathname))).toBe(true);
  }
});

test('every LinkedIn button points at linkedin.com', () => {
  const hrefs = [...roster.matchAll(/<a href="([^"]*)"[^>]*class="btn btn-feature[^"]*"/g)].map((m) => m[1]);
  expect(hrefs.length).toBe(8);
  for (const href of hrefs) expect(href).toContain('linkedin.com/in/');
});

test('a Meteor with no photo renders a name and bio but no image', () => {
  const card = cardFor(meteorsBlock, 'Victor Aguayo');
  expect(card).toBeDefined();
  expect(card).toContain('Technology Architect at Banco de Crédito');
  expect(card).not.toContain('<img');
});

test('a Meteor with no LinkedIn URL renders no LinkedIn button', () => {
  expect(cardFor(meteorsBlock, 'Victor Aguayo')).not.toContain('btn-feature');
});

test('a Meteor with a photo still renders both the image and the button', () => {
  const card = cardFor(meteorsBlock, 'Nico Vermeir');
  expect(card).toContain('meteors/nico-vermeir');
  expect(card).toContain('linkedin.com/in/nicovermeir');
});

test('no alumni entry carries a leftover bio', () => {
  expect(source.slice(source.indexOf('alumni_meteors:'))).not.toContain('bio:');
});

// The page has two renderings: the HTML above, and the Markdown one that feeds
// /community/program/index.md, llms.txt and llms-full.txt. A guard in only one
// of them leaves the other emitting the site root as a portrait or a profile
// link. The fixture page below carries all four combinations of a present and
// absent image and linkedin, which the real roster does not: every current
// Meteor has both fields or neither, so a single coupled guard would pass.
test.describe('a Meteor with only some of the optional fields', () => {
  const renderings = () => {
    const { dir } = buildFixtureSite('meteors', 'meteors.toml');
    const read = (f) => readFileSync(join(dir, 'community', 'program', f), 'utf8');
    return { html: read('index.html'), md: read('index.md') };
  };

  // In the HTML the portrait precedes the <h3>, so cards are sliced on the
  // card div. In the Markdown the heading comes first, so they are sliced on
  // the heading. Both helpers fail loudly when the card is absent, rather than
  // asserting against the wrong text.
  const htmlCard = (html, name) => {
    const found = cardFor(html, name);
    expect(found, `no HTML card for ${name}`).toBeDefined();
    return found;
  };
  const mdCard = (md, name) => {
    const from = md.indexOf(`### ${name}\n`);
    expect(from, `no Markdown card for ${name}`).toBeGreaterThan(-1);
    const next = md.indexOf('#', md.indexOf('\n', from + 1));
    return md.slice(from, next === -1 ? undefined : next);
  };

  test('keeps the portrait when only the LinkedIn URL is missing', () => {
    const { html, md } = renderings();
    expect(htmlCard(html, 'Fixture Photo Only')).toContain('alex-mang.jpg');
    expect(mdCard(md, 'Fixture Photo Only')).toContain('alex-mang.jpg');
  });

  test('keeps the LinkedIn link when only the portrait is missing', () => {
    const { html, md } = renderings();
    expect(htmlCard(html, 'Fixture Link Only')).toContain('in/fixture-link-only');
    expect(mdCard(md, 'Fixture Link Only')).toContain('in/fixture-link-only');
  });

  test('drops only the missing field, never the one that is present', () => {
    const { html, md } = renderings();
    expect(htmlCard(html, 'Fixture Photo Only')).not.toContain('btn-feature');
    expect(mdCard(md, 'Fixture Photo Only')).not.toContain('[LinkedIn]');
    expect(htmlCard(html, 'Fixture Link Only')).not.toContain('<img');
    expect(mdCard(md, 'Fixture Link Only')).not.toContain('![');
  });

  test('never emits the site root as a portrait or a profile link', () => {
    const { html, md } = renderings();
    expect(html).not.toMatch(/<img src="http:\/\/localhost:8181\/"/);
    expect(html).not.toMatch(/<a href="http:\/\/localhost:8181\/"[^>]*class="btn btn-feature/);
    expect(md).not.toContain('](http://localhost:8181/)');
  });

  test('an alumni Meteor with no portrait emits no image', () => {
    const { html, md } = renderings();
    expect(htmlCard(html, 'Fixture Alumni No Photo')).not.toContain('<img');
    expect(htmlCard(html, 'Fixture Alumni With Photo')).toContain('alex-mang.jpg');
    expect(mdCard(md, 'Fixture Alumni No Photo')).not.toContain('![');
  });
});
