/**
 * Tests for the side-by-side page the preview writes with --html.
 *
 * Run: npm test --prefix server
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildRows, countPlaceholders, renderDemoBody } from './demo-page.js';

describe('buildRows', () => {
  it('lines each masked line up with the line it replaced', () => {
    const rows = buildRows('Fahmida Akter\nFinancial Analyst\nNID No.: 198001234567891',
      '[NAME]\nFinancial Analyst\nNID No.: [ID]');
    assert.deepEqual(rows.map((r) => r.changed), [true, false, true]);
    const gone = rows[2].left.filter((s) => s.marked).map((s) => s.text).join('');
    const added = rows[2].right.filter((s) => s.marked).map((s) => s.text).join('');
    assert.equal(gone, '198001234567891');
    assert.equal(added, '[ID]');
  });

  it('keeps a multi-line value that became one line in a single row', () => {
    const rows = buildRows('Address:\nHouse 12, Road 5\nDhanmondi, Dhaka-1205\nSkills', 'Address:\n[ADDRESS]\nSkills');
    assert.equal(rows.filter((r) => r.changed).length, 1);
  });
});

describe('countPlaceholders', () => {
  it('counts only the placeholders the mask added', () => {
    assert.deepEqual(countPlaceholders('[NAME] Mailing Address', '[NAME] [NAME] [PHONE]'), { NAME: 1, PHONE: 1 });
  });
});

describe('renderDemoBody', () => {
  it('escapes the CV text, so a CV cannot inject markup into the page', () => {
    const html = renderDemoBody({
      file: '<b>cv</b>.pdf', uploadedAs: 'a guest', nameHint: null,
      original: 'Tanvir <script>alert(1)</script>', masked: '[NAME] <script>alert(1)</script>',
    });
    assert.ok(!html.includes('<script>alert(1)</script>'));
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(!html.includes('<b>cv</b>'));
  });

  it('states how many details were replaced', () => {
    const html = renderDemoBody({ file: 'cv.pdf', uploadedAs: 'a guest', nameHint: null,
      original: 'Mobile: 01712-000111', masked: 'Mobile: [PHONE]' });
    assert.match(html, /<strong>1<\/strong> personal detail was replaced/);
  });
});
