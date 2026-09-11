import test from 'node:test';
import assert from 'node:assert/strict';

import en from './en.js';
import bn from './bn.js';
import { translate, localiseDigits, localiseDuration } from './index.js';

/**
 * A key present in en.js but missing from bn.js does not throw — it silently
 * renders English inside an otherwise Bangla page, which is the exact failure
 * this whole feature exists to remove and the one nobody notices in review.
 * This test is here so adding a string without translating it fails loudly.
 */
test('every English key has a Bangla translation', () => {
  const missing = Object.keys(en).filter(key => !(key in bn));
  assert.deepEqual(missing, [], `Untranslated keys in bn.js: ${missing.join(', ')}`);
});

test('bn.js defines no key that en.js does not', () => {
  const orphans = Object.keys(bn).filter(key => !(key in en));
  assert.deepEqual(orphans, [], `Keys in bn.js with no English original: ${orphans.join(', ')}`);
});

test('placeholders match between the two languages', () => {
  const placeholders = value => (value.match(/\{(\w+)\}/g) ?? []).sort();

  for (const [key, english] of Object.entries(en)) {
    assert.deepEqual(
      placeholders(bn[key]),
      placeholders(english),
      `Placeholder mismatch in "${key}"`,
    );
  }
});

test('translate', async (t) => {
  await t.test('substitutes placeholders', () => {
    assert.equal(
      translate('en', 'careers.showingCount', { shown: 4, total: 70 }),
      'Showing 4 of 70 paths',
    );
  });

  await t.test('falls back to English for an unknown language', () => {
    assert.equal(translate('fr', 'nav.alumni'), en['nav.alumni']);
  });

  await t.test('returns the key itself when nothing defines it', () => {
    assert.equal(translate('bn', 'nothing.defines.this'), 'nothing.defines.this');
  });
});

test('localiseDigits', async (t) => {
  await t.test('converts digits for Bangla', () => {
    assert.equal(localiseDigits(2026, 'bn'), '২০২৬');
  });

  await t.test('leaves English untouched', () => {
    assert.equal(localiseDigits(2026, 'en'), 2026);
  });

  await t.test('leaves a missing value alone', () => {
    assert.equal(localiseDigits(null, 'bn'), null);
  });
});

test('localiseDuration', async (t) => {
  await t.test('renders a range in Bengali numerals and units', () => {
    assert.equal(localiseDuration('3–5 yrs', 'bn'), '৩–৫ বছর')
  })

  await t.test('renders an open-ended duration', () => {
    assert.equal(localiseDuration('10+ yrs', 'bn'), '১০+ বছর')
  })

  await t.test('treats the singular and plural alike, as Bangla does', () => {
    assert.equal(localiseDuration('0–1 yr', 'bn'), '০–১ বছর')
  })

  await t.test('leaves English untouched', () => {
    assert.equal(localiseDuration('3–5 yrs', 'en'), '3–5 yrs')
  })

  await t.test('returns anything it cannot parse unchanged', () => {
    // An admin can type freely into the progression JSON; a guess would be
    // worse than the original.
    assert.equal(localiseDuration('about half a year', 'bn'), 'about half a year')
  })

  await t.test('covers every duration in the seeded career paths', () => {
    const seeded = [
      '0–1 yr', '1–3 yrs', '3–5 yrs', '5–8 yrs', '8+ yrs',
      '0–2 yrs', '2–4 yrs', '4–7 yrs', '7–10 yrs', '10+ yrs',
      '3–6 yrs', '6–9 yrs', '9+ yrs', '4–6 yrs', '6–8 yrs',
      '0–3 yrs', '9–12 yrs', '12+ yrs',
    ]
    const untranslated = seeded.filter(v => localiseDuration(v, 'bn') === v)
    assert.deepEqual(untranslated, [], `Not localised: ${untranslated.join(', ')}`)
  })
})
