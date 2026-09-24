/**
 * Tests for turning pdfjs text items into lined text, and for the name hint.
 *
 * Items are built by hand in the shape pdfjs returns — { str, transform,
 * width, height, hasEOL } — so each quirk the parser has to undo is pinned
 * down on its own. The corpus test (scripts/pii-audit/corpus.test.js) covers
 * real PDFs end to end.
 *
 * Run: npm test --prefix server
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { collapseLetterSpacing, repairBengaliVisualOrder, itemsToText, nameHintFromItems } from './pdfText.js';

/** A text item at (x, y) in a font of `size` points. */
const item = (str, { x = 0, y = 700, size = 11, width, eol = false } = {}) => ({
  str,
  transform: [size, 0, 0, size, x, y],
  width: width ?? str.length * size * 0.5,
  height: size,
  hasEOL: eol,
});

describe('collapseLetterSpacing', () => {
  it('rejoins a letter-spaced heading', () => {
    assert.equal(collapseLetterSpacing('M A R I A'), 'MARIA');
    assert.equal(collapseLetterSpacing('O ’ C O N N O R'), 'O’CONNOR');
  });

  it('leaves ordinary text alone', () => {
    for (const text of ['Grade A in Maths', 'I am a nurse', 'A B', 'B.Sc. (Hons)']) {
      assert.equal(collapseLetterSpacing(text), text);
    }
  });
});

describe('repairBengaliVisualOrder', () => {
  it('moves a pre-base vowel sign back after its consonant', () => {
    assert.equal(repairBengaliVisualOrder('িম'), 'মি');
    assert.equal(repairBengaliVisualOrder('েম'), 'মে');
  });

  it('rebuilds o-kar from its unmapped left half', () => {
    assert.equal(repairBengaliVisualOrder('\u0000মা'), 'মো');
  });

  it('never reorders inside an item, where the same bytes are correct text', () => {
    assert.equal(repairBengaliVisualOrder('কিম'), 'কিম');
  });

  it('drops unmapped glyphs it cannot recover', () => {
    assert.equal(repairBengaliVisualOrder('a\u0000b'), 'ab');
  });
});

describe('itemsToText', () => {
  it('keeps the line breaks pdfjs reports', () => {
    const text = itemsToText([
      item('Daniel Cook', { eol: true }),
      item('Head Chef', { y: 680 }),
    ]);
    assert.equal(text, 'Daniel Cook\nHead Chef');
  });

  it('breaks a line when the baseline moves even without a reported end', () => {
    const text = itemsToText([item('Name', { y: 700 }), item('Title', { y: 680 })]);
    assert.equal(text, 'Name\nTitle');
  });

  it('adds a space across a visible gap, as between table cells', () => {
    const text = itemsToText([
      item("Father's Name", { x: 0, width: 70 }),
      item(':', { x: 110, width: 3 }),
      item('Md. Abdul Jalil', { x: 120 }),
    ]);
    assert.equal(text, "Father's Name : Md. Abdul Jalil");
  });

  it('does not double the spaces pdfjs already supplies', () => {
    const text = itemsToText([item('Head', { x: 0, width: 20 }), item(' ', { x: 20, width: 3 }), item('Chef', { x: 23 })]);
    assert.equal(text, 'Head Chef');
  });

  it('drops the fake space pdfjs puts after a zero-width conjunct', () => {
    // 'শিক্ষক' as pdfjs returns it: িশ | ক্ষ (width 0) | ' ' (the conjunct's
    // advance) | ক — which used to read 'শিক্ষ ক'.
    const text = itemsToText([
      item('িশ', { x: 0, width: 8, size: 12 }),
      item('ক্ষ', { x: 8, width: 0, size: 12 }),
      item(' ', { x: 8, width: 10.6, size: 12 }),
      item('ক', { x: 15.9, width: 6.8, size: 12 }),
    ]);
    assert.equal(text, 'শিক্ষক');
  });

  it('keeps a real space after a zero-width glyph', () => {
    const text = itemsToText([
      item('ম', { x: 0, width: 5, size: 11 }),
      item('\u0000', { x: 5, width: 0, size: 11 }),
      item(' ', { x: 5, width: 4, size: 11 }),
      item('অ', { x: 8, width: 7, size: 11 }),
    ]);
    assert.equal(text, 'ম অ');
  });

  it('rebuilds a vowel split across items at a word start', () => {
    const text = itemsToText([item('\u0000', { x: 0, width: 6, size: 22 }), item('মা', { x: 6, size: 22 }), item('ছাঃ', { x: 20, size: 22 })]);
    assert.equal(text, 'মোছাঃ');
  });
});

describe('nameHintFromItems', () => {
  it('returns the largest type on the page', () => {
    const hint = nameHintFromItems([
      item('CONTACT', { size: 11, eol: true }),
      item('07700 900461', { y: 680, eol: true }),
      item('Daniel Cook', { y: 800, size: 24, eol: true }),
      item('Head Chef', { y: 770, size: 13 }),
    ]);
    assert.equal(hint, 'Daniel Cook');
  });

  it('joins a name split across two spans and collapses letter-spacing', () => {
    const hint = nameHintFromItems([
      item('M A R I A I S A B E L', { size: 24, eol: true }),
      item('', { eol: true }),
      item('S A N T O S', { y: 670, size: 24 }),
      item('Graphic Designer', { y: 640, size: 11 }),
    ]);
    assert.equal(hint, 'MARIAISABEL SANTOS');
  });

  it('steps over a document title set larger than the name', () => {
    const hint = nameHintFromItems([
      item('CURRICULUM VITAE', { size: 28, eol: true }),
      item('Md. Jahangir Alam', { y: 660, size: 18 }),
    ]);
    assert.equal(hint, 'Md. Jahangir Alam');
  });

  it('returns nothing for a largest line that is not a name', () => {
    assert.equal(nameHintFromItems([item('PROFILE', { size: 24 })]), null);
    assert.equal(nameHintFromItems([item('42 Software Projects', { size: 24 })]), null);
    assert.equal(nameHintFromItems([]), null);
  });
});
