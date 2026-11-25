// The HTML helpers the static-build specs use to read headings, intros and
// meta tags. They parse instead of using regular expressions, so entities are
// decoded once and script content never counts as page text.
import { test, expect } from '@playwright/test';
import { htmlText, parseHtml } from './helpers.js';

test('htmlText strips tags and collapses whitespace', () => {
  expect(htmlText('<h1>Hi <em>there</em>\n  friend</h1>')).toBe('Hi there friend');
});

test('htmlText decodes entities once', () => {
  expect(htmlText('A &amp;lt; B &amp; C&#39;s &rsquo; &#x27;')).toBe("A &lt; B & C's ’ '");
});

test('htmlText drops script and style in any case', () => {
  expect(
    htmlText('<p>keep</p><SCRIPT>no</SCRIPT><script type="application/ld+json">{"a":1}</script><style>.x{}</style>'),
  ).toBe('keep');
});

test('htmlText does not mutate a parsed tree', () => {
  const root = parseHtml('<div><script>s</script><p>t</p></div>');
  htmlText(root);
  expect(root.querySelectorAll('script')).toHaveLength(1);
});

test('parseHtml decodes attribute values', () => {
  const root = parseHtml('<meta name="description" content="Tom &amp; Jerry&#39;s">');
  expect(root.querySelector('meta').getAttribute('content')).toBe("Tom & Jerry's");
});
